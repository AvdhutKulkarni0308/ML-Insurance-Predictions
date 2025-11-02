// ============================================================================
// Database Initialization Script
// ============================================================================

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDatabase() {
    let connection;
    
    try {
        // Connect to MySQL server (without database)
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });
        
        console.log('✓ Connected to MySQL server');
        
        // Create database
        const dbName = process.env.DB_NAME || 'ml_insurance_db';
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
        console.log(`✓ Database '${dbName}' created or already exists`);
        
        // Use database
        await connection.query(`USE ${dbName}`);
        
        // Create table first
        await connection.query(`
            CREATE TABLE IF NOT EXISTS ml_predictions (
                id INT PRIMARY KEY AUTO_INCREMENT,
                age INT NOT NULL,
                sex VARCHAR(10) NOT NULL,
                bmi DECIMAL(5,2) NOT NULL,
                children INT NOT NULL,
                smoker VARCHAR(10) NOT NULL,
                region VARCHAR(20) NOT NULL,
                predicted_charge DECIMAL(10,2) NOT NULL,
                actual_charge DECIMAL(10,2) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ Table created or already exists');
        
        // Create indexes (ignore if they already exist)
        const indexes = [
            { name: 'idx_region', sql: 'CREATE INDEX idx_region ON ml_predictions(region)' },
            { name: 'idx_smoker', sql: 'CREATE INDEX idx_smoker ON ml_predictions(smoker)' },
            { name: 'idx_age', sql: 'CREATE INDEX idx_age ON ml_predictions(age)' },
            { name: 'idx_predicted_charge', sql: 'CREATE INDEX idx_predicted_charge ON ml_predictions(predicted_charge)' }
        ];
        
        for (const index of indexes) {
            try {
                await connection.query(index.sql);
                console.log(`✓ Index '${index.name}' created`);
            } catch (error) {
                // Ignore duplicate key errors (index already exists)
                if (error.code === 'ER_DUP_KEYNAME' || error.message.includes('Duplicate key')) {
                    console.log(`  Index '${index.name}' already exists, skipping...`);
                } else {
                    throw error; // Re-throw if it's a different error
                }
            }
        }
        
        console.log('\n✓ Database initialization completed successfully!');
        console.log('  You can now run the application with: npm start\n');
        
    } catch (error) {
        console.error('✗ Database initialization failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run initialization
initDatabase();

