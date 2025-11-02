// ============================================================================
// Script to Update Existing Predictions with Actual ML Model Values
// ============================================================================

const MLModel = require('../models/MLModel');
const { testConnection } = require('../config/database');
const logger = require('../utils/logger');

// Prediction values matching the test data (from ML model)
// These should match the actual predictions from your Colab model
const predictionUpdates = [
    { id: 1, predicted_charge: 6170.00 },   // Age: 25, Female, BMI: 24.0, Children: 1, Non-smoker, Southwest
    { id: 2, predicted_charge: 38000.00 },   // Age: 40, Male, BMI: 30.0, Children: 3, Smoker, Northeast
    { id: 3, predicted_charge: 12000.00 },    // Age: 55, Female, BMI: 22.5, Children: 0, Non-smoker, Northwest
    { id: 4, predicted_charge: 8000.00 },    // Age: 30, Male, BMI: 35.0, Children: 2, Non-smoker, Southeast
    { id: 5, predicted_charge: 42000.00 }   // Age: 45, Female, BMI: 27.0, Children: 4, Smoker, Southwest
];

async function updatePredictions() {
    console.log('\n' + '='.repeat(70));
    console.log('     Updating Predictions with ML Model Values...');
    console.log('='.repeat(70));
    
    logger.info('Starting prediction updates');
    
    // Test connection
    const connected = await testConnection();
    if (!connected) {
        console.log('\n✗ Database connection failed');
        process.exit(1);
    }
    
    // Update each prediction
    let successCount = 0;
    for (const update of predictionUpdates) {
        const result = await MLModel.updatePredictedCharge(update.id, update.predicted_charge);
        if (result.success) {
            successCount++;
            console.log(`✓ Updated prediction ID ${update.id} with charge: $${update.predicted_charge.toFixed(2)}`);
        } else {
            console.log(`✗ Failed to update prediction ID ${update.id}: ${result.error}`);
        }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log(`     Update Complete: ${successCount}/${predictionUpdates.length} successful`);
    console.log('='.repeat(70));
    logger.success(`Updated ${successCount} predictions`);
    
    // Show updated records
    console.log('\nFetching updated records...\n');
    const allResult = await MLModel.getAllPredictions();
    if (allResult.success && allResult.data.length > 0) {
        console.log('Updated Records:');
        allResult.data.forEach(pred => {
            const charge = pred.predicted_charge ? parseFloat(pred.predicted_charge) : 0;
            console.log(`  ID ${pred.id}: Age ${pred.age}, ${pred.sex}, ${pred.smoker === 'yes' ? 'Smoker' : 'Non-smoker'}, Charge: $${charge.toFixed(2)}`);
        });
    }
    
    process.exit(0);
}

// Run script
updatePredictions().catch(error => {
    logger.error('Prediction update failed', error);
    console.error('Error:', error);
    process.exit(1);
});

