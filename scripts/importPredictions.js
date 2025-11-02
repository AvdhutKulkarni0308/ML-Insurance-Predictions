// ============================================================================
// Import Script: Parse and Insert insurance_predictions.txt from Colab
// ============================================================================

const fs = require('fs');
const path = require('path');
const MLModel = require('../models/MLModel');
const { testConnection } = require('../config/database');
const logger = require('../utils/logger');

// Function to parse the input dictionary string from the text file
function parseInputDict(dictString) {
    try {
        // Clean up the string
        let cleaned = dictString.trim();
        
        // Remove outer braces if present
        if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
            cleaned = cleaned.slice(1, -1);
        }
        
        // Convert Python dict format to JavaScript object
        // Handle both single and double quotes
        const obj = {};
        const pairs = cleaned.split(',').map(p => p.trim());
        
        for (const pair of pairs) {
            const colonIndex = pair.indexOf(':');
            if (colonIndex === -1) continue;
            
            let key = pair.substring(0, colonIndex).trim();
            let value = pair.substring(colonIndex + 1).trim();
            
            // Remove quotes from key
            key = key.replace(/^['"]|['"]$/g, '');
            
            // Parse value (handle strings and numbers)
            if ((value.startsWith('"') && value.endsWith('"')) || 
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            } else if (!isNaN(value) && value !== '') {
                value = parseFloat(value);
            }
            
            obj[key] = value;
        }
        
        return obj;
    } catch (error) {
        logger.error(`Failed to parse input: ${dictString}`, error);
        return null;
    }
}

// Function to read and parse the insurance_predictions.txt file
function parsePredictionsFile(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            logger.error(`File not found: ${filePath}`);
            return null;
        }

        const fileContent = fs.readFileSync(filePath, 'utf8');
        const lines = fileContent.split('\n').filter(line => line.trim());
        
        // Skip header line if present
        let startIndex = 0;
        if (lines[0].includes('Input Values') || lines[0].includes('Predicted Charge')) {
            startIndex = 1;
        }

        const predictions = [];
        
        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line || line.startsWith('#')) continue; // Skip empty lines and comments

            // Handle different formats:
            // Format 1: "{'age': 25, ...},predicted_value"
            // Format 2: "age=25,sex=female,...,predicted_value"
            // Format 3: JSON format
            
            let inputDictString = '';
            let predictedCharge = null;
            
            // Try to find the predicted charge at the end
            // Look for a number at the end (might be separated by comma or space)
            const numberMatch = line.match(/(\d+\.?\d*)\s*$/);
            if (numberMatch) {
                predictedCharge = parseFloat(numberMatch[1]);
                // Find where the dictionary ends (before the last number)
                const dictEndIndex = line.lastIndexOf(numberMatch[0]);
                inputDictString = line.substring(0, dictEndIndex).trim();
                
                // Remove trailing comma if present
                if (inputDictString.endsWith(',')) {
                    inputDictString = inputDictString.slice(0, -1).trim();
                }
            } else {
                // Fallback: split by last comma
                const lastCommaIndex = line.lastIndexOf(',');
                if (lastCommaIndex === -1) {
                    logger.warn(`No predicted charge found on line ${i + 1}: ${line}`);
                    continue;
                }
                inputDictString = line.substring(0, lastCommaIndex).trim();
                predictedCharge = parseFloat(line.substring(lastCommaIndex + 1).trim());
            }
            
            if (isNaN(predictedCharge)) {
                logger.warn(`Invalid predicted charge on line ${i + 1}: ${line}`);
                continue;
            }

            const inputDict = parseInputDict(inputDictString);
            
            if (inputDict && inputDict.age && inputDict.sex && inputDict.bmi !== undefined) {
                predictions.push({
                    age: parseInt(inputDict.age),
                    sex: inputDict.sex.toLowerCase(),
                    bmi: parseFloat(inputDict.bmi),
                    children: parseInt(inputDict.children || 0),
                    smoker: inputDict.smoker ? inputDict.smoker.toLowerCase() : 'no',
                    region: inputDict.region ? inputDict.region.toLowerCase() : 'southeast',
                    predicted_charge: predictedCharge
                });
            } else {
                logger.warn(`Invalid input format on line ${i + 1}: ${line}`);
            }
        }

        return predictions;
    } catch (error) {
        logger.error('Failed to parse predictions file', error);
        return null;
    }
}

