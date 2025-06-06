const db = require("../db");

const createLeadLogsTable = async () => {
    try {
        await db.query(`
      CREATE TABLE IF NOT EXISTS lead_logs (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP NOT NULL,
        path VARCHAR(255) NOT NULL,
        params JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log("Tabla lead_logs creada correctamente");
    } catch (error) {
        console.error("Error creando tabla lead_logs:", error);
        throw error;
    }
};

module.exports = {
    createLeadLogsTable
};
