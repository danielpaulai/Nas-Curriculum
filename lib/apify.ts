// Apify client stub — full implementation in Module 6 (Day 5)
export const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN ?? ''

export async function runApifyActor(
  _actorId: string,
  _input: Record<string, unknown>
): Promise<unknown[]> {
  if (!APIFY_API_TOKEN) throw new Error('APIFY_API_TOKEN is not set')
  throw new Error('Apify integration not yet implemented. Configure in Day 5.')
}
