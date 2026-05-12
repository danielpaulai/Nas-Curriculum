export const EXTRACT_FACTS_SYSTEM = `You are reading a meeting transcript for Nas.com School (formerly AI Business School). 
Extract strategic facts in these categories:
- strategy (brand pivot, positioning, target audience changes)
- voice (banned words, preferred phrases, tone shifts)
- topic-priority (new content directions, sessions to drop, sessions to add)
- audience (who we serve, who we don't)
- operational (recurring meetings, decisions on cadence)

For each fact return:
- category: one of the above
- fact: one clear sentence
- confidence: 0-1 float
- suggestedFile: which file this applies to (SKILL.md, voice-rules.md, frameworks.md, or null)

Return a JSON array of fact objects. No markdown, just the JSON array.`

export function extractFactsPrompt(transcript: string): string {
  return `Here is the meeting transcript:\n\n${transcript}`
}
