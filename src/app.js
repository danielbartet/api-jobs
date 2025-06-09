const express = require("express");
const cors = require("cors");
const config = require("./config");
const leadRoutes = require("./routes/leadRoutes");
const logRoutes = require("./routes/logRoutes");

const app = express();

// Middleware básico de CORS - permitimos que Traefik maneje los detalles
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Rutas
app.use("/api/leads", leadRoutes);

// Rutas de logs
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

// Middleware de manejo de errores CORS
app.use((err, req, res, next) => {
  if (err.name === 'CORSError') {
    console.error('Error CORS:', {
      message: err.message,
      origin: req.headers.origin,
      method: req.method,
      path: req.path,
      headers: req.headers
    });
    return res.status(403).json({
      error: 'CORS Error',
      message: err.message,
      origin: req.headers.origin
    });
  }
  next(err);
});

app.listen(config.PORT, async () => {
  await initializeDatabase();
  console.log(`🚀 Servidor corriendo en ${config.PORT}`);
});