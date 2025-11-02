// ============================================================================
// Script to Insert Test Data (5 predictions from Colab)
// ============================================================================

const MLModel = require('../models/MLModel');
const { testConnection } = require('../config/database');
const logger = require('../utils/logger');

// Test data from Colab predictions
const testPredictions = [
    {
        age: 25,
        sex: 'female',
        bmi: 24.0,
        children: 1,
        smoker: 'no',
        region: 'southwest',
        predicted_charge: 6170.00  // Approximate based on model
    },
    {
        age: 40,
        sex: 'male',
        bmi: 30.0,
        children: 3,
        smoker: 'yes',
        region: 'northeast',
        predicted_charge: 38000.00  // Smokers have higher charges
    },
    {
        age: 55,
        sex: 'female',
        bmi: 22.5,
        children: 0,
        smoker: 'no',
        region: 'northwest',
        predicted_charge: 12000.00
    },
    {
        age: 30,
        sex: 'male',
        bmi: 35.0,
        children: 2,
        smoker: 'no',
        region: 'southeast',
        predicted_charge: 8000.00
    },
    {
        age: 45,
        sex: 'female',
        bmi: 27.0,
        children: 4,
        smoker: 'yes',
        region: 'southwest',
        predicted_charge: 42000.00
    }
];

async function insertTestData() {
    console.log('\n' + '='.repeat(70));
    console.log('     Inserting Test Predictions...');
    console.log('='.repeat(70));
    
    logger.info('Starting test data insertion');
    
    // Test connection
    const connected = await testConnection();
    if (!connected) {
        console.log('\n✗ Database connection failed');
        process.exit(1);
    }
    
    // Insert each prediction
    let successCount = 0;
    for (const prediction of testPredictions) {
        const result = await MLModel.insertPrediction(prediction);
        if (result.success) {
            successCount++;
            console.log(`✓ Inserted prediction ${successCount}/${testPredictions.length}`);
        } else {
            console.log(`✗ Failed to insert prediction: ${result.error}`);
        }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log(`     Test Data Insertion Complete: ${successCount}/${testPredictions.length} successful`);
    console.log('='.repeat(70));
    logger.success(`Inserted ${successCount} test predictions`);
    
    process.exit(0);
}

// Run script
insertTestData().catch(error => {
    logger.error('Test data insertion failed', error);
    console.error('Error:', error);
    process.exit(1);
});

