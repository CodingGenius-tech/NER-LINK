require("dotenv").config({ path: "../../.env" });

const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.on("connect", () => {
  console.log("PostgreSQL client connected");
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error.message);
});

const testDatabaseConnection = async () => {
  const client = await pool.connect();

  try {
    const result = await client.query(`
      SELECT
        current_database() AS database_name,
        NOW() AS server_time,
        PostGIS_Version() AS postgis_version;
    `);

    return result.rows[0];
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  testDatabaseConnection,
};