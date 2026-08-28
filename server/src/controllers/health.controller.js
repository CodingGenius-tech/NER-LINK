const { pool } = require("../config/database");

const checkDatabaseHealth = async (req, res) => {
  try {
    const databaseResult = await pool.query(
      "SELECT current_database() AS database_name, NOW() AS server_time"
    );

    const postgisResult = await pool.query(
      "SELECT PostGIS_Version() AS postgis_version"
    );

    res.status(200).json({
      success: true,
      message: "Database connection is healthy",
      database: {
        name: databaseResult.rows[0].database_name,
        serverTime: databaseResult.rows[0].server_time,
      },
      postgis: {
        version: postgisResult.rows[0].postgis_version,
      },
    });
  } catch (error) {
    console.error("Database health check failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
};

module.exports = {
  checkDatabaseHealth,
};