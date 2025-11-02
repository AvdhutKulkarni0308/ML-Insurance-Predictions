# ML Insurance Predictions - Node.js Application

A Node.js application for managing Machine Learning predictions using MySQL database. This project implements a Linear Regression model for insurance charge predictions.

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)
## Features

- ✅ MySQL database integration
- ✅ CRUD operations for ML predictions
- ✅ Console-based dashboard
- ✅ Log file system
- ✅ Import predictions from Colab notebook
- ✅ View predictions by ID
- ✅ Insert new predictions

## Prerequisites

1. **Node.js** (v14 or higher)
   - Download from: https://nodejs.org/
   - Verify: `node --version`

2. **MySQL** (v5.7 or higher)
   - Download from: https://dev.mysql.com/downloads/
   - Verify: `mysql --version`

## Installation

1. **Clone the repository**
   ```bash
   git clone <https://github.com/AvdhutKulkarni0308/ML-Insurance-Predictions.git>
   cd "POE 3 C"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure database**
   - Create a `.env` file in the root directory
   - Add your MySQL credentials:
     ```
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=your_mysql_password
     DB_NAME=ml_insurance_db
     ```

4. **Initialize database**
   ```bash
   npm run init-db
   ```

5. **Insert test data (optional)**
   ```bash
   node scripts/insertTestData.js
   ```

## Usage

**Start the application:**
```bash
npm start
```

**Available Menu Options:**
1. View All Predictions - Display all predictions in a formatted table
2. View Prediction by ID - Search for a specific prediction by ID
3. Insert New Prediction - Add a new prediction to the database
4. Exit - Close the application

## Import Predictions from Colab

To import predictions from your Colab notebook:

1. Download `insurance_predictions.txt` from Google Colab
2. Place it in the project root directory
3. Run the import script:
   ```bash
   npm run import
   ```

The script will parse the file and insert all predictions into the database.

## Database Schema

**Table: ml_predictions**
- `id` - INT, PRIMARY KEY, AUTO_INCREMENT
- `age` - INT
- `sex` - VARCHAR(10)
- `bmi` - DECIMAL(5,2)
- `children` - INT
- `smoker` - VARCHAR(10)
- `region` - VARCHAR(20)
- `predicted_charge` - DECIMAL(10,2)
- `actual_charge` - DECIMAL(10,2), NULL
- `created_at` - TIMESTAMP

## Project Structure

```
POE 3 C/
├── config/
│   └── database.js          # Database connection configuration
├── models/
│   └── MLModel.js           # Database CRUD operations
├── utils/
│   └── logger.js            # Logging utility
├── scripts/
│   ├── initDatabase.js      # Database initialization
│   ├── insertTestData.js    # Test data insertion
│   ├── importPredictions.js # Import from Colab file
│   └── updatePredictions.js # Update existing predictions
├── database/
│   └── schema.sql           # Database schema
├── logs/
│   └── ml_predictions.log   # Application logs (auto-generated)
├── server.js                # Main application entry point
├── package.json             # Dependencies and scripts
├── .env                     # Environment variables (create this)
└── README.md               # This file
```

## Log Files

All operations are automatically logged to: `logs/ml_predictions.log`

Log entries include:
- Database queries
- User actions
- Success/error messages
- Timestamps

## ML Model Details

- **Algorithm**: Linear Regression
- **Domain**: Insurance
- **Dataset**: Insurance domain (1338 records)
- **Features**: age, sex, bmi, children, smoker, region
- **Target**: charges (insurance premium)
- **Model Performance**: R² Score = 0.78 (78% accuracy)
- **Training Platform**: Google Colab

## SQL Query Examples

```sql
-- Get all predictions
SELECT * FROM ml_predictions ORDER BY id ASC;

-- Get prediction by ID
SELECT * FROM ml_predictions WHERE id = 1;

-- Get predictions by region
SELECT * FROM ml_predictions WHERE region = 'southwest';

-- Get predictions by smoker status
SELECT * FROM ml_predictions WHERE smoker = 'yes';
```

## Scripts

- `npm start` - Start the application
- `npm run init-db` - Initialize database and create tables
- `npm run import` - Import predictions from insurance_predictions.txt

## Notes

- The ML model is trained in Google Colab
- Predictions are stored and managed in MySQL database
- All database operations are logged to `logs/ml_predictions.log`
- The application uses a console-based interface

## License

ISC

## Author
Avdhut B. Kulkarni

#
