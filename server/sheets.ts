import { google } from 'googleapis'

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID ?? ''
const SHEET_NAME = 'Sheet1'

// Columns: A=profile_id, B=adventure_progress, C=pet_state, D=kana_progress, E=updated_at
const COL = { profileId: 0, adventure: 1, pet: 2, kana: 3, updatedAt: 4 }

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const key = (process.env.GOOGLE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n')
  if (!email || !key) throw new Error('Google service account env vars not set')
  return new google.auth.JWT({ email, key, scopes: ['https://www.googleapis.com/auth/spreadsheets'] })
}

function sheets() {
  return google.sheets({ version: 'v4', auth: getAuth() })
}

export interface SheetRow {
  profileId: string
  adventure_progress: object | null
  pet_state: object | null
  kana_progress: object[]
  updated_at: number
}

export async function readRow(profileId: string): Promise<SheetRow | null> {
  const res = await sheets().spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:E`,
  })
  const rows = res.data.values ?? []
  const row = rows.find((r) => r[COL.profileId] === profileId)
  if (!row) return null
  return {
    profileId: row[COL.profileId] as string,
    adventure_progress: parseJson(row[COL.adventure]),
    pet_state: parseJson(row[COL.pet]),
    kana_progress: parseJsonArray(row[COL.kana]),
    updated_at: Number(row[COL.updatedAt] ?? 0),
  }
}

export async function writeRow(data: SheetRow): Promise<void> {
  const api = sheets()
  const res = await api.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:A`,
  })
  const rows = res.data.values ?? []
  const rowIndex = rows.findIndex((r) => r[0] === data.profileId)

  const values = [
    [
      data.profileId,
      JSON.stringify(data.adventure_progress ?? null),
      JSON.stringify(data.pet_state ?? null),
      JSON.stringify(data.kana_progress),
      String(data.updated_at),
    ],
  ]

  if (rowIndex >= 0) {
    // update existing row (1-indexed, +1 for header if any, but we have no header so +1 for 1-index)
    const r = rowIndex + 1
    await api.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A${r}:E${r}`,
      valueInputOption: 'RAW',
      requestBody: { values },
    })
  } else {
    await api.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:E`,
      valueInputOption: 'RAW',
      requestBody: { values },
    })
  }
}

function parseJson(s: unknown): object | null {
  if (typeof s !== 'string' || !s) return null
  try { return JSON.parse(s) as object } catch { return null }
}

function parseJsonArray(s: unknown): object[] {
  const v = parseJson(s)
  return Array.isArray(v) ? (v as object[]) : []
}
