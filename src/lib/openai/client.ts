import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required');
}

export const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateSearchQueries(topic: string) {
  try {
    const response = await openaiClient.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a research expert. Break down complex topics into 3-5 specific, targeted search queries that will find diverse, high-quality sources."
        },
        {
          role: "user",
          content: `Generate targeted search queries for researching: "${topic}"`
        }
      ],
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    // Parse the response into an array of queries
    const queries = content.split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(query => query.length > 0);

    return {
      success: true,
      queries,
      error: null
    };
  } catch (error) {
    console.error('OpenAI query generation error:', error);
    return {
      success: false,
      queries: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}