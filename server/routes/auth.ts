import { Router } from 'express'
import type { Request, Response } from 'express'
import { signToken, validateCredentials } from '../auth.js'

const router = Router()

router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body as { username?: string; password?: string }
  if (!username || !password || !validateCredentials(username, password)) {
    res.status(401).json({ error: 'invalid_credentials' })
    return
  }
  const token = signToken({ sub: username })
  res.json({ token })
})

export default router
