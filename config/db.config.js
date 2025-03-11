//Import the mysql module Promise Wrapper
const mysql = require("mysql2/promise");
//Prepare connection parameters we use to connect to the database
const dbConfig = {
  connectionLimit: 10, // max number of connections
  password: process.env.DB_PASS,
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
};
//create a connection pool
const pool = mysql.createPool(dbConfig);
// Prepare a function that will execute SQL queries asynchronously
async function query(sql, params) {
  try {
    const [rows, fields] = await pool.execute(sql, params);
    return rows;
  } catch (err) {
    console.error("Database query error:", err.code || err.message);
    if (err.code === "ECONNREFUSED") {
      console.error("Database connection was refused. Check DB configuration.");
    } else {
      console.error("Query execution failed. SQL:", sql, "Params:", params);
    }
    throw err; // Re-throw for higher-level error handling
  }
}

// Export the query function for use in the application
module.exports = { query };
