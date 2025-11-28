import express from "express";
import admin from "firebase-admin";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    project_id: process.env.FIREBASE_PROJECT_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const db = admin.database();

app.post("/gps", async (req, res) => {
  try {
    const { lat, lng, timestamp } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ error: "Faltan lat y lng" });
    }

    await db.ref("gpsData").push({
      lat,
      lng,
      timestamp: timestamp || Date.now()
    });

    res.status(200).json({ message: "Datos guardados correctamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar los datos" });
  }
});

const app = express();

app.use(cors());
app.use(express.json());

// RUTA TEST
app.get("/api/test", (req, res) => {
  res.json({ ok: true, message: "Backend is LIVE " });
});

// GUARDAR DATOS
app.post("/api/datos", async (req, res) => {
  try {
    const data = req.body;
    await db.ref("datos").push({
      ...data,
      timestamp: Date.now()
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUERTO PARA DEPLOY
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Backend running on port ${PORT}`)
);
