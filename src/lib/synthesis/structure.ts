// Day 5: Report Structure Generation
// Creates executive summaries, builds logical argument flows, generates section headings and outlines

import { SynthesizedContent, ReportSection } from './engine';

export interface ReportStructure {
  title: string;
  executiveSummary: string;
  tableOfContents: Array<{
    section: string;
    page?: number;
    subsections?: Array<{
      title: string;
      page?: number;
    }>;
  }>;
  sections: ReportSection[];
  bibliography: string[];
  appendices?: ReportSection[];
  metadata: {
    generatedAt: string;
    query: string;
    sourceCount: number;
    confidenceScore: number;
    wordCount: number;
    estimatedReadingTime: number;
  };
}

export interface OutlineNode {
  id: string;
  title: string;
  level: number;
  children: OutlineNode[];
  content?: string;
  citations?: string[];
  priority: number;
}

export class ReportStructureGenerator {
  private synthesizedContent: SynthesizedContent;
  private originalQuery: string;
  private sourceCount: number;

  constructor(synthesizedContent: SynthesizedContent, originalQuery: string, sourceCount: number) {
    this.synthesizedContent = synthesizedContent;
    this.originalQuery = originalQuery;
    this.sourceCount = sourceCount;
  }

  /**
   * Generate complete report structure
   */
  public generateStructure(): ReportStructure {
    const outline = this.createOutline();
    const sections = this.buildSections(outline);
    const executiveSummary = this.generateExecutiveSummary();
    const title = this.generateTitle();
    const tableOfContents = this.generateTableOfContents(sections);
    const bibliography = this.generateBibliography();
    
    const totalWordCount = this.calculateWordCount(sections, executiveSummary);
    
    return {
      title,
      executiveSummary,
      tableOfContents,
      sections,
      bibliography,
      metadata: {
        generatedAt: new Date().toISOString(),
        query: this.originalQuery,
        sourceCount: this.sourceCount,
        confidenceScore: this.calculateOverallConfidence(),
        wordCount: totalWordCount,
        estimatedReadingTime: Math.ceil(totalWordCount / 200) // 200 words per minute
      }
    };
  }

  /**
   * Create logical outline based on synthesized content
   */
  private createOutline(): OutlineNode {
    const root: OutlineNode = {
      id: 'root',
      title: 'Research Report',
      level: 0,
      children: [],
      priority: 1
    };

    // 1. Introduction
    root.children.push({
      id: 'introduction',
      title: 'Introduction',
      level: 1,
      children: [
        {
          id: 'background',
          title: 'Background and Context',
          level: 2,
          children: [],
          priority: 3
        },
        {
          id: 'scope',
          title: 'Scope and Methodology',
          level: 2,
          children: [],
          priority: 2
        }
      ],
      priority: 3
    });

    // 2. Key Findings (based on themes)
    const findingsNode: OutlineNode = {
      id: 'findings',
      title: 'Key Findings',
      level: 1,
      children: [],
      priority: 5
    };

    this.synthesizedContent.keyThemes
      .sort((a, b) => this.getThemePriority(b) - this.getThemePriority(a))
      .forEach((theme, index) => {
        findingsNode.children.push({
          id: `finding-${index}`,
          title: theme.theme,
          level: 2,
          children: [],
          priority: this.getThemePriority(theme)
        });
      });

    root.children.push(findingsNode);

    // 3. Analysis and Discussion
    root.children.push({
      id: 'analysis',
      title: 'Analysis and Discussion',
      level: 1,
      children: [
        {
          id: 'trends',
          title: 'Emerging Trends',
          level: 2,
          children: [],
          priority: 3
        },
        {
          id: 'implications',
          title: 'Implications',
          level: 2,
          children: [],
          priority: 4
        }
      ],
      priority: 4
    });

    // 4. Timeline (if available)
    if (this.synthesizedContent.timeline && this.synthesizedContent.timeline.length > 0) {
      root.children.push({
        id: 'timeline',
        title: 'Chronological Development',
        level: 1,
        children: [],
        priority: 3
      });
    }

    // 5. Controversies and Limitations
    if (this.synthesizedContent.controversies.length > 0) {
      root.children.push({
        id: 'controversies',
        title: 'Controversies and Conflicting Evidence',
        level: 1,
        children: [],
        priority: 2
      });
    }

    // 6. Conclusion and Recommendations
    root.children.push({
      id: 'conclusion',
      title: 'Conclusion and Recommendations',
      level: 1,
      children: [
        {
          id: 'summary',
          title: 'Summary of Findings',
          level: 2,
          children: [],
          priority: 4
        },
        {
          id: 'recommendations',
          title: 'Recommendations',
          level: 2,
          children: [],
          priority: 3
        },
        {
          id: 'future-research',
          title: 'Areas for Future Research',
          level: 2,
          children: [],
          priority: 2
        }
      ],
      priority: 4
    });

    return root;
  }

