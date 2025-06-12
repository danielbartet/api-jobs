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
router.post("/export", async (req, res) => {
    try {
        const { startDate, endDate, format = 'json' } = req.body;
        const logs = await getLogs(startDate || new Date(0), endDate || new Date());

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
