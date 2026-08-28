const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const healthRoutes = require("./routes/health.routes");
const userRoutes = require("./routes/user.routes");
const authRoutes = require("./routes/auth.routes");
const districtRoutes = require("./routes/district.routes");
const roadRoutes = require("./routes/road.routes");
const incidentRoutes = require("./routes/incident.routes");
const vehicleRoutes = require("./routes/vehicle.routes");
const vehicleLocationRoutes = require("./routes/vehicleLocation.routes");

const app = express();

// ================================
// Global Middleware
// ================================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ================================
// Root Route
// ================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to NER-LINK API",
  });
});

// ================================
// Application Routes
// ================================

app.use("/api/health", healthRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/districts", districtRoutes);
app.use("/api/roads", roadRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/vehicle-locations", vehicleLocationRoutes);

// ================================
// 404 Handler
// ================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

module.exports = app;