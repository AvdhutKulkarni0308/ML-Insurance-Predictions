// ============================================================================
// Main Server File - ML Insurance Predictions Dashboard
// ============================================================================

const readline = require('readline');
const { testConnection } = require('./config/database');
const MLModel = require('./models/MLModel');
const logger = require('./utils/logger');

// Create readline interface for console input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Display main menu
function displayMenu() {
    console.log('\n' + '='.repeat(70));
    console.log('           ML INSURANCE PREDICTIONS DASHBOARD');
    console.log('='.repeat(70));
    console.log('\n1. View All Predictions');
    console.log('2. View Prediction by ID');
    console.log('3. Insert New Prediction');
    console.log('4. Exit');
    console.log('\n' + '-'.repeat(70));
}

// Display predictions in formatted table
function displayPredictions(predictions) {
    if (!predictions || predictions.length === 0) {
        console.log('\nNo predictions found.');
        return;
    }
    
    console.log('\n' + '='.repeat(120));
    console.log(String('ID').padEnd(5) + String('Age').padEnd(6) + String('Sex').padEnd(8) + 
                String('BMI').padEnd(8) + String('Children').padEnd(10) + 
                String('Smoker').padEnd(10) + String('Region').padEnd(15) + 
                String('Predicted').padEnd(15) + String('Actual').padEnd(12));
    console.log('='.repeat(120));
    
    predictions.forEach(pred => {
        // Convert DECIMAL values from MySQL to numbers (they come as strings)
        const predictedCharge = pred.predicted_charge ? parseFloat(pred.predicted_charge) : null;
        const actualCharge = pred.actual_charge ? parseFloat(pred.actual_charge) : null;
        const bmi = pred.bmi ? parseFloat(pred.bmi) : '';
        
        console.log(
            String(pred.id || '').padEnd(5) +
            String(pred.age || '').padEnd(6) +
            String(pred.sex || '').padEnd(8) +
            String(bmi || '').padEnd(8) +
            String(pred.children || '').padEnd(10) +
            String(pred.smoker || '').padEnd(10) +
            String(pred.region || '').padEnd(15) +
            String(predictedCharge ? '$' + predictedCharge.toFixed(2) : 'N/A').padEnd(15) +
            String(actualCharge ? '$' + actualCharge.toFixed(2) : 'N/A').padEnd(12)
        );
    });
    
    console.log('='.repeat(120));
    console.log(`\nTotal Records: ${predictions.length}`);
}

// Handle menu choice
async function handleChoice(choice) {
    switch(choice) {
        case '1':
            await viewAllPredictions();
            break;
        case '2':
            await viewById();
            break;
        case '3':
            await insertNewPrediction();
            break;
        case '4':
            console.log('\nThank you for using ML Insurance Predictions Dashboard!');
            rl.close();
            process.exit(0);
            break;
        default:
            console.log('\nInvalid choice. Please enter 1-4.');
    }
}

// View all predictions
async function viewAllPredictions() {
    logger.info('User selected: View All Predictions');
    const result = await MLModel.getAllPredictions();
    
    if (result.success) {
        displayPredictions(result.data);
        logger.success(`Displayed ${result.data.length} predictions`);
    } else {
        console.log('\nError:', result.error);
        logger.error('Failed to retrieve predictions');
    }
    
    setTimeout(() => {
        displayMenu();
        promptUser();
    }, 1000);
}

// View by ID
async function viewById() {
    rl.question('\nEnter Prediction ID: ', async (id) => {
        logger.info(`User selected: View Prediction by ID: ${id}`);
        
        const result = await MLModel.getPredictionById(parseInt(id));
        
        if (result.success && result.data) {
            displayPredictions([result.data]);
            logger.success(`Retrieved prediction ID: ${id}`);
        } else {
            console.log('\nPrediction not found.');
            logger.warn(`Prediction ID ${id} not found`);
        }
        
        setTimeout(() => {
            displayMenu();
            promptUser();
        }, 1000);
    });
}

// Insert new prediction
async function insertNewPrediction() {
    logger.info('User selected: Insert New Prediction');
    
    console.log('\nEnter prediction details:');
    
    rl.question('Age: ', (age) => {
        rl.question('Sex (male/female): ', (sex) => {
            rl.question('BMI: ', (bmi) => {
                rl.question('Children: ', (children) => {
                    rl.question('Smoker (yes/no): ', (smoker) => {
                        rl.question('Region: ', async (region) => {
                            rl.question('Predicted Charge: ', async (predictedCharge) => {
                                const predictionData = {
                                    age: parseInt(age),
                                    sex: sex.trim(),
                                    bmi: parseFloat(bmi),
                                    children: parseInt(children),
                                    smoker: smoker.trim(),
                                    region: region.trim(),
                                    predicted_charge: parseFloat(predictedCharge)
                                };
                                
                                const result = await MLModel.insertPrediction(predictionData);
                                
                                if (result.success) {
                                    console.log('\n✓ Prediction inserted successfully!');
                                    console.log(`  ID: ${result.id}`);
                                    logger.success(`New prediction inserted with ID: ${result.id}`);
                                } else {
                                    console.log('\n✗ Error:', result.error);
                                    logger.error('Failed to insert prediction');
                                }
                                
                                setTimeout(() => {
                                    displayMenu();
                                    promptUser();
                                }, 1000);
                            });
                        });
                    });
                });
            });
        });
    });
}

// Prompt user for input
function promptUser() {
    rl.question('\nEnter your choice (1-4): ', (answer) => {
        handleChoice(answer.trim());
    });
}

// Initialize application
async function init() {
    console.log('\n' + '='.repeat(70));
    console.log('     Initializing ML Insurance Predictions Dashboard...');
    console.log('='.repeat(70));
    
    logger.info('Application started');
    
    // Test database connection
    const connected = await testConnection();
    
    if (connected) {
        logger.success('Database connection established');
        console.log('\n✓ Database connection successful!');
        console.log('\nDashboard ready!\n');
        
        // Display menu and prompt user
        displayMenu();
        promptUser();
    } else {
        logger.error('Database connection failed. Please check your MySQL configuration.');
        console.log('\n✗ Failed to connect to database. Please check your configuration.');
        console.log('Make sure MySQL is running and database is created.');
        rl.close();
        process.exit(1);
    }
}

// Handle application exit
process.on('SIGINT', () => {
    console.log('\n\nApplication shutting down...');
    logger.info('Application closed by user');
    rl.close();
    process.exit(0);
});

// Start application
init().catch(error => {
    logger.error('Application initialization failed', error);
    console.error('Error:', error);
    process.exit(1);
});

