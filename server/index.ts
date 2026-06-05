import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'
import authRouter from './routes/auth.js'
import syncRouter from './routes/sync.js'

dotenv.config()

const app = express()
const PORT = Number(process.env.PORT ?? 3001)

app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*' }))
app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/sync', syncRouter)

// Serve built frontend in production
const __dirname = dirname(fileURLToPath(import.meta.url))
const distPath = join(__dirname, '../dist')
app.use(express.static(distPath))
app.get('*', (_req, res) => {
  res.sendFile(join(distPath, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`[server] running on http://localhost:${PORT}`)
})