// Main import function
async function importPredictions() {
    console.log('\n' + '='.repeat(70));
    console.log('     Importing Predictions from insurance_predictions.txt');
    console.log('='.repeat(70));

    logger.info('Starting predictions import');

    // Test connection
    const connected = await testConnection();
    if (!connected) {
        console.log('\n✗ Database connection failed');
        process.exit(1);
    }

    // Try to find the file in common locations
    const possiblePaths = [
        path.join(__dirname, '..', 'insurance_predictions.txt'),
        path.join(process.cwd(), 'insurance_predictions.txt')
    ];

    let filePath = null;
    for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
            filePath = possiblePath;
            break;
        }
    }

    // If not found, ask user for path
    if (!filePath) {
        console.log('\n⚠ insurance_predictions.txt not found in common locations.');
        console.log('Please provide the full path to the file:');
        console.log('  Example: C:\\Users\\YourName\\Downloads\\insurance_predictions.txt');
        console.log('  Or place it in the project root directory\n');
        
        // You can also specify it here manually:
        // filePath = 'path/to/your/insurance_predictions.txt';
        
        // For now, let's try a default location or exit
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return new Promise((resolve) => {
            rl.question('Enter file path (or press Enter to exit): ', async (inputPath) => {
                rl.close();
                if (inputPath.trim()) {
                    filePath = inputPath.trim();
                    await processImport(filePath);
                } else {
                    console.log('Import cancelled.');
                    process.exit(0);
                }
                resolve();
            });
        });
    }

    await processImport(filePath);
}

// Process the import
async function processImport(filePath) {
    console.log(`\n📂 Reading file: ${filePath}\n`);

    const predictions = parsePredictionsFile(filePath);

    if (!predictions || predictions.length === 0) {
        console.log('✗ No valid predictions found in the file.');
        logger.error('No predictions to import');
        process.exit(1);
    }

    console.log(`✓ Found ${predictions.length} predictions to import\n`);

    // Insert each prediction
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < predictions.length; i++) {
        const pred = predictions[i];
        console.log(`Processing ${i + 1}/${predictions.length}: Age ${pred.age}, ${pred.sex}, ${pred.region}...`);
        
        const result = await MLModel.insertPrediction(pred);
        
        if (result.success) {
            successCount++;
            console.log(`  ✓ Inserted with ID: ${result.id}`);
        } else {
            errorCount++;
            console.log(`  ✗ Failed: ${result.error}`);
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log('     Import Summary');
    console.log('='.repeat(70));
    console.log(`Total predictions: ${predictions.length}`);
    console.log(`Successfully imported: ${successCount}`);
    console.log(`Failed: ${errorCount}`);
    console.log('='.repeat(70));

    logger.success(`Imported ${successCount} predictions from file`);

    // Show imported records
    if (successCount > 0) {
        console.log('\n📊 Fetching imported records...\n');
        const allResult = await MLModel.getAllPredictions();
        if (allResult.success && allResult.data.length > 0) {
            const recent = allResult.data.slice(0, successCount);
            console.log('Recent imports:');
            recent.forEach(pred => {
                const charge = pred.predicted_charge ? parseFloat(pred.predicted_charge) : 0;
                console.log(`  ID ${pred.id}: Age ${pred.age}, ${pred.sex}, ${pred.smoker === 'yes' ? 'Smoker' : 'Non-smoker'}, Region: ${pred.region}, Charge: $${charge.toFixed(2)}`);
            });
        }
    }

    process.exit(0);
}

// Run import
if (require.main === module) {
    importPredictions().catch(error => {
        logger.error('Import failed', error);
        console.error('\n✗ Import failed:', error.message);
        process.exit(1);
    });
}

module.exports = { importPredictions, parsePredictionsFile };

