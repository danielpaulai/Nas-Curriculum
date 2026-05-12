export const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID ?? ''

export async function fetchSessionsFromSheet(): Promise<Record<string, string>[]> {
  // This is a stub — full implementation in Module 5 (Day 3)
  // Will use google-spreadsheet package with service account credentials
  throw new Error('Google Sheets integration not yet configured. Add credentials to .env.local and implement in Day 3.')
}
