const express = require("express");
const cors = require("cors");
const config = require("./config");
const leadRoutes = require("./routes/leadRoutes");
const logRoutes = require("./routes/logRoutes");

const app = express();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [process.env.FRONTEND_URL || "http://localhost:8080", "https://jobsandjobs.com"];
    callback(null, origin && allowedOrigins.indexOf(origin) !== -1 ? origin : allowedOrigins[0]);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(express.json());

// Rutas
app.use("/api/leads", leadRoutes);
app.use("/api/logs", logRoutes);

// Inicializar tablas
const { createLeadLogsTable } = require("./migrations/createLeadLogsTable");

const initializeDatabase = async () => {
  try {
    await createLeadLogsTable();
    console.log("Base de datos inicializada correctamente");
  } catch (error) {
    console.error("Error inicializando base de datos:", error);
    process.exit(1);
  }
};

app.listen(config.PORT, async () => {
  await initializeDatabase();
  console.log(`🚀 Servidor corriendo en ${config.PORT}`);
});