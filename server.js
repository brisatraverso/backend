import express from "express";
import { db, ref, set } from "./firebase.js";

const app = express();
app.use(express.json());

app.post("/gps", (req, res) => {
  const { deviceId, lat, lng, speed, timestamp } = req.body;

  if (!deviceId || !lat || !lng) {
    return res.status(400).json({ msg: "Datos incompletos" });
  }

  set(ref(db, "devices/" + deviceId), {
    lat,
    lng,
    speed,
    timestamp: timestamp ?? Date.now(),
  })
  .then(() => res.status(200).json({ msg: "OK" }))
  .catch((err) => res.status(500).json({ error: err.message }));
});

app.listen(3000, () => console.log("Backend OK en puerto 3000"));
