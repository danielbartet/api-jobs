const db = require("../db");

const createLog = async (logEntry) => {
    try {
        const { timestamp, path, params } = logEntry;
        const query = `
      INSERT INTO lead_logs (timestamp, path, params)
      VALUES ($1, $2, $3)
      RETURNING id
    `;
        const values = [timestamp, path, JSON.stringify(params)];
        const result = await db.query(query, values);
        return result.rows[0].id;
    } catch (error) {
        console.error("Error al guardar log:", error);
        throw error;
    }
};

const getLogs = async (startDate, endDate) => {
    try {
        const query = `
      SELECT * FROM lead_logs 
      WHERE timestamp BETWEEN $1 AND $2
      ORDER BY timestamp DESC
    `;
        const result = await db.query(query, [startDate, endDate]);
        return result.rows;
    } catch (error) {
        console.error("Error al obtener logs:", error);
        throw error;
    }
};

module.exports = {
    createLog,
    getLogs
};
