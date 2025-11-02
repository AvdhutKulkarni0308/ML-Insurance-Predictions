// ============================================================================
// Log File Utility
// ============================================================================

const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '..', 'logs');
const logFile = path.join(logDir, 'ml_predictions.log');

// Ensure logs directory exists
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Log levels
const LOG_LEVELS = {
    INFO: 'INFO',
    ERROR: 'ERROR',
    WARN: 'WARN',
    QUERY: 'QUERY',
    SUCCESS: 'SUCCESS'
};

// Function to write log to file and console
function log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;
    
    // Log to console
    console.log(logMessage);
    if (data) {
        console.log(JSON.stringify(data, null, 2));
    }
    
    // Log to file
    const fileMessage = data 
        ? `${logMessage}\n${JSON.stringify(data, null, 2)}\n`
        : `${logMessage}\n`;
    
    fs.appendFileSync(logFile, fileMessage, 'utf8');
}

// Convenience functions
const logger = {
    info: (message, data) => log(LOG_LEVELS.INFO, message, data),
    error: (message, data) => log(LOG_LEVELS.ERROR, message, data),
    warn: (message, data) => log(LOG_LEVELS.WARN, message, data),
    query: (message, data) => log(LOG_LEVELS.QUERY, message, data),
    success: (message, data) => log(LOG_LEVELS.SUCCESS, message, data)
};

module.exports = logger;

