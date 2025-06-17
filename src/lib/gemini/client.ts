import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is required');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

interface QueryStrategy {
  primary: string[];
  secondary: string[];
  exploratory: string[];
  validation: string[];
}

interface QueryAnalysis {
  complexity: 'simple' | 'moderate' | 'complex';
  domains: string[];
  timeframe?: string;
  entityTypes: string[];
  searchAngles: string[];
}

// Advanced query decomposition and strategy generation
export async function generateAdvancedSearchStrategy(topic: string): Promise<{
  success: boolean;
  analysis?: QueryAnalysis;
  strategy?: QueryStrategy;
  prioritizedQueries?: string[];
  error?: string;
}> {
  try {
    const analysisPrompt = `Analyze this research topic and provide a comprehensive search strategy:

Topic: "${topic}"

Please provide:
1. Complexity assessment (simple/moderate/complex)
2. Key domains to search (academic, news, industry, government, etc.)
3. Time sensitivity (if relevant)
4. Entity types involved (companies, people, technologies, etc.)
5. Different search angles to explore

Format your response as JSON with this structure:
{
  "complexity": "simple|moderate|complex",
  "domains": ["domain1", "domain2"],
  "timeframe": "timeframe if relevant",
  "entityTypes": ["type1", "type2"],
  "searchAngles": ["angle1", "angle2", "angle3"]
}`;

    const analysisResult = await model.generateContent(analysisPrompt);
    const analysisText = analysisResult.response.text();
    
    let analysis: QueryAnalysis;
    try {
      const cleanJson = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      analysis = JSON.parse(cleanJson);
    } catch {
      // Fallback analysis
      analysis = {
        complexity: 'moderate',
        domains: ['general'],
        entityTypes: ['topic'],
        searchAngles: ['overview', 'recent developments', 'expert opinions']
      };
    }

    // Generate targeted queries based on analysis
    const strategyPrompt = `Based on this analysis, generate specific search queries:

Topic: "${topic}"
Complexity: ${analysis.complexity}
Search Angles: ${analysis.searchAngles.join(', ')}

Generate 12-15 specific search queries organized into categories:

PRIMARY (3-4 queries): Direct, high-impact searches for core information
SECONDARY (4-5 queries): Supporting information and context
EXPLORATORY (3-4 queries): Related topics and broader context
VALIDATION (2-3 queries): Fact-checking and credibility sources

Format as JSON:
{
  "primary": ["query1", "query2"],
  "secondary": ["query3", "query4"],
  "exploratory": ["query5", "query6"],
  "validation": ["query7", "query8"]
}`;

    const strategyResult = await model.generateContent(strategyPrompt);
    const strategyText = strategyResult.response.text();
    
    let strategy: QueryStrategy;
    try {
      const cleanJson = strategyText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      strategy = JSON.parse(cleanJson);
    } catch {
      // Fallback strategy
      strategy = {
        primary: [topic, `${topic} overview`, `${topic} latest`],
        secondary: [`${topic} analysis`, `${topic} trends`],
        exploratory: [`${topic} impact`, `${topic} future`],
        validation: [`${topic} research`, `${topic} expert opinion`]
      };
    }

    // Create prioritized list
    const prioritizedQueries = [
      ...strategy.primary,
      ...strategy.secondary.slice(0, 2),
      ...strategy.exploratory.slice(0, 2),
      ...strategy.validation.slice(0, 1)
    ];

    return {
      success: true,
      analysis,
      strategy,
      prioritizedQueries,
    };

  } catch (error) {
    console.error('Advanced query generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Query generation failed'
    };
  }
}

// Query refinement based on search results
export async function refineQueriesBasedOnResults(
  originalQuery: string,
  results: SearchResult[],
  gaps: string[]
): Promise<{
  success: boolean;
  refinedQueries?: string[];
  focusAreas?: string[];
  error?: string;
}> {
  try {
    const refinementPrompt = `Based on these search results, suggest refined queries to fill information gaps:

Original Query: "${originalQuery}"

Current Results Summary:
${results.slice(0, 5).map(r => `- ${r.title}: ${r.text?.slice(0, 100) || 'No content'}...`).join('\n')}

Identified Gaps:
${gaps.join('\n- ')}

Generate 5-7 refined search queries that would help fill these gaps and provide more comprehensive coverage.

Format as JSON array:
["refined query 1", "refined query 2", ...]`;

    const result = await model.generateContent(refinementPrompt);
    const content = result.response.text();
    
    let refinedQueries: string[];
    try {
      const cleanJson = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      refinedQueries = JSON.parse(cleanJson);
    } catch {
      refinedQueries = [
        `${originalQuery} detailed analysis`,
        `${originalQuery} expert perspectives`,
        `${originalQuery} case studies`,
        `${originalQuery} recent developments`
      ];
    }

    return {
      success: true,
      refinedQueries,
      focusAreas: gaps,
    };

  } catch (error) {
    console.error('Query refinement error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Query refinement failed'
    };
  }
}

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

