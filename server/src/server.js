const app = require("./app");
const { testDatabaseConnection } = require("./config/database");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  const databaseConnected = await testDatabaseConnection();

  if (!databaseConnected) {
    console.error("Server startup aborted because database connection failed.");
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log("========================================");
    console.log("       NER-LINK BACKEND SERVER");
    console.log("========================================");
    console.log(`Server running on: http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log("========================================");
  });
};

startServer();