// ============================================================================
// Database Configuration and Connection Pool
// ============================================================================

const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ml_insurance_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✓ Database connection successful');
        connection.release();
        return true;
    } catch (error) {
        console.error('✗ Database connection failed:', error.message);
        return false;
    }
}

// Execute query function
async function executeQuery(sql, params = []) {
    try {
        const [results] = await pool.execute(sql, params);
        return { success: true, data: results };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

module.exports = {
    pool,
    testConnection,
    executeQuery
};

