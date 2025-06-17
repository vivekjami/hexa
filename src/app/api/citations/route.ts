import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Day 4: Citation Management API
// Implement proper citation formatting and source attribution

interface Citation {
  id: string;
  url: string;
  title: string;
  author?: string;
  publishedDate?: string;
  accessedDate: string;
  sourceType: 'academic' | 'news' | 'government' | 'commercial' | 'blog' | 'social' | 'unknown';
  facts: Array<{
    claim: string;
    pageNumber?: number;
    quote?: string;
  }>;
  credibilityScore: number;
  format: {
    apa: string;
    mla: string;
    chicago: string;
    harvard: string;
  };
}

interface CitationDatabase {
  citations: Citation[];
  totalSources: number;
  highCredibilitySources: number;
  factsCited: number;
  duplicatesRemoved: number;
}

export async function POST(request: NextRequest) {
  try {
    const { sources } = await request.json();

    if (!sources || !Array.isArray(sources)) {
      return NextResponse.json(
        { error: 'Sources array is required' },
        { status: 400 }
      );
    }

    console.log(`📚 Processing ${sources.length} sources for citation management`);

    // Process and format citations
    const citations: Citation[] = [];
    const seenUrls = new Set<string>();
    let duplicatesRemoved = 0;

    for (const source of sources) {
      // Check for duplicates
      if (seenUrls.has(source.url)) {
        duplicatesRemoved++;
        continue;
      }
      seenUrls.add(source.url);

      const citation = await createCitation(source);
      citations.push(citation);
    }

    // Calculate statistics
    const highCredibilitySources = citations.filter(c => c.credibilityScore >= 0.7).length;
    const factsCited = citations.reduce((sum, c) => sum + c.facts.length, 0);

    const database: CitationDatabase = {
      citations,
      totalSources: citations.length,
      highCredibilitySources,
      factsCited,
      duplicatesRemoved
    };

    console.log(`✅ Citation database created: ${citations.length} sources, ${factsCited} facts cited`);

    return NextResponse.json({ success: true, data: database });

  } catch (error) {
    console.error('Citation management error:', error);
    return NextResponse.json(
      { error: 'Citation management failed' },
      { status: 500 }
    );
  }
}

// Helper function to create a formatted citation
async function createCitation(source: any): Promise<Citation> {
  const id = uuidv4();
  const accessedDate = new Date().toISOString().split('T')[0];
  
  // Extract metadata
  const { url, title, author, publishedDate, sourceType, facts = [], credibilityScore = 0.5 } = source;
  
  // Parse domain for better formatting
  const domain = extractDomain(url);
  const publisherName = formatPublisherName(domain);
  
  // Format dates
  const formattedPublishDate = publishedDate ? formatDate(publishedDate) : undefined;
  const formattedAccessDate = formatDate(accessedDate);
  
  // Generate citations in different formats
  const format = {
    apa: generateAPACitation({
      author,
      title,
      publisherName,
      publishedDate: formattedPublishDate,
      url,
      accessedDate: formattedAccessDate
    }),
    mla: generateMLACitation({
      author,
      title,
      publisherName,
      publishedDate: formattedPublishDate,
      url,
      accessedDate: formattedAccessDate
    }),
    chicago: generateChicagoCitation({
      author,
      title,
      publisherName,
      publishedDate: formattedPublishDate,
      url,
      accessedDate: formattedAccessDate
    }),
    harvard: generateHarvardCitation({
      author,
      title,
      publisherName,
      publishedDate: formattedPublishDate,
      url,
      accessedDate: formattedAccessDate
    })
  };

  return {
    id,
    url,
    title,
    author,
    publishedDate,
    accessedDate,
    sourceType,
    facts: facts.map((fact: any) => ({
      claim: fact.claim || fact,
      quote: typeof fact === 'object' ? fact.evidence : undefined
    })),
    credibilityScore,
    format
  };
}

// Helper functions for citation formatting

function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return 'unknown-source.com';
  }
}

function formatPublisherName(domain: string): string {
  // Map common domains to proper publisher names
  const publisherMap: { [key: string]: string } = {
    'nytimes.com': 'The New York Times',
    'bbc.com': 'BBC',
    'reuters.com': 'Reuters',
    'wsj.com': 'The Wall Street Journal',
    'washingtonpost.com': 'The Washington Post',
    'cnn.com': 'CNN',
    'nature.com': 'Nature',
    'science.org': 'Science',
    'arxiv.org': 'arXiv',
    'wikipedia.org': 'Wikipedia',
    'github.com': 'GitHub'
  };

  return publisherMap[domain] || capitalizeWords(domain.replace('.com', '').replace('.org', '').replace('.edu', ''));
}

function capitalizeWords(str: string): string {
  return str.split(/[-.]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}

// Citation format generators

function generateAPACitation(data: any): string {
  const { author, title, publisherName, publishedDate, url, accessedDate } = data;
  
  let citation = '';
  
  if (author) {
    citation += `${author}. `;
  }
  
  if (publishedDate) {
    const year = publishedDate.includes(',') ? publishedDate.split(',')[1].trim() : new Date().getFullYear();
    citation += `(${year}). `;
  }
  
  citation += `${title}. `;
  
  if (publisherName) {
    citation += `${publisherName}. `;
  }
  
  citation += `Retrieved ${accessedDate}, from ${url}`;
  
  return citation;
}

function generateMLACitation(data: any): string {
  const { author, title, publisherName, publishedDate, url, accessedDate } = data;
  
  let citation = '';
  
  if (author) {
    citation += `${author}. `;
  }
  
  citation += `"${title}." `;
  
  if (publisherName) {
    citation += `${publisherName}, `;
  }
  
  if (publishedDate) {
    citation += `${publishedDate}, `;
  }
  
  citation += `${url}. Accessed ${accessedDate}.`;
  
  return citation;
}

function generateChicagoCitation(data: any): string {
  const { author, title, publisherName, publishedDate, url, accessedDate } = data;
  
  let citation = '';
  
  if (author) {
    citation += `${author}. `;
  }
  
  citation += `"${title}." `;
  
  if (publisherName) {
    citation += `${publisherName}. `;
  }
  
  if (publishedDate) {
    citation += `${publishedDate}. `;
  }
  
  citation += `${url} (accessed ${accessedDate}).`;
  
  return citation;
}

function generateHarvardCitation(data: any): string {
  const { author, title, publisherName, publishedDate, url, accessedDate } = data;
  
  let citation = '';
  
  if (author) {
    citation += `${author} `;
  }
  
  if (publishedDate) {
    const year = publishedDate.includes(',') ? publishedDate.split(',')[1].trim() : new Date().getFullYear();
    citation += `${year}, `;
  }
  
  citation += `${title}, `;
  
  if (publisherName) {
    citation += `${publisherName}, `;
  }
  
  citation += `viewed ${accessedDate}, <${url}>`;
  
  return citation;
}

// GET endpoint to retrieve citations by ID or filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'apa';
    const filter = searchParams.get('filter');

    // This would typically fetch from a database
    // For now, return a sample response
    return NextResponse.json({
      success: true,
      message: `Citations in ${format} format${filter ? ` filtered by: ${filter}` : ''}`
    });

  } catch (error) {
    console.error('Citation retrieval error:', error);
    return NextResponse.json(
      { error: 'Citation retrieval failed' },
      { status: 500 }
    );
  }
}
