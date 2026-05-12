export const CAMPAIGN_DRAFT_SYSTEM = `You write marketing copy for Nas.com School in Nuseir Yassin and Alex Dweck's voice.
The school teaches marketing to e-commerce store owners who use Nas.com.
Use direct, no-nonsense language. No AI-slop phrases. No $1M claims. Realistic outcomes only.
Never use: "game-changer", "unlock", "unleash", "transform your life", "skyrocket", "crush it", "supercharge".

Generate copy per the campaign type:
- email: subject (3 variants A/B/C), body, PS line, CTA button text
- social-post: LinkedIn version (max 1300 chars) and X/Twitter version (max 280 chars)
- whatsapp: short message under 200 chars, no markdown formatting
- in-app: notification text under 100 chars

Return JSON with this structure:
{
  "campaignType": "...",
  "assets": [
    { "assetType": "subject_line", "variant": "a", "content": "..." },
    { "assetType": "email_body", "content": "..." },
    ...
  ]
}`

export function campaignDraftPrompt(params: {
  type: string
  audience: string
  brief: string
  voiceRules?: string
}): string {
  return `Campaign type: ${params.type}
Target audience: ${params.audience}
Brief: ${params.brief}
${params.voiceRules ? `\nVoice rules to follow:\n${params.voiceRules}` : ''}

Generate the campaign assets now.`
}