  /**
   * Build sections from outline with content
   */
  private buildSections(outline: OutlineNode): ReportSection[] {
    const sections: ReportSection[] = [];

    outline.children.forEach(child => {
      const section = this.buildSection(child);
      sections.push(section);
    });

    return sections;
  }

  /**
   * Build individual section with content
   */
  private buildSection(node: OutlineNode): ReportSection {
    const content = this.generateSectionContent(node);
    const citations = this.extractRelevantCitations(node);
    
    const section: ReportSection = {
      id: node.id,
      title: node.title,
      content,
      citations,
      confidence: this.calculateSectionConfidence(node)
    };

    if (node.children.length > 0) {
      section.subsections = node.children.map(child => this.buildSection(child));
    }

    return section;
  }

  /**
   * Generate content for specific section
   */
  private generateSectionContent(node: OutlineNode): string {
    switch (node.id) {
      case 'introduction':
        return this.generateIntroductionContent();
      
      case 'background':
        return this.generateBackgroundContent();
      
      case 'scope':
        return this.generateScopeContent();
      
      case 'findings':
        return this.generateFindingsContent();
      
      case 'analysis':
        return this.generateAnalysisContent();
      
      case 'timeline':
        return this.generateTimelineContent();
      
      case 'controversies':
        return this.generateControversiesContent();
      
      case 'conclusion':
        return this.generateConclusionContent();
      
      default:
        // For theme-based sections
        if (node.id.startsWith('finding-')) {
          const themeIndex = parseInt(node.id.split('-')[1]);
          return this.generateThemeContent(this.synthesizedContent.keyThemes[themeIndex]);
        }
        
        return this.generateGenericSectionContent(node);
    }
  }

  /**
   * Generate executive summary
   */
  private generateExecutiveSummary(): string {
    let summary = `This research report examines "${this.originalQuery}" based on analysis of ${this.sourceCount} sources. `;
    
    // Key themes summary
    const strongThemes = this.synthesizedContent.keyThemes.filter(t => 
      t.consensus === 'strong' || t.consensus === 'moderate'
    );
    
    if (strongThemes.length > 0) {
      summary += `The analysis reveals ${strongThemes.length} major themes: `;
      summary += strongThemes.slice(0, 3).map(t => t.theme).join(', ') + '. ';
    }

    // Key statistics
    if (this.synthesizedContent.statistics.length > 0) {
      const topStats = this.synthesizedContent.statistics
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 2);
      
      summary += 'Notable findings include: ';
      topStats.forEach(stat => {
        summary += `${stat.metric} (${stat.value}); `;
      });
    }

    // Controversies mention
    if (this.synthesizedContent.controversies.length > 0) {
      summary += `The research identified ${this.synthesizedContent.controversies.length} areas of conflicting evidence. `;
    }

    summary += `The overall confidence level of findings is ${Math.round(this.calculateOverallConfidence() * 100)}%.`;

