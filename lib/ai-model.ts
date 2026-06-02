import { createGroq } from '@ai-sdk/groq'

export const LMS_AI_MODEL = 'llama-3.3-70b-versatile'
export const LMS_STRUCTURED_OBJECT_MODE = 'json'

type GroqProvider = ReturnType<typeof createGroq>

let groqProvider: GroqProvider | null = null

function getGroqProvider(): GroqProvider {
  groqProvider ??= createGroq({ apiKey: process.env.GROQ_API_KEY })
  return groqProvider
}

export function getDefaultAiModel() {
  return getGroqProvider()(LMS_AI_MODEL)
}
