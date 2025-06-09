const express = require("express");
const cors = require("cors");
const config = require("./config");
const leadRoutes = require("./routes/leadRoutes");
const logRoutes = require("./routes/logRoutes");

const app = express();

// Middleware de depuración CORS detallado
app.use((req, res, next) => {
  console.log('\n=== Nueva Solicitud ===');
  console.log(`Tiempo: ${new Date().toISOString()}`);
  console.log('Método:', req.method);
  console.log('URL:', req.url);
  console.log('Origin:', req.headers.origin);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));

  // Agregar listener para la respuesta
  res.on('finish', () => {
    console.log('\n=== Respuesta ===');
    console.log('Status:', res.statusCode);
    console.log('Headers:', JSON.stringify(res.getHeaders(), null, 2));
    console.log('===================\n');
  });

  next();
});

// Configuración CORS básica - la configuración principal se maneja en Traefik
app.use(cors({
  origin: true, // Permitir todos los orígenes - Traefik se encargará de filtrar
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200,
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  maxAge: 86400 // 24 horas de cache para preflight
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