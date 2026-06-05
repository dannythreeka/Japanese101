import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '24h'

export function signToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as string })
}

export function verifyToken(token: string): object | null {
  try {
    return jwt.verify(token, JWT_SECRET) as object
  } catch {
    return null
  }
}

export function validateCredentials(username: string, password: string): boolean {
  return (
    username === process.env.BASIC_USERNAME &&
    password === process.env.BASIC_PASSWORD
  )
}

export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null
  return authHeader.slice(7)
}
