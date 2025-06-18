const express = require("express");
const { createLog, getLogs } = require("../models/logModel");
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// Endpoint para guardar logs
router.post("/save", async (req, res) => {
    try {
        const logEntry = req.body;

        // Log detallado de la petición recibida
        console.log('Recibida petición POST /save:', {
            body: logEntry,
            headers: req.headers,
            method: req.method
        });

        // Log detallado de los campos requeridos
        console.log('Validación de campos:', {
            hasTimestamp: Boolean(logEntry.timestamp),
            timestampType: typeof logEntry.timestamp,
            timestampValue: logEntry.timestamp,
            hasPath: Boolean(logEntry.path),
            pathType: typeof logEntry.path,
            pathValue: logEntry.path,
            hasParams: Boolean(logEntry.params),
            paramsType: typeof logEntry.params,
            paramsValue: logEntry.params
        });

        if (!logEntry.timestamp || !logEntry.path || !logEntry.params) {
            console.log('Error: Faltan campos requeridos:', {
                missing: {
                    timestamp: !logEntry.timestamp,
                    path: !logEntry.path,
                    params: !logEntry.params
                }
            });
            return res.status(400).json({
                error: "Faltan campos requeridos en el log",
                missing: {
                    timestamp: !logEntry.timestamp,
                    path: !logEntry.path,
                    params: !logEntry.params
                }
            });
        }

        const logId = await createLog(logEntry);
        console.log('Log guardado exitosamente:', { logId });
        res.status(201).json({ success: true, logId });
    } catch (error) {
        console.error('Error al guardar log:', error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Endpoint para exportar logs como JSON
router.get("/export", async (req, res) => {
    try {
        // 🔑 VERIFICACIÓN DE API KEY
        const apiKey = req.headers['x-api-key'] || req.query.apiKey;
        const validApiKey = process.env.LOGS_API_KEY || 'clave-super-secreta-logs-2024';

        console.log('Intento de acceso a /export:', {
            hasApiKey: Boolean(apiKey),
            providedKey: apiKey ? `${apiKey.substring(0, 8)}...` : 'none',
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.headers['user-agent']
        });

        if (!apiKey || apiKey !== validApiKey) {
            console.warn('🚫 Acceso denegado a /export - API Key inválida:', {
                providedKey: apiKey,
                ip: req.ip || req.connection.remoteAddress
            });

            return res.status(401).json({
                success: false,
                error: "API Key requerida o inválida",
                message: "Acceso no autorizado. Proporciona una API Key válida en el header 'x-api-key' o como parámetro 'apiKey'"
            });
        }

        console.log('✅ Acceso autorizado a /export');

        const { startDate, endDate, format = 'json', limit = 1000 } = req.query;

        // Convertir strings a Date objects si se proporcionan
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date();

        const logs = await getLogs(start, end, parseInt(limit));

        console.log(`📊 Exportando ${logs.length} logs`);

        // Si no hay logs
        if (logs.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No se encontraron logs en el rango especificado",
                count: 0,
                logs: []
            });
        }

        // Si quiere formato texto (opcional)
        if (format === 'text') {
            const content = logs.map(log =>
                `Fecha: ${log.timestamp}\nRuta: ${log.path}\nParámetros: ${JSON.stringify(log.params)}\n-------------------\n`
            ).join('\n');

            return res.status(200).json({
                success: true,
                message: "Logs exportados en formato texto",
                count: logs.length,
                format: 'text',
                content: content
            });
        }

        // Formato JSON (por defecto)
        res.status(200).json({
            success: true,
            message: "Logs exportados exitosamente",
            count: logs.length,
            dateRange: {
                startDate: startDate || 'Desde el inicio',
                endDate: endDate || 'Hasta ahora'
            },
            logs: logs
        });

    } catch (error) {
        console.error('Error al exportar logs:', error);
        res.status(500).json({
            success: false,
            error: "Error al exportar logs",
            details: error.message
        });
    }
});

module.exports = router;
