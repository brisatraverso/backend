import express from "express";
import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();
const app = express();
app.use(express.json());

// Seguridad básica con API Key
app.use((req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({ error: "No autorizado" });
  }
  next();
});

// Inicializar Firebase
const serviceAccount = JSON.parse(
  fs.readFileSync("./serviceAccountKey.json", "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://rastreo-gps-f15f7-default-rtdb.firebaseio.com/"
});

const db = admin.database();

// Endpoint para recibir datos
app.post("/api/datos", async (req, res) => {
  try {
    const { lat, lng, ax, ay, az, timestamp, imei } = req.body;

    if (!lat || !lng || !imei) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    const ref = db.ref(`rastreo/${imei}`);
    await ref.push({
      lat,
      lng,
      ax,
      ay,
      az,
      timestamp: timestamp || new Date().toISOString(),
    });

    res.send("OK");
  } catch (error) {
    console.error("Error al guardar en Firebase:", error);
    res.status(500).send("ERROR");
  }
});

// Prueba de conexión
app.get("/", (req, res) => {
  res.send("Backend funcionando correctamente");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor funcionando en puerto ${PORT}`));
