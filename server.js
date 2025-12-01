import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    databaseURL: "https://rastreo-gps-f15f7-default-rtdb.firebaseio.com"
  });
}

const db = admin.database();

app.post("/gps", async (req, res) => {
  const { deviceId, lat, lng, timestamp } = req.body;

  if (!deviceId || lat == null || lng == null) {
    return res.status(400).json({ error: "Faltan datos GPS" });
  }

  await db.ref(`datos/${deviceId}`).set({
    lat,
    lng,
    timestamp: timestamp || Date.now()
  });

  res.json({ message: "Datos recibidos correctamente" });
});

app.get("/", (req, res) => res.send("API OK"));
app.listen(3000, () => console.log("Servidor escuchando en puerto 3000"));
