require("dotenv").config();

const app = require("./app");
const { testDatabaseConnection } = require("./config/database");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const database = await testDatabaseConnection();

    console.log("========================================");
    console.log("      POSTGRESQL CONNECTION SUCCESS");
    console.log("========================================");
    console.log("Database:", database.database_name);
    console.log("PostGIS:", database.postgis_version);
    console.log("Server time:", database.server_time);
    console.log("========================================");

    app.listen(PORT, () => {
      console.log("========================================");
      console.log("       NER-LINK BACKEND SERVER");
      console.log("========================================");
      console.log(`Server running on: http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(
        `Database health: http://localhost:${PORT}/api/health/db`
      );
      console.log("========================================");
    });
  } catch (error) {
    console.error("========================================");
    console.error("       SERVER STARTUP FAILED");
    console.error("========================================");
    console.error("Reason:", error.message);
    console.error("========================================");

    process.exit(1);
  }
};

startServer();