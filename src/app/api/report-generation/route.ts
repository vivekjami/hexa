// Day 5: Report Generation API
// Main API endpoint that integrates content synthesis, structure generation, and citation management

import { NextRequest, NextResponse } from 'next/server';
import { ContentSynthesisEngine, type SourceContent } from '@/lib/synthesis/engine';
import { ReportStructureGenerator } from '@/lib/synthesis/structure';
import { ReportExporter, type ExportOptions } from '@/lib/synthesis/export';
import { CitationFormatter, type CitationData, type CitationStyle } from '@/lib/synthesis/citations';

interface ReportGenerationRequest {
  query: string;
  sources: Array<{
    id: string;
    url: string;
    title: string;
    content: string;
    author?: string;
    publishedDate?: string;
    credibilityScore: number;
    sourceType: 'academic' | 'news' | 'government' | 'commercial' | 'blog' | 'social' | 'unknown';
    keyFacts: Array<{
      claim: string;
      confidence: number;
      category: string;
      evidence?: string;
    }>;
  }>;
  options?: {
    citationStyle?: CitationStyle;
    exportFormat?: 'pdf' | 'markdown' | 'json' | 'html';
    template?: 'academic' | 'business' | 'minimal';
    includeMetadata?: boolean;
    includeBibliography?: boolean;
    includeTableOfContents?: boolean;
  };
}

interface ReportGenerationResponse {
  success: boolean;
  data?: {
    report: {
      title: string;
      executiveSummary: string;
      sections: Array<{
        id: string;
        title: string;
        content: string;
        citations: string[];
        confidence: number;
        subsections?: any[];
      }>;
      metadata: {
        generatedAt: string;
        query: string;
        sourceCount: number;
        confidenceScore: number;
        wordCount: number;
        estimatedReadingTime: number;
      };
    };
    synthesis: {
      keyThemes: Array<{
        theme: string;
        evidence: Array<{
          sourceId: string;
          claim: string;
          confidence: number;
        }>;
        consensus: 'strong' | 'moderate' | 'weak' | 'conflicting';
      }>;
      timeline?: Array<{
        date: string;
        event: string;
        sources: string[];
      }>;
      statistics: Array<{
        metric: string;
        value: string;
        source: string;
        confidence: number;
      }>;
      controversies: Array<{
        topic: string;
        conflictingSources: Array<{
          sourceId: string;
          position: string;
        }>;
      }>;
    };
    bibliography: {
      style: CitationStyle;
      entries: Array<{
        id: string;
        formatted: string;
      }>;
    };
    export?: {
      content: string;
      fileName: string;
      mimeType: string;
    };
  };
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: ReportGenerationRequest = await request.json();
    
    if (!body.query || !body.sources || body.sources.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Query and sources are required'
      }, { status: 400 });
    }

    console.log(`📊 Generating comprehensive report for: "${body.query}"`);
    console.log(`📚 Processing ${body.sources.length} sources`);

    // Step 1: Convert input sources to SourceContent format
    const sources: SourceContent[] = body.sources.map(source => ({
      id: source.id,
      url: source.url,
      title: source.title,
      content: source.content,
      author: source.author,
      publishedDate: source.publishedDate,
      credibilityScore: source.credibilityScore,
      sourceType: source.sourceType,
      keyFacts: source.keyFacts
    }));

    // Step 2: Initialize content synthesis engine
    const synthesisEngine = new ContentSynthesisEngine(sources);
    const synthesizedContent = synthesisEngine.synthesizeContent();

    console.log(`🧠 Content synthesis complete:
    - ${synthesizedContent.keyThemes.length} key themes identified
    - ${synthesizedContent.timeline?.length || 0} timeline events
    - ${synthesizedContent.statistics.length} statistics extracted
    - ${synthesizedContent.controversies.length} controversies identified`);

    // Step 3: Generate report structure
    const structureGenerator = new ReportStructureGenerator(
      synthesizedContent,
      body.query,
      sources.length
    );
    const reportStructure = structureGenerator.generateStructure();

    console.log(`📄 Report structure generated:
    - ${reportStructure.sections.length} main sections
    - ${reportStructure.metadata.wordCount} total words
    - ${reportStructure.metadata.estimatedReadingTime} min reading time`);

    // Step 4: Set up citation formatter
    const citationStyle = body.options?.citationStyle || 'apa';
    const citationFormatter = new CitationFormatter(citationStyle);

    // Convert sources to citation data
    sources.forEach(source => {
      const citationData: CitationData = {
        id: source.id,
        type: 'website', // Simplified - could be enhanced to detect type
        title: source.title,
        authors: source.author ? [source.author] : [],
        url: source.url,
        publishedDate: source.publishedDate,
        accessedDate: new Date().toISOString()
      };
      citationFormatter.addSource(citationData);
    });

    // Embed citations in report content
    const sectionsWithCitations = reportStructure.sections.map(section => ({
      ...section,
      content: citationFormatter.embedCitations(section.content),
      subsections: section.subsections?.map(subsection => ({
        ...subsection,
        content: citationFormatter.embedCitations(subsection.content)
      }))
    }));

    // Generate bibliography
    const bibliography = citationFormatter.generateBibliography('alphabetical');

    console.log(`📖 Citations formatted in ${citationStyle.toUpperCase()} style:
    - ${bibliography.entries.length} bibliography entries`);

    // Step 5: Export report if format specified
    let exportData = undefined;
    if (body.options?.exportFormat) {
      const exporter = new ReportExporter({
        ...reportStructure,
        sections: sectionsWithCitations,
        bibliography: bibliography.entries.map(entry => entry.formatted)
      });

      const exportOptions: ExportOptions = {
        format: body.options.exportFormat,
        template: body.options.template,
        includeMetadata: body.options.includeMetadata,
        includeBibliography: body.options.includeBibliography,
        includeTableOfContents: body.options.includeTableOfContents,
        citationStyle
      };

      const exportResult = await exporter.export(exportOptions);
      
      if (exportResult.success) {
        exportData = {
          content: exportResult.content!,
          fileName: exportResult.fileName!,
          mimeType: exportResult.mimeType!
        };
        console.log(`📤 Report exported as ${body.options.exportFormat.toUpperCase()}`);
      }
    }

    // Step 6: Prepare response
    const response: ReportGenerationResponse = {
      success: true,
      data: {
        report: {
          title: reportStructure.title,
          executiveSummary: reportStructure.executiveSummary,
          sections: sectionsWithCitations,
          metadata: reportStructure.metadata
        },
        synthesis: {
          keyThemes: synthesizedContent.keyThemes,
          timeline: synthesizedContent.timeline,
          statistics: synthesizedContent.statistics,
          controversies: synthesizedContent.controversies
        },
        bibliography: {
          style: citationStyle,
          entries: bibliography.entries.map(entry => ({
            id: entry.id,
            formatted: entry.formatted
          }))
        },
        export: exportData
      }
    };

    console.log(`✅ Report generation completed successfully`);
    
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Report generation error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Report generation failed'
    }, { status: 500 });
  }
}

// Health check endpoint
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    service: 'Report Generation API',
    status: 'healthy',
    version: '1.0.0',
    features: [
      'Content Synthesis',
      'Report Structure Generation',
      'Multiple Export Formats',
      'Citation Management',
      'Multiple Citation Styles'
    ],
    supportedFormats: ['pdf', 'markdown', 'json', 'html'],
    supportedCitationStyles: ['apa', 'mla', 'chicago', 'harvard', 'ieee', 'nature']
  });
}
