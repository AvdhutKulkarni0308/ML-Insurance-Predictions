// ============================================================================
// ML Model Operations - Database CRUD Operations
// ============================================================================

const { executeQuery } = require('../config/database');
const logger = require('../utils/logger');

// Insert a new prediction into database
async function insertPrediction(predictionData) {
    const { age, sex, bmi, children, smoker, region, predicted_charge, actual_charge = null } = predictionData;
    
    const sql = `INSERT INTO ml_predictions 
                 (age, sex, bmi, children, smoker, region, predicted_charge, actual_charge) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const params = [age, sex, bmi, children, smoker, region, predicted_charge, actual_charge];
    
    logger.query(`INSERT: Inserting prediction for age=${age}, region=${region}`);
    const result = await executeQuery(sql, params);
    
    if (result.success) {
        logger.success(`Prediction inserted successfully with ID: ${result.data.insertId}`);
        return { success: true, id: result.data.insertId, data: result.data };
    } else {
        logger.error(`Failed to insert prediction: ${result.error}`);
        return { success: false, error: result.error };
    }
}

// Get all predictions
async function getAllPredictions() {
    const sql = 'SELECT * FROM ml_predictions ORDER BY id ASC';
    
    logger.query('SELECT: Fetching all predictions');
    const result = await executeQuery(sql);
    
    if (result.success) {
        logger.info(`Retrieved ${result.data.length} predictions`);
        return { success: true, data: result.data };
    } else {
        logger.error(`Failed to fetch predictions: ${result.error}`);
        return { success: false, error: result.error };
    }
}

// Get predictions by specific condition
async function getPredictionsByCondition(condition) {
    // Build WHERE clause dynamically
    let sql = 'SELECT * FROM ml_predictions';
    const params = [];
    const conditions = [];
    
    if (condition.region) {
        conditions.push('region = ?');
        params.push(condition.region);
    }
    
    if (condition.smoker) {
        conditions.push('smoker = ?');
        params.push(condition.smoker);
    }
    
    if (condition.age) {
        conditions.push('age = ?');
        params.push(condition.age);
    }
    
    if (condition.min_age) {
        conditions.push('age >= ?');
        params.push(condition.min_age);
    }
    
    if (condition.max_age) {
        conditions.push('age <= ?');
        params.push(condition.max_age);
    }
    
    // Add WHERE clause only if we have conditions
    if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' ORDER BY id ASC';
    
    logger.query(`SELECT: Fetching predictions with condition: ${JSON.stringify(condition)}`);
    const result = await executeQuery(sql, params);
    
    if (result.success) {
        logger.info(`Retrieved ${result.data.length} predictions matching condition`);
        return { success: true, data: result.data };
    } else {
        logger.error(`Failed to fetch predictions: ${result.error}`);
        return { success: false, error: result.error };
    }
}

// Get prediction by ID
async function getPredictionById(id) {
    const sql = 'SELECT * FROM ml_predictions WHERE id = ?';
    
    logger.query(`SELECT: Fetching prediction with ID: ${id}`);
    const result = await executeQuery(sql, [id]);
    
    if (result.success) {
        if (result.data.length > 0) {
            logger.info(`Retrieved prediction ID: ${id}`);
            return { success: true, data: result.data[0] };
        } else {
            logger.warn(`No prediction found with ID: ${id}`);
            return { success: true, data: null };
        }
    } else {
        logger.error(`Failed to fetch prediction: ${result.error}`);
        return { success: false, error: result.error };
    }
}

// Update predicted charge
async function updatePredictedCharge(id, predicted_charge) {
    const sql = 'UPDATE ml_predictions SET predicted_charge = ? WHERE id = ?';
    
    logger.query(`UPDATE: Updating predicted charge for ID: ${id}`);
    const result = await executeQuery(sql, [predicted_charge, id]);
    
    if (result.success) {
        logger.success(`Updated prediction ID: ${id}`);
        return { success: true, data: result.data };
    } else {
        logger.error(`Failed to update prediction: ${result.error}`);
        return { success: false, error: result.error };
    }
}

// Get statistics
async function getStatistics() {
    const sql = `
        SELECT 
            COUNT(*) as total_predictions,
            AVG(predicted_charge) as avg_predicted_charge,
            MIN(predicted_charge) as min_predicted_charge,
            MAX(predicted_charge) as max_predicted_charge,
            COUNT(DISTINCT region) as unique_regions,
            COUNT(CASE WHEN smoker = 'yes' THEN 1 END) as smokers_count,
            COUNT(CASE WHEN smoker = 'no' THEN 1 END) as non_smokers_count
        FROM ml_predictions
    `;
    
    logger.query('SELECT: Fetching statistics');
    const result = await executeQuery(sql);
    
    if (result.success) {
        logger.info('Statistics retrieved successfully');
        return { success: true, data: result.data[0] };
    } else {
        logger.error(`Failed to fetch statistics: ${result.error}`);
        return { success: false, error: result.error };
    }
}

module.exports = {
    insertPrediction,
    getAllPredictions,
    getPredictionsByCondition,
    getPredictionById,
    updatePredictedCharge,
    getStatistics
};

