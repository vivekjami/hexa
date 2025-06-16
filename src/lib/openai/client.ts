import OpenAI from 'openai'

class OpenAIClient {
  private client: OpenAI
  private isInitialized: boolean = false

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required but not found in environment variables')
    }
    
    try {
      this.client = new OpenAI({ apiKey })
      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize OpenAI client:', error)
      throw new Error('Failed to initialize OpenAI client')
    }
  }

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('OpenAI client is not properly initialized')
    }
  }

  async generateSearchQueries(topic: string): Promise<string[]> {
    this.ensureInitialized()

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a research assistant that helps break down complex topics into targeted search queries. 
            Generate 3-5 specific, focused search queries that would help comprehensively research the given topic.
            Each query should target a different angle or aspect of the topic.
            Return only the queries, one per line, without numbering or formatting.`
          },
          {
            role: 'user',
            content: `Generate targeted search queries for researching: ${topic}`
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      })

      const content = response.choices[0]?.message?.content || ''
      return content
        .split('\n')
        .map(query => query.trim())
        .filter(query => query.length > 0)
        .slice(0, 5)
    } catch (error: unknown) {
      console.error('OpenAI query generation error:', error)
      if (error instanceof Error) {
        throw new Error(`Failed to generate search queries: ${error.message}`)
      } else {
        throw new Error('Failed to generate search queries: Unknown error')
      }
    }
  }
}

// Export singleton instance
export const openaiClient = new OpenAIClient()