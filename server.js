import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const FIREBASE_URL = process.env.FIREBASE_URL; // viene del .env

app.post("/api/datos", async (req, res) => {
  try {
    const { lat, lng, ax, ay, az } = req.body;
    console.log("Datos recibidos:", req.body);

    // timestamp para registrar en Firebase
    const timestamp = new Date().toISOString();
    const datos = { lat, lng, ax, ay, az, timestamp };

    // Envio a Firebase
    await axios.post(`${FIREBASE_URL}/datos.json`, datos);
    res.status(200).json({ message: "Datos enviados a Firebase correctamente" });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Error al enviar a Firebase" });
  }
});

app.listen(PORT, () => console.log(`Servidor funcionando en puerto ${PORT}`));