// Day 3: Advanced content analysis and fact extraction
export async function analyzeContentForFacts(content: string, url: string): Promise<{
  success: boolean;
  data?: {
    keyFacts: Array<{
      claim: string;
      confidence: number;
      category: string;
    }>;
    summary: string;
    credibilityAssessment: string;
    mainTopics: string[];
    sentimentAnalysis: 'positive' | 'neutral' | 'negative';
  };
  error?: string;
}> {
  try {
    if (!content || content.length < 100) {
      return {
        success: false,
        error: 'Content too short for analysis'
      };
    }

    const analysisPrompt = `Analyze the following content and extract structured information:

Content: "${content.slice(0, 3000)}"
Source URL: ${url}

Please provide:
1. Key Facts: Extract 5-10 most important factual claims, statistics, or findings
2. Summary: A concise 2-3 sentence summary of the main points
3. Credibility Assessment: Rate the credibility based on evidence, citations, and objectivity
4. Main Topics: Identify 5-8 main topics or themes
5. Sentiment: Overall sentiment (positive/neutral/negative)

Format your response as JSON:
{
  "keyFacts": [
    {
      "claim": "specific factual claim",
      "confidence": 0.8,
      "category": "statistic|claim|quote|definition|relationship"
    }
  ],
  "summary": "concise summary",
  "credibilityAssessment": "assessment with reasoning",
  "mainTopics": ["topic1", "topic2"],
  "sentimentAnalysis": "positive|neutral|negative"
}`;

    const result = await model.generateContent(analysisPrompt);
    const analysisText = result.response.text();
    
    try {
      const cleanJson = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const analysis = JSON.parse(cleanJson);
      
      return {
        success: true,
        data: analysis
      };
    } catch {
      // Fallback analysis
      return {
        success: true,
        data: {
          keyFacts: [],
          summary: content.slice(0, 200) + '...',
          credibilityAssessment: 'Unable to assess credibility automatically',
          mainTopics: ['general'],
          sentimentAnalysis: 'neutral' as const
        }
      };
    }

  } catch (error) {
    console.error('Content analysis error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Content analysis failed'
    };
  }
}

// Day 3: Batch content processing for multiple sources
export async function processBatchContent(contents: Array<{ url: string; text: string; title?: string }>): Promise<{
  success: boolean;
  data?: {
    processedSources: number;
    aggregatedFacts: Array<{
      fact: string;
      sources: string[];
      confidence: number;
      category: string;
    }>;
    topicClusters: string[];
    diversityScore: number;
    overallSummary: string;
  };
  error?: string;
}> {
  try {
    if (!contents.length) {
      return {
        success: false,
        error: 'No content provided for batch processing'
      };
    }

    const batchPrompt = `Analyze and synthesize information from multiple sources:

Sources:
${contents.map((content, index) => 
  `Source ${index + 1} (${content.url}):
Title: ${content.title || 'No title'}
Content: ${content.text.slice(0, 1000)}...
`).join('\n\n')}

Please provide:
1. Aggregated Facts: Consolidate and verify facts across sources
2. Topic Clusters: Group related topics and themes
3. Diversity Score: Rate information diversity (0-1, where 1 is most diverse)
4. Overall Summary: Synthesize findings into a comprehensive summary

Format as JSON:
{
  "aggregatedFacts": [
    {
      "fact": "consolidated factual claim",
      "sources": ["url1", "url2"],
      "confidence": 0.9,
      "category": "type"
    }
  ],
  "topicClusters": ["cluster1", "cluster2"],
  "diversityScore": 0.8,
  "overallSummary": "comprehensive synthesis"
}`;

    const result = await model.generateContent(batchPrompt);
    const analysisText = result.response.text();
    
    try {
      const cleanJson = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const analysis = JSON.parse(cleanJson);
      
      return {
        success: true,
        data: {
          processedSources: contents.length,
          ...analysis
        }
      };
    } catch {
      // Fallback processing
      return {
        success: true,
        data: {
          processedSources: contents.length,
          aggregatedFacts: [],
          topicClusters: ['general'],
          diversityScore: 0.5,
          overallSummary: 'Multiple sources processed, detailed analysis unavailable'
        }
      };
    }

  } catch (error) {
    console.error('Batch content processing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Batch processing failed'
    };
  }
}