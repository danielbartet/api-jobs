const express = require("express");
const { createLog, getLogs } = require("../models/logModel");
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// Endpoint para guardar logs
router.post("/save", async (req, res) => {
    try {
        const logEntry = req.body;

        if (!logEntry.timestamp || !logEntry.path || !logEntry.params) {
            return res.status(400).json({ error: "Faltan campos requeridos en el log" });
        }

        const logId = await createLog(logEntry);
        res.status(201).json({ success: true, logId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Endpoint para exportar logs a archivo
router.post("/export", async (req, res) => {
    try {
        const { startDate, endDate } = req.body;
        const logs = await getLogs(startDate || new Date(0), endDate || new Date());

        const content = logs.map(log =>
            `Fecha: ${log.timestamp}\nRuta: ${log.path}\nParámetros: ${JSON.stringify(log.params)}\n-------------------\n`
        ).join('\n');

        const fileName = `url-params-log-${new Date().toISOString().split('T')[0]}.txt`;
        const filePath = path.join(__dirname, '../../logs', fileName);

        // Asegurar que el directorio logs existe
        await fs.mkdir(path.join(__dirname, '../../logs'), { recursive: true });

        // Guardar el archivo
        await fs.writeFile(filePath, content, 'utf8');

        res.status(200).json({
            success: true,
            message: "Archivo generado con éxito",
            filePath: filePath
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al exportar logs" });
    }
});

module.exports = router;
