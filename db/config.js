const mysql = require('mysql2');


// Create the connection pool with error handling
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Handling connection errors
pool.on('error', (err) => {
    console.error('MySQL Pool Error:', err);
    // Additional logic can be added here, such as retrying the connection or sending an alert
});

// Promise-based pool export
module.exports = pool.promise();

