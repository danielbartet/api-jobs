const express = require("express");
const config = require("./config");
const leadRoutes = require("./routes/leadRoutes");
const logRoutes = require("./routes/logRoutes");

const app = express();

// Middleware de logging CORS para diagnóstico
app.use((req, res, next) => {
  console.log('=== CORS Debug ===');
  console.log('Method:', req.method);
  console.log('Origin:', req.headers.origin);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  next();
});

app.use(express.json());

// Manejo específico de OPTIONS para CORS preflight
app.options('*', (req, res) => {
  console.log('=== OPTIONS Request ===');
  console.log('Origin:', req.headers.origin);

  res.setHeader('Access-Control-Allow-Origin', 'https://jobsandjobs.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '3600');

  res.status(204).send();
});

// CORS para todas las demás rutas
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://jobsandjobs.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range');
  next();
});

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