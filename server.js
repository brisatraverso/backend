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

// server.js (fragmento completo de /gps)
app.post("/gps", async (req, res) => {
  try {
    const { deviceId = "vehiculo1", lat, lng, timestamp } = req.body;

    // Validación básica: lat/lng deben existir y no ser 0
    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ error: "Faltan datos GPS" });
    }
    const latN = Number(lat);
    const lngN = Number(lng);
    if (!isFinite(latN) || !isFinite(lngN) || latN === 0 || lngN === 0) {
      return res.status(400).json({ error: "Coordenadas inválidas" });
    }

    // Normalizar timestamp a ms
    let ts = timestamp !== undefined && timestamp !== null ? Number(timestamp) : Date.now();
    if (ts < 1e12) ts = ts * 1000;

    const point = {
      lat: latN,
      lng: lngN,
      timestamp: ts,
    };

    // 1) Guardar ÚLTIMO punto en datos/{deviceId} (objeto único, no push)
    await db.ref(`datos/${deviceId}`).set(point);

    // 2) Guardar en historial por día (push)
    const dateKey = new Date(ts).toISOString().split("T")[0]; // YYYY-MM-DD
    await db.ref(`historial/${deviceId}/${dateKey}`).push(point);

    return res.json({ ok: true, deviceId });
  } catch (err) {
    console.error("Error POST /gps:", err);
    return res.status(500).json({ error: err.message });
  }
});


// Ruta para verificar que el backend responde correctamente
app.get("/api/test", (req, res) => {
  res.json({ ok: true, message: "Backend is LIVE" });
});

// Ruta para obtener historial por fecha desde el frontend
app.get("/historial/:deviceId/:fecha", async (req, res) => {
  try {
    const { deviceId, fecha } = req.params;
    const refPath = `historial/${deviceId}/${fecha}`;

    const snapshot = await db.ref(refPath).once("value");
    const data = snapshot.val() || {};

    return res.json(data);
  } catch (error) {
    console.error("Error GET historial:", error);
    res.status(500).json({ error: error.message });
  }
});

// Puerto de servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
