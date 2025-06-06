const express = require("express");
const { createLead } = require("../models/leadModel");

const router = express.Router();

router.post("/leads", async (req, res) => {
  try {
    const { name, email, phone, source } = req.body;
    if (!name || !email || !phone || !source) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const leadId = await createLead(name, email, phone, source);
    res.status(201).json({ message: "Lead guardado con éxito", leadId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;