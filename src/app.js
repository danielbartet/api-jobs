const express = require("express");
const config = require("./config");
const leadRoutes = require("./routes/leadRoutes");
const logRoutes = require("./routes/logRoutes");

const app = express();

// Configuración de orígenes permitidos
const allowedOrigins = [
  'https://jobsandjobs.com',
  'http://localhost:3000',
  'http://localhost:8080',
  'http://localhost:5173',
  'http://localhost:5000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5000'
];

// Función para verificar origen
const isOriginAllowed = (origin) => {
  // Permitir requests sin origin (Postman, apps móviles)
  if (!origin) return true;
  return allowedOrigins.includes(origin);
};

// Middleware de logging
app.use((req, res, next) => {
  console.log(`🔍 ${req.method} ${req.path}`);
  console.log(`📍 Origin: ${req.headers.origin || 'No origin'}`);
  console.log(`✅ Allowed: ${isOriginAllowed(req.headers.origin)}`);
  next();
});

app.use(express.json());

// ✨ CORS MIDDLEWARE UNIFICADO ✨
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Solo establecer Access-Control-Allow-Origin si está permitido
  if (isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    console.log(`🎯 CORS: Origen ${origin || 'sin origin'} permitido`);
  } else {
    console.log(`❌ CORS: Origen ${origin} bloqueado`);
  }

  // Headers CORS estándar
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, X-Total-Count');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 horas

  // Manejar preflight OPTIONS
  if (req.method === 'OPTIONS') {
    console.log('🔄 Preflight request procesada');
    return res.status(204).end();
  }

  next();
});

// 🛣️ RUTAS
app.use("/api/leads", leadRoutes);
app.use("/api/logs", logRoutes);

// 🗄️ INICIALIZACIÓN DE BASE DE DATOS
const { createLeadLogsTable } = require("./migrations/createLeadLogsTable");

const initializeDatabase = async () => {
  try {
    await createLeadLogsTable();
    console.log("✅ Base de datos inicializada correctamente");
  } catch (error) {
    console.error("❌ Error inicializando base de datos:", error);
    process.exit(1);
  }
};

// 🔧 MIDDLEWARE DE MANEJO DE ERRORES
app.use((err, req, res, next) => {
  console.error('💥 Error capturado:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    origin: req.headers.origin
  });

  res.status(err.status || 500).json({
    error: true,
    message: process.env.NODE_ENV === 'production'
      ? 'Error interno del servidor'
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// 🩺 HEALTH CHECK
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    cors: {
      enabled: true,
      allowedOrigins: allowedOrigins
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

// 🚀 INICIAR SERVIDOR
app.listen(config.PORT, async () => {
  await initializeDatabase();
  console.log('\n🎉 ===== SERVIDOR INICIADO =====');
  console.log(`🚀 Puerto: ${config.PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 CORS habilitado para:`);
  allowedOrigins.forEach(origin => console.log(`   ✓ ${origin}`));
  console.log(`🩺 Health check: http://localhost:${config.PORT}/health`);
  console.log('================================\n');
});