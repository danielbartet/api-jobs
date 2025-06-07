const express = require("express");
const cors = require("cors");
const config = require("./config");
const leadRoutes = require("./routes/leadRoutes");
const logRoutes = require("./routes/logRoutes");

const app = express();

// Middleware de depuración CORS
app.use((req, res, next) => {
  console.log('Solicitud entrante:');
  console.log('Origin:', req.headers.origin);
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);
  next();
});

// Configuración CORS simplificada
app.use(cors({
  origin: ['https://jobsandjobs.com', process.env.FRONTEND_URL || 'http://localhost:8080'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
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