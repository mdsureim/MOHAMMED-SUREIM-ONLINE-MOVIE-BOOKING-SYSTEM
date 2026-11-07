// ====================================================================
// MYSQL DATABASE CONNECTION CONFIGURATION (db.js)
// ====================================================================
// Credentials: username: root, password: root, database: movie_booking_db
// ====================================================================

const mysql = require('mysql2');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'movie_booking_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
};

// Create a connection pool for robust, high-performance database queries
const pool = mysql.createPool(dbConfig);

// Test the connection pool on initialization
pool.getConnection((err, conn) => {
  if (err) {
    console.error('⚠️ MySQL Connection Error (' + err.code + '): ' + err.message);
  } else {
    console.log(`✅ Connected successfully to MySQL Server at ${dbConfig.host}:${dbConfig.port}`);
    console.log(`🗄️ Active Database: '${dbConfig.database}' (User: '${dbConfig.user}')`);
    conn.release();
  }
});

module.exports = pool;
