import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? 'placeholder',
})

export const DEFAULT_MODEL = 'claude-sonnet-4-5'

export async function claudeComplete(
  systemPrompt: string,
  userMessage: string,
  options?: { maxTokens?: number }
): Promise<string> {
  const response = await anthropic.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: options?.maxTokens ?? 4096,
    messages: [{ role: 'user', content: userMessage }],
    system: systemPrompt,
  })
  const block = response.content[0]
  if (block.type !== 'text') throw new Error('Unexpected response type from Claude')
  return block.text
}

export async function claudeJSON<T = unknown>(
  systemPrompt: string,
  userMessage: string,
  options?: { maxTokens?: number }
): Promise<T> {
  const text = await claudeComplete(systemPrompt, userMessage, options)
  // Strip markdown code fences if present
  const cleaned = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
  return JSON.parse(cleaned) as T
}
