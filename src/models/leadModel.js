const pool = require("../db");

const createLead = async (name, email, phone, source) => {
  const [result] = await pool.query(
    "INSERT INTO leads (name, email, phone, source) VALUES (?, ?, ?, ?)",
    [name, email, phone, source]
  );
  return result.insertId;
};

module.exports = { createLead };