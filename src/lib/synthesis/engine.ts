// Day 5: Content Synthesis Engine
// Combines information from multiple sources, creates coherent narratives, maintains proper attribution

export interface SourceContent {
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
}

export interface SynthesizedContent {
  narrative: string;
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
}

export interface ReportSection {
  id: string;
  title: string;
  content: string;
  subsections?: ReportSection[];
  citations: string[];
  confidence: number;
}

export class ContentSynthesisEngine {
  private sources: SourceContent[];
  
  constructor(sources: SourceContent[]) {
    this.sources = sources;
  }

  /**
   * Main synthesis method that combines information from multiple sources
   */
  public synthesizeContent(): SynthesizedContent {
    const keyThemes = this.extractThemes();
    const timeline = this.constructTimeline();
    const statistics = this.aggregateStatistics();
    const controversies = this.identifyControversies();
    const narrative = this.generateNarrative(keyThemes, timeline, statistics);

    return {
      narrative,
      keyThemes,
      timeline,
      statistics,
      controversies
    };
  }

  /**
   * Extract and consolidate themes across sources
   */
  private extractThemes(): SynthesizedContent['keyThemes'] {
    const themeMap = new Map<string, Array<{ sourceId: string; claim: string; confidence: number }>>();

    // Extract themes from each source
    this.sources.forEach(source => {
      source.keyFacts.forEach(fact => {
        const theme = this.categorizeTheme(fact.claim);
        if (!themeMap.has(theme)) {
          themeMap.set(theme, []);
        }
        themeMap.get(theme)!.push({
          sourceId: source.id,
          claim: fact.claim,
          confidence: fact.confidence * source.credibilityScore
        });
      });
    });

    // Convert to structured themes with consensus assessment
    return Array.from(themeMap.entries()).map(([theme, evidence]) => ({
      theme,
      evidence,
      consensus: this.assessConsensus(evidence)
    }));
  }

  /**
   * Construct chronological timeline from dated events
   */
  private constructTimeline(): Array<{ date: string; event: string; sources: string[] }> {
    const events: Array<{ date: string; event: string; sources: string[] }> = [];
    
    this.sources.forEach(source => {
      const dateMatches = source.content.match(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/g);
      
      if (dateMatches && source.publishedDate) {
        dateMatches.forEach(dateStr => {
          const context = this.extractEventContext(source.content, dateStr);
          if (context) {
            events.push({
              date: dateStr,
              event: context,
              sources: [source.id]
            });
          }
        });
      }
    });

    // Merge similar events and sort chronologically
    return this.mergeAndSortEvents(events);
  }

  /**
   * Aggregate and validate statistics across sources
   */
  private aggregateStatistics(): Array<{ metric: string; value: string; source: string; confidence: number }> {
    const statistics: Array<{ metric: string; value: string; source: string; confidence: number }> = [];

    this.sources.forEach(source => {
      const statMatches = source.content.match(/\b\d+(?:,\d{3})*(?:\.\d+)?\s*(?:%|percent|million|billion|thousand|\$)\b/g);
      
      if (statMatches) {
        statMatches.forEach(stat => {
          const context = this.extractStatisticContext(source.content, stat);
          if (context) {
            statistics.push({
              metric: context,
              value: stat,
              source: source.id,
              confidence: source.credibilityScore
            });
          }
        });
      }
    });

    return this.deduplicateStatistics(statistics);
  }

  /**
   * Identify conflicting information and controversies
   */
  private identifyControversies(): Array<{ topic: string; conflictingSources: Array<{ sourceId: string; position: string }> }> {
    const controversies: Array<{ topic: string; conflictingSources: Array<{ sourceId: string; position: string }> }> = [];
    
    // Look for opposing viewpoints on similar topics
    const topicGroups = this.groupByTopic();
    
    topicGroups.forEach((sources, topic) => {
      if (sources.length > 1) {
        const positions = sources.map(source => ({
          sourceId: source.id,
          position: this.extractPosition(source, topic)
        }));

        // Check for conflicting positions
        if (this.hasConflictingPositions(positions)) {
          controversies.push({
            topic,
            conflictingSources: positions
          });
        }
      }
    });

    return controversies;
  }

  /**
   * Generate coherent narrative from synthesized information
   */
  private generateNarrative(
    themes: SynthesizedContent['keyThemes'],
    timeline?: SynthesizedContent['timeline'],
    statistics?: SynthesizedContent['statistics']
  ): string {
    let narrative = '';

    // Introduction based on strongest themes
    const strongThemes = themes.filter(t => t.consensus === 'strong' || t.consensus === 'moderate');
    if (strongThemes.length > 0) {
      narrative += `Based on analysis of ${this.sources.length} sources, several key themes emerge. `;
      narrative += strongThemes.slice(0, 3).map(t => t.theme).join(', ') + '. ';
    }

    // Timeline integration
    if (timeline && timeline.length > 0) {
      narrative += `\n\nThe chronological development shows: `;
      timeline.slice(0, 3).forEach(event => {
        narrative += `${event.date}: ${event.event}. `;
      });
    }

    // Statistical evidence
    if (statistics && statistics.length > 0) {
      narrative += `\n\nKey metrics indicate: `;
      statistics.slice(0, 3).forEach(stat => {
        narrative += `${stat.metric}: ${stat.value}. `;
      });
    }

    return narrative.trim();
  }

  // Helper methods
  private categorizeTheme(claim: string): string {
    const keywords = claim.toLowerCase();
    
    if (keywords.includes('economic') || keywords.includes('financial') || keywords.includes('market')) {
      return 'Economic Impact';
    } else if (keywords.includes('health') || keywords.includes('medical') || keywords.includes('safety')) {
      return 'Health & Safety';
    } else if (keywords.includes('technology') || keywords.includes('digital') || keywords.includes('innovation')) {
      return 'Technology';
    } else if (keywords.includes('environment') || keywords.includes('climate') || keywords.includes('sustainability')) {
      return 'Environmental';
    } else if (keywords.includes('social') || keywords.includes('community') || keywords.includes('society')) {
      return 'Social Impact';
    } else {
      return 'General';
    }
  }

  private assessConsensus(evidence: Array<{ sourceId: string; claim: string; confidence: number }>): 'strong' | 'moderate' | 'weak' | 'conflicting' {
    if (evidence.length === 0) return 'weak';
    
    const avgConfidence = evidence.reduce((sum, e) => sum + e.confidence, 0) / evidence.length;
    const sourceCount = evidence.length;
    
    // Check for conflicting claims
    const uniqueClaims = new Set(evidence.map(e => e.claim.toLowerCase().substring(0, 50)));
    if (uniqueClaims.size / evidence.length > 0.7) {
      return 'conflicting';
    }
    
    if (avgConfidence > 0.8 && sourceCount >= 3) return 'strong';
    if (avgConfidence > 0.6 && sourceCount >= 2) return 'moderate';
    return 'weak';
  }

  private extractEventContext(content: string, dateStr: string): string | null {
    const dateIndex = content.indexOf(dateStr);
    if (dateIndex === -1) return null;
    
    // Extract surrounding context (up to 200 characters around the date)
    const start = Math.max(0, dateIndex - 100);
    const end = Math.min(content.length, dateIndex + dateStr.length + 100);
    const context = content.substring(start, end).trim();
    
    // Extract the sentence containing the date
    const sentences = context.split(/[.!?]+/);
    const targetSentence = sentences.find(s => s.includes(dateStr));
    
    return targetSentence?.trim() || null;
  }

  private extractStatisticContext(content: string, stat: string): string | null {
    const statIndex = content.indexOf(stat);
    if (statIndex === -1) return null;
    
    // Extract surrounding context
    const start = Math.max(0, statIndex - 50);
    const end = Math.min(content.length, statIndex + stat.length + 50);
    const context = content.substring(start, end);
    
    // Clean and return context
    return context.replace(/\s+/g, ' ').trim();
  }

  private deduplicateStatistics(stats: Array<{ metric: string; value: string; source: string; confidence: number }>): Array<{ metric: string; value: string; source: string; confidence: number }> {
    const uniqueStats = new Map<string, { metric: string; value: string; source: string; confidence: number }>();
    
    stats.forEach(stat => {
      const key = `${stat.metric}-${stat.value}`;
      if (!uniqueStats.has(key) || uniqueStats.get(key)!.confidence < stat.confidence) {
        uniqueStats.set(key, stat);
      }
    });
    
    return Array.from(uniqueStats.values());
  }

  private groupByTopic(): Map<string, SourceContent[]> {
    const topicGroups = new Map<string, SourceContent[]>();
    
    this.sources.forEach(source => {
      source.keyFacts.forEach(fact => {
        const topic = this.categorizeTheme(fact.claim);
        if (!topicGroups.has(topic)) {
          topicGroups.set(topic, []);
        }
        if (!topicGroups.get(topic)!.includes(source)) {
          topicGroups.get(topic)!.push(source);
        }
      });
    });
    
    return topicGroups;
  }

  private extractPosition(source: SourceContent, topic: string): string {
    const relevantFacts = source.keyFacts.filter(fact => 
      this.categorizeTheme(fact.claim) === topic
    );
    
    if (relevantFacts.length === 0) return 'No clear position';
    
    // Return the highest confidence claim for this topic
    const bestFact = relevantFacts.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );
    
    return bestFact.claim;
  }

  private hasConflictingPositions(positions: Array<{ sourceId: string; position: string }>): boolean {
    if (positions.length < 2) return false;
    
    // Simple check for conflicting language
    const positiveWords = ['increase', 'improve', 'benefit', 'positive', 'support'];
    const negativeWords = ['decrease', 'worsen', 'harm', 'negative', 'oppose'];
    
    let hasPositive = false;
    let hasNegative = false;
    
    positions.forEach(pos => {
      const text = pos.position.toLowerCase();
      if (positiveWords.some(word => text.includes(word))) hasPositive = true;
      if (negativeWords.some(word => text.includes(word))) hasNegative = true;
    });
    
    return hasPositive && hasNegative;
  }

  private mergeAndSortEvents(events: Array<{ date: string; event: string; sources: string[] }>): Array<{ date: string; event: string; sources: string[] }> {
    // Group by date and merge similar events
    const eventMap = new Map<string, { event: string; sources: string[] }>();
    
    events.forEach(event => {
      if (eventMap.has(event.date)) {
        const existing = eventMap.get(event.date)!;
        existing.sources.push(...event.sources);
        // Keep the longer event description
        if (event.event.length > existing.event.length) {
          existing.event = event.event;
        }
      } else {
        eventMap.set(event.date, { event: event.event, sources: event.sources });
      }
    });
    
    // Convert back to array and sort by date
    return Array.from(eventMap.entries())
      .map(([date, { event, sources }]) => ({ date, event, sources }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
}
