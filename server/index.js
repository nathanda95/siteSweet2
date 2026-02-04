import cors from 'cors'
import express from 'express'
import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, '..', 'data')
const dataFile = path.join(dataDir, 'formations.json')

const app = express()
const PORT = process.env.PORT || 5174
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-me'
const sessions = new Set()

app.use(cors())
app.use(express.json({ limit: '2mb' }))

const ensureDataDir = async () => {
  await fs.mkdir(dataDir, { recursive: true })
}

const loadFormations = async () => {
  try {
    const raw = await fs.readFile(dataFile, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    if (error.code === 'ENOENT') {
      return []
    }
    throw error
  }
}

const stripImages = (formations) =>
  formations.map((formation) => ({
    ...formation,
    banner: null,
    sections: Array.isArray(formation.sections)
      ? formation.sections.map((section) => ({
          ...section,
          paragraphs: Array.isArray(section.paragraphs)
            ? section.paragraphs.map((paragraph) => {
                const { image, ...rest } = paragraph ?? {}
                return rest
              })
            : [],
        }))
      : [],
  }))

const saveFormations = async (formations) => {
  await ensureDataDir()
  await fs.writeFile(dataFile, JSON.stringify(formations, null, 2), 'utf8')
}

const getToken = (req) => {
  const header = req.headers.authorization
  if (!header) {
    return null
  }
  const [type, token] = header.split(' ')
  if (type !== 'Bearer' || !token) {
    return null
  }
  return token
}

const requireAuth = (req, res, next) => {
  const token = getToken(req)
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: 'Non autorisé.' })
  }
  req.token = token
  return next()
}

app.get('/api/formations', async (req, res) => {
  try {
    const formations = await loadFormations()
    return res.json(formations)
  } catch (error) {
    return res.status(500).json({ error: 'Impossible de lire les formations.' })
  }
})

app.put('/api/formations', requireAuth, async (req, res) => {
  const payload = req.body
  if (!Array.isArray(payload)) {
    return res.status(400).json({ error: 'Le payload doit être un tableau.' })
  }

  try {
    const sanitized = stripImages(payload)
    await saveFormations(sanitized)
    return res.json({ ok: true, count: sanitized.length })
  } catch (error) {
    return res.status(500).json({ error: 'Impossible de sauvegarder les formations.' })
  }
})

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

app.get('/api/session', requireAuth, (req, res) => {
  res.json({ ok: true })
})

app.post('/api/login', (req, res) => {
  const { password } = req.body ?? {}
  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Identifiants invalides.' })
  }
  const token = randomUUID()
  sessions.add(token)
  return res.json({ ok: true, token })
})

app.post('/api/logout', requireAuth, (req, res) => {
  if (req.token) {
    sessions.delete(req.token)
  }
  res.json({ ok: true })
})

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API formations: http://localhost:${PORT}`)
})
