import express from "express";
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

// Inicializar Firebase
const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://tu-proyecto.firebaseio.com",
});

const db = admin.database();

// Endpoint para recibir datos
app.post("/api/datos", async (req, res) => {
  try {
    const { lat, lng, ax, ay, az, timestamp } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ error: "Datos GPS inválidos" });
    }

    const ref = db.ref("vehiculos/vehiculo1");
    const newRef = ref.push();

    await newRef.set({
      lat,
      lng,
      ax,
      ay,
      az,
      timestamp: timestamp || new Date().toISOString(),
    });

    res.status(200).json({ message: "Datos guardados correctamente" });
  } catch (error) {
    console.error("Error al guardar en Firebase:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Prueba de conexión
app.get("/", (req, res) => {
  res.send("Backend funcionando correctamente 🚀");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor funcionando en puerto ${PORT}`));