    return summary;
  }

  /**
   * Generate report title
   */
  private generateTitle(): string {
    // Extract key terms from query
    const keyTerms = this.originalQuery
      .split(' ')
      .filter(term => term.length > 3)
      .slice(0, 4)
      .map(term => term.charAt(0).toUpperCase() + term.slice(1))
      .join(' ');
    
    return `Research Report: ${keyTerms}`;
  }

  /**
   * Generate table of contents
   */
  private generateTableOfContents(sections: ReportSection[]): ReportStructure['tableOfContents'] {
    return sections.map((section, index) => ({
      section: section.title,
      page: index + 1, // Simplified page numbering
      subsections: section.subsections?.map((sub, subIndex) => ({
        title: sub.title,
        page: index + 1 + (subIndex * 0.1) // Simplified sub-page numbering
      }))
    }));
  }

  /**
   * Generate bibliography
   */
  private generateBibliography(): string[] {
    const citations = new Set<string>();
    
    // Collect all citations from all sections
    const collectCitations = (section: ReportSection) => {
      section.citations.forEach(citation => citations.add(citation));
      section.subsections?.forEach(collectCitations);
    };

    // This would be populated with actual citations from the report sections
    // For now, return placeholder
    return Array.from(citations);
  }

  // Content generation methods
  private generateIntroductionContent(): string {
    return `This report presents a comprehensive analysis of "${this.originalQuery}" based on systematic review of ${this.sourceCount} sources. The research employs automated content synthesis to identify key themes, trends, and insights while maintaining rigorous citation standards.`;
  }

  private generateBackgroundContent(): string {
    const mainTheme = this.synthesizedContent.keyThemes[0];
    if (mainTheme) {
      return `The topic of ${mainTheme.theme.toLowerCase()} has gained significant attention, with ${mainTheme.evidence.length} sources providing relevant insights. The analysis reveals ${mainTheme.consensus} consensus among sources.`;
    }
    return 'Background information is derived from the synthesized content analysis.';
  }

  private generateScopeContent(): string {
    return `This analysis encompasses ${this.sourceCount} sources, including various source types and credibility levels. The methodology employs automated content synthesis with confidence scoring and consensus assessment.`;
  }

  private generateFindingsContent(): string {
    return 'The following sections detail the key findings organized by thematic areas identified through content synthesis.';
  }

  private generateAnalysisContent(): string {
    return this.synthesizedContent.narrative || 'Detailed analysis of the synthesized content reveals several important patterns and implications.';
  }

  private generateTimelineContent(): string {
    if (!this.synthesizedContent.timeline || this.synthesizedContent.timeline.length === 0) {
      return 'No significant timeline events were identified in the source material.';
    }

    let content = 'The following chronological development was identified:\n\n';
    this.synthesizedContent.timeline.forEach(event => {
      content += `**${event.date}**: ${event.event} (Sources: ${event.sources.length})\n\n`;
    });

    return content;
  }

  private generateControversiesContent(): string {
    if (this.synthesizedContent.controversies.length === 0) {
      return 'No significant controversies or conflicting evidence were identified.';
    }

    let content = 'The analysis revealed several areas of conflicting evidence:\n\n';
    this.synthesizedContent.controversies.forEach((controversy, index) => {
      content += `**${index + 1}. ${controversy.topic}**\n`;
      controversy.conflictingSources.forEach(source => {
        content += `- Source position: ${source.position}\n`;
      });
      content += '\n';
    });

    return content;
  }

  private generateConclusionContent(): string {
    const strongThemes = this.synthesizedContent.keyThemes.filter(t => t.consensus === 'strong');
    return `The analysis of ${this.sourceCount} sources reveals ${strongThemes.length} areas of strong consensus. The overall research demonstrates ${Math.round(this.calculateOverallConfidence() * 100)}% confidence in findings.`;
  }

  private generateThemeContent(theme: SynthesizedContent['keyThemes'][0]): string {
    let content = `Analysis of ${theme.evidence.length} sources reveals ${theme.consensus} consensus on ${theme.theme.toLowerCase()}.\n\n`;
    
    // Add top evidence
    const topEvidence = theme.evidence
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
    
    topEvidence.forEach((evidence, index) => {
      content += `${index + 1}. ${evidence.claim} (Confidence: ${Math.round(evidence.confidence * 100)}%)\n`;
    });

    return content;
  }

  private generateGenericSectionContent(node: OutlineNode): string {
    return `Content for ${node.title} section. This section provides detailed analysis and insights related to the topic.`;
  }

  // Helper methods
  private getThemePriority(theme: SynthesizedContent['keyThemes'][0]): number {
    const consensusWeights = {
      'strong': 4,
      'moderate': 3,
      'weak': 2,
      'conflicting': 1
    };
    
    return consensusWeights[theme.consensus] * theme.evidence.length;
  }

  private extractRelevantCitations(node: OutlineNode): string[] {
    // This would extract relevant citations based on the node content
    // For now, return empty array as placeholder
    return [];
  }

  private calculateSectionConfidence(node: OutlineNode): number {
    // Calculate confidence based on the section's content and sources
    return this.calculateOverallConfidence();
  }

  private calculateOverallConfidence(): number {
    if (this.synthesizedContent.keyThemes.length === 0) return 0.5;
    
    const weights = {
      'strong': 0.9,
      'moderate': 0.7,
      'weak': 0.5,
      'conflicting': 0.3
    };
    
    const totalWeight = this.synthesizedContent.keyThemes.reduce((sum, theme) => {
      return sum + (weights[theme.consensus] * theme.evidence.length);
    }, 0);
    
    const totalEvidence = this.synthesizedContent.keyThemes.reduce((sum, theme) => {
      return sum + theme.evidence.length;
    }, 0);
    
    return totalEvidence > 0 ? totalWeight / totalEvidence : 0.5;
  }

  private calculateWordCount(sections: ReportSection[], executiveSummary: string): number {
    let totalWords = executiveSummary.split(/\s+/).length;
    
    const countSection = (section: ReportSection) => {
      totalWords += section.content.split(/\s+/).length;
      section.subsections?.forEach(countSection);
    };
    
    sections.forEach(countSection);
    return totalWords;
  }
}
