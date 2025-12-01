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
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const db = admin.database();
const app = express();

app.use(cors());
app.use(express.json());

// Ruta principal para guardar datos GPS
app.post("/gps", async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ error: "Faltan datos GPS" });
    }

    const point = {
      lat: Number(lat),
      lng: Number(lng),
      timestamp: Date.now(), // 🔥 Generado por servidor
    };

    await db.ref("datos/vehiculo1").set(point);

    return res.json({ ok: true });
  } catch (err) {
    console.error("Error POST /gps:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Test backend
app.get("/api/test", (req, res) => {
  res.json({ ok: true, message: "Backend LIVE" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
