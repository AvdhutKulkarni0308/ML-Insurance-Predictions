-- ============================================================================
-- MySQL Database Schema for ML Insurance Predictions
-- ============================================================================

-- Create Database
CREATE DATABASE IF NOT EXISTS ml_insurance_db;
USE ml_insurance_db;

-- Create ML Predictions Table
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
);

-- Create Indexes for Better Query Performance
CREATE INDEX idx_region ON ml_predictions(region);
CREATE INDEX idx_smoker ON ml_predictions(smoker);
CREATE INDEX idx_age ON ml_predictions(age);
CREATE INDEX idx_predicted_charge ON ml_predictions(predicted_charge);

-- Note: Use scripts/insertTestData.js to insert test data
-- Or import predictions using: npm run import

