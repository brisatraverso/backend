import express from 'express'
import admin from 'firebase-admin'
import dotenv from 'dotenv'

dotenv.config()
const app = express()
app.use(express.json())

const admin = require('firebase-admin');

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    project_id: process.env.FIREBASE_PROJECT_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  }),
  databaseURL: process.env.FIREBASE_DB_URL
})

const db = admin.database()

// RUTA TEST 🧪
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend ok' })
})

// RUTA PARA GUARDAR DATOS DEL GPS 📍⚙️
app.post('/api/datos', async (req, res) => {
  try {
    const { lat, lng, ax, ay, az } = req.body

    const ref = db.ref('gps/datos')
    await ref.push({
      lat,
      lng,
      ax,
      ay,
      az,
      timestamp: Date.now()
    })

    res.status(200).json({ status: 'ok' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`)
})
