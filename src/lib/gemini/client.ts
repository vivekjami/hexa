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
      error: undefined
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

interface SearchResult {
  title: string;
  url: string;
  text?: string;
  publishedDate?: string;
  author?: string;
  score?: number;
}

interface ResearchReport {
  executive_summary: string;
  key_findings: string[];
  detailed_analysis: string;
  sources_analysis: string;
  recommendations: string[];
  credibility_assessment: {
    high_credibility: SearchResult[];
    medium_credibility: SearchResult[];
    needs_verification: SearchResult[];
  };
  gaps_and_limitations: string[];
}

export async function generateResearchReport(
  originalQuery: string,
  searchResults: SearchResult[]
): Promise<{ success: boolean; report?: ResearchReport; error?: string }> {
  try {
    const resultsText = searchResults
      .slice(0, 15) // Limit to top 15 results to stay within token limits
      .map((result, idx) => `
Source ${idx + 1}:
Title: ${result.title}
URL: ${result.url}
Content: ${result.text?.substring(0, 1000) || 'No content available'}
Published: ${result.publishedDate || 'Unknown'}
Author: ${result.author || 'Unknown'}
---`)
      .join('\n');

    const prompt = `You are an expert research analyst. Generate a comprehensive research report based on the search results provided. 

Research Query: "${originalQuery}"

Search Results:
${resultsText}

Please provide a detailed research report in the following JSON format:
{
  "executive_summary": "A concise 2-3 paragraph summary of the key findings",
  "key_findings": ["Finding 1", "Finding 2", "Finding 3", "etc"],
  "detailed_analysis": "Comprehensive analysis of the topic with evidence from sources",
  "sources_analysis": "Critical evaluation of the sources and their reliability",
  "recommendations": ["Recommendation 1", "Recommendation 2", "etc"],
  "credibility_assessment": {
    "high_credibility": [list of source indices that are highly credible],
    "medium_credibility": [list of source indices with medium credibility],
    "needs_verification": [list of source indices that need verification]
  },
  "gaps_and_limitations": ["Gap 1", "Gap 2", "etc"]
}

Focus on:
- Evidence-based analysis
- Critical evaluation of sources
- Identification of conflicting information
- Practical insights and recommendations
- Acknowledgment of limitations and data gaps

Provide only the JSON response, no additional text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    if (!content) {
      throw new Error('No response content from Gemini');
    }

    // Parse JSON response
    const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
    const report = JSON.parse(cleanedContent) as ResearchReport;

    // Map credibility indices back to actual results
    const mapIndicesToResults = (indices: number[]) => 
      indices.map(idx => searchResults[idx]).filter(Boolean);

    report.credibility_assessment = {
      high_credibility: mapIndicesToResults(report.credibility_assessment.high_credibility as unknown as number[]),
      medium_credibility: mapIndicesToResults(report.credibility_assessment.medium_credibility as unknown as number[]),
      needs_verification: mapIndicesToResults(report.credibility_assessment.needs_verification as unknown as number[])
    };

    return {
      success: true,
      report,
      error: undefined
    };
  } catch (error) {
    console.error('Gemini research analysis error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Research analysis failed'
    };
  }
}

export async function generateFollowUpQuestions(
  originalQuery: string,
  researchReport: ResearchReport
): Promise<{ success: boolean; questions?: string[]; error?: string }> {
  try {
    const prompt = `Based on the research query and findings, generate 5-7 follow-up questions that would deepen the research.

Original Query: "${originalQuery}"

Key Findings: ${researchReport.key_findings.join(', ')}

Gaps: ${researchReport.gaps_and_limitations.join(', ')}

Generate questions that:
- Address identified gaps
- Explore implications of findings
- Suggest additional research directions
- Focus on practical applications

Provide as a numbered list, one question per line.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    if (!content) {
      throw new Error('No response content from Gemini');
    }

    const questions = content
      .split('\n')
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(question => question.length > 0 && !question.includes('Here are'))
      .slice(0, 7);

    return {
      success: true,
      questions,
      error: undefined
    };
  } catch (error) {
    console.error('Gemini follow-up questions error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Follow-up questions generation failed'
    };
  }
}