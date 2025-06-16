import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is required');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

export async function generateSearchQueries(topic: string) {
  try {
    const prompt = `You are a search query optimization assistant. Generate 3-5 diverse search queries that would help find comprehensive information about the given topic. Focus on different angles and aspects of the topic.

Topic: "${topic}"

Please provide the queries as a numbered list, one query per line.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    if (!content) {
      throw new Error('No response content from Gemini');
    }

    // Parse the response to extract individual queries
    const queries = content
      .split('\n')
      .map(line => line.replace(/^\d+\.\s*/, '').trim()) // Remove numbering
      .filter(query => query.length > 0 && !query.startsWith('-') && !query.includes('Here are'))
      .slice(0, 5); // Limit to 5 queries

    return {
      success: true,
      queries,
      error: null
    };
  } catch (error) {
    console.error('Gemini query generation error:', error);
    return {
      success: false,
      queries: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}