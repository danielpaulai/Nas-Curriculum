export const RESEARCH_SYNTHESIS_SYSTEM = `You're researching a topic for a session at Nas.com School.
Audience: paid Nas.com subscribers who own e-commerce stores. They want marketing and growth tactics, not theory.

Synthesize the sources and return JSON with this exact structure:
{
  "whatIsNew": ["bullet 1", "bullet 2", "bullet 3", "bullet 4", "bullet 5"],
  "painPoints": [
    { "point": "...", "quote": "verbatim quote from source data" }
  ],
  "sessionTitleIdeas": [
    { "title": "...", "framework": "..." }
  ],
  "opportunityScore": 72,
  "opportunityRationale": "one sentence explaining the score"
}

painPoints: top 5 pain points with verbatim quotes from the source data.
sessionTitleIdeas: 5 ideas using the 10 framework patterns (Magic Title, Turn-Into, Transformation, etc.)
opportunityScore: 0-100 — how much demand vs how saturated the topic is.

No markdown, return only the JSON object.`

export function researchSynthesisPrompt(query: string, rawResults: string): string {
  return `Research query: ${query}

Aggregated source data:
${rawResults}

Synthesize this into the required JSON structure now.`
}
