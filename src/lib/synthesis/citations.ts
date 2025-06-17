// Day 5: Enhanced Citation Integration
// Embed proper citations throughout text, create bibliography sections, implement citation style options

export type CitationStyle = 'apa' | 'mla' | 'chicago' | 'harvard' | 'ieee' | 'nature';

export interface CitationData {
  id: string;
  type: 'article' | 'book' | 'website' | 'journal' | 'report' | 'conference' | 'thesis';
  title: string;
  authors: string[];
  url?: string;
  doi?: string;
  publishedDate?: string;
  accessedDate?: string;
  publisher?: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  edition?: string;
  location?: string;
  isbn?: string;
  issn?: string;
}

export interface InlineCitation {
  id: string;
  sourceIds: string[];
  text: string;
  page?: string;
  quote?: string;
}

export interface Bibliography {
  style: CitationStyle;
  entries: Array<{
    id: string;
    formatted: string;
    source: CitationData;
  }>;
  sortOrder: 'alphabetical' | 'order-of-appearance' | 'chronological';
}

export class CitationFormatter {
  private style: CitationStyle;
  private citations: Map<string, CitationData>;
  private inlineCitations: InlineCitation[];

  constructor(style: CitationStyle = 'apa') {
    this.style = style;
    this.citations = new Map();
    this.inlineCitations = [];
  }

  /**
   * Add citation source
   */
  public addSource(citation: CitationData): void {
    this.citations.set(citation.id, citation);
  }

  /**
   * Add inline citation
   */
  public addInlineCitation(citation: InlineCitation): void {
    this.inlineCitations.push(citation);
  }

  /**
   * Format inline citation
   */
  public formatInlineCitation(sourceIds: string[], page?: string): string {
    switch (this.style) {
      case 'apa':
        return this.formatAPAInline(sourceIds, page);
      case 'mla':
        return this.formatMLAInline(sourceIds, page);
      case 'chicago':
        return this.formatChicagoInline(sourceIds, page);
      case 'harvard':
        return this.formatHarvardInline(sourceIds, page);
      case 'ieee':
        return this.formatIEEEInline(sourceIds, page);
      case 'nature':
        return this.formatNatureInline(sourceIds, page);
      default:
        return this.formatAPAInline(sourceIds, page);
    }
  }

  /**
   * Generate bibliography
   */
  public generateBibliography(sortOrder: 'alphabetical' | 'order-of-appearance' | 'chronological' = 'alphabetical'): Bibliography {
    const entries = Array.from(this.citations.entries()).map(([id, citation]) => ({
      id,
      formatted: this.formatBibliographyEntry(citation),
      source: citation
    }));

    // Sort entries based on specified order
    this.sortBibliography(entries, sortOrder);

    return {
      style: this.style,
      entries,
      sortOrder
    };
  }

  /**
   * Embed citations in text
   */
  public embedCitations(text: string): string {
    let embeddedText = text;

    // Find citation markers in text (e.g., [CITE:sourceId1,sourceId2])
    const citationPattern = /\[CITE:([^\]]+)\]/g;
    
    embeddedText = embeddedText.replace(citationPattern, (match, sourceList) => {
      const sourceIds = sourceList.split(',').map((id: string) => id.trim());
      return this.formatInlineCitation(sourceIds);
    });

    return embeddedText;
  }

  /**
   * Extract citations from content and create inline citations
   */
  public extractAndFormatCitations(content: string, sourceMap: Map<string, CitationData>): string {
    let processedContent = content;
    
    // Look for URL patterns and replace with proper citations
    const urlPattern = /(https?:\/\/[^\s\)]+)/g;
    
    processedContent = processedContent.replace(urlPattern, (url) => {
      // Find matching source by URL
      const matchingSource = Array.from(sourceMap.entries()).find(([_, citation]) => 
        citation.url === url
      );
      
      if (matchingSource) {
        const [sourceId] = matchingSource;
        return this.formatInlineCitation([sourceId]);
      }
      
      return url;
    });

    return processedContent;
  }

  // APA Style formatting
  private formatAPAInline(sourceIds: string[], page?: string): string {
    const citations = sourceIds.map(id => {
      const source = this.citations.get(id);
      if (!source) return id;
      
      const author = source.authors.length > 0 ? this.formatAuthorLastName(source.authors[0]) : 'Unknown';
      const year = source.publishedDate ? this.extractYear(source.publishedDate) : 'n.d.';
      
      return page ? `${author}, ${year}, p. ${page}` : `${author}, ${year}`;
    });
    
    return `(${citations.join('; ')})`;
  }

  private formatAPABibliography(citation: CitationData): string {
    const authors = this.formatAPAAuthors(citation.authors);
    const year = citation.publishedDate ? `(${this.extractYear(citation.publishedDate)})` : '(n.d.)';
    const title = citation.type === 'book' ? `*${citation.title}*` : citation.title;
    
    let formatted = `${authors} ${year}. ${title}.`;
    
    if (citation.journal) {
      formatted += ` *${citation.journal}*`;
      if (citation.volume) formatted += `, ${citation.volume}`;
      if (citation.issue) formatted += `(${citation.issue})`;
      if (citation.pages) formatted += `, ${citation.pages}`;
    }
    
    if (citation.publisher && citation.type === 'book') {
      formatted += ` ${citation.publisher}`;
    }
    
    if (citation.url) {
      formatted += ` Retrieved from ${citation.url}`;
    }
    
    return formatted;
  }

  // MLA Style formatting
  private formatMLAInline(sourceIds: string[], page?: string): string {
    const citations = sourceIds.map(id => {
      const source = this.citations.get(id);
      if (!source) return id;
      
      const author = source.authors.length > 0 ? this.formatAuthorLastName(source.authors[0]) : 'Unknown';
      
      return page ? `${author} ${page}` : author;
    });
    
    return `(${citations.join('; ')})`;
  }

  private formatMLABibliography(citation: CitationData): string {
    const authors = this.formatMLAAuthors(citation.authors);
    const title = citation.type === 'book' ? `*${citation.title}*` : `"${citation.title}"`;
    
    let formatted = `${authors}. ${title}.`;
    
    if (citation.journal) {
      formatted += ` *${citation.journal}*`;
      if (citation.volume) formatted += `, vol. ${citation.volume}`;
      if (citation.issue) formatted += `, no. ${citation.issue}`;
      if (citation.publishedDate) formatted += `, ${this.formatMLADate(citation.publishedDate)}`;
      if (citation.pages) formatted += `, pp. ${citation.pages}`;
    } else if (citation.publisher) {
      formatted += ` ${citation.publisher}`;
      if (citation.publishedDate) formatted += `, ${this.extractYear(citation.publishedDate)}`;
    }
    
    if (citation.url) {
      formatted += `. Web. ${this.formatMLADate(citation.accessedDate || new Date().toISOString())}`;
    }
    
    return formatted;
  }

  // Chicago Style formatting
  private formatChicagoInline(sourceIds: string[], page?: string): string {
    // Chicago uses footnotes, so we'll return a superscript number
    const footnoteNumber = this.getNextFootnoteNumber();
    return `<sup>${footnoteNumber}</sup>`;
  }

  private formatChicagoBibliography(citation: CitationData): string {
    const authors = this.formatChicagoAuthors(citation.authors);
    const title = citation.type === 'book' ? `*${citation.title}*` : `"${citation.title}"`;
    
    let formatted = `${authors}. ${title}.`;
    
    if (citation.journal) {
      formatted += ` *${citation.journal}*`;
      if (citation.volume) formatted += ` ${citation.volume}`;
      if (citation.issue) formatted += `, no. ${citation.issue}`;
      if (citation.publishedDate) formatted += ` (${this.formatChicagoDate(citation.publishedDate)})`;
      if (citation.pages) formatted += `: ${citation.pages}`;
    } else if (citation.publisher) {
      if (citation.location) formatted += ` ${citation.location}:`;
      formatted += ` ${citation.publisher}`;
      if (citation.publishedDate) formatted += `, ${this.extractYear(citation.publishedDate)}`;
    }
    
    if (citation.url) {
      formatted += `. Accessed ${this.formatChicagoDate(citation.accessedDate || new Date().toISOString())}. ${citation.url}`;
    }
    
    return formatted;
  }

  // Harvard Style formatting
  private formatHarvardInline(sourceIds: string[], page?: string): string {
    return this.formatAPAInline(sourceIds, page); // Harvard is similar to APA
  }

  private formatHarvardBibliography(citation: CitationData): string {
    return this.formatAPABibliography(citation); // Harvard bibliography is similar to APA
  }

  // IEEE Style formatting
  private formatIEEEInline(sourceIds: string[], page?: string): string {
    const numbers = sourceIds.map(id => {
      const index = Array.from(this.citations.keys()).indexOf(id) + 1;
      return `[${index}]`;
    });
    
    return numbers.join('');
  }

  private formatIEEEBibliography(citation: CitationData): string {
    const authors = this.formatIEEEAuthors(citation.authors);
    const title = `"${citation.title}"`;
    
    let formatted = `${authors}, ${title}`;
    
    if (citation.journal) {
      formatted += `, *${citation.journal}*`;
      if (citation.volume) formatted += `, vol. ${citation.volume}`;
      if (citation.issue) formatted += `, no. ${citation.issue}`;
      if (citation.pages) formatted += `, pp. ${citation.pages}`;
      if (citation.publishedDate) formatted += `, ${this.formatIEEEDate(citation.publishedDate)}`;
    }
    
    if (citation.url) {
      formatted += `. [Online]. Available: ${citation.url}`;
    }
    
    return formatted + '.';
  }

  // Nature Style formatting
  private formatNatureInline(sourceIds: string[], page?: string): string {
    const numbers = sourceIds.map(id => {
      const index = Array.from(this.citations.keys()).indexOf(id) + 1;
      return index.toString();
    });
    
    return `${numbers.join(',')}`;
  }

  private formatNatureBibliography(citation: CitationData): string {
    const authors = this.formatNatureAuthors(citation.authors);
    const title = citation.title;
    
    let formatted = `${authors} ${title}.`;
    
    if (citation.journal) {
      formatted += ` *${citation.journal}*`;
      if (citation.volume) formatted += ` **${citation.volume}**`;
      if (citation.pages) formatted += `, ${citation.pages}`;
      if (citation.publishedDate) formatted += ` (${this.extractYear(citation.publishedDate)})`;
    }
    
    return formatted;
  }

  // Main bibliography entry formatter
  private formatBibliographyEntry(citation: CitationData): string {
    switch (this.style) {
      case 'apa':
        return this.formatAPABibliography(citation);
      case 'mla':
        return this.formatMLABibliography(citation);
      case 'chicago':
        return this.formatChicagoBibliography(citation);
      case 'harvard':
        return this.formatHarvardBibliography(citation);
      case 'ieee':
        return this.formatIEEEBibliography(citation);
      case 'nature':
        return this.formatNatureBibliography(citation);
      default:
        return this.formatAPABibliography(citation);
    }
  }

  // Helper methods for author formatting
  private formatAPAAuthors(authors: string[]): string {
    if (authors.length === 0) return 'Unknown';
    if (authors.length === 1) return this.formatAuthorAPAStyle(authors[0]);
    if (authors.length <= 7) {
      const formatted = authors.slice(0, -1).map(author => this.formatAuthorAPAStyle(author)).join(', ');
      return `${formatted}, & ${this.formatAuthorAPAStyle(authors[authors.length - 1])}`;
    }
    // More than 7 authors
    const formatted = authors.slice(0, 6).map(author => this.formatAuthorAPAStyle(author)).join(', ');
    return `${formatted}, ... ${this.formatAuthorAPAStyle(authors[authors.length - 1])}`;
  }

  private formatMLAAuthors(authors: string[]): string {
    if (authors.length === 0) return 'Unknown';
    if (authors.length === 1) return this.formatAuthorMLAStyle(authors[0]);
    if (authors.length === 2) {
      return `${this.formatAuthorMLAStyle(authors[0])} and ${authors[1]}`;
    }
    // More than 2 authors
    return `${this.formatAuthorMLAStyle(authors[0])} et al.`;
  }

  private formatChicagoAuthors(authors: string[]): string {
    return this.formatAPAAuthors(authors); // Chicago uses similar format to APA
  }

  private formatIEEEAuthors(authors: string[]): string {
    if (authors.length === 0) return 'Unknown';
    if (authors.length <= 3) {
      return authors.map(author => this.formatAuthorIEEEStyle(author)).join(', ');
    }
    return `${this.formatAuthorIEEEStyle(authors[0])} et al.`;
  }

  private formatNatureAuthors(authors: string[]): string {
    if (authors.length === 0) return 'Unknown';
    if (authors.length <= 2) {
      return authors.map(author => this.formatAuthorNatureStyle(author)).join(' & ');
    }
    return `${this.formatAuthorNatureStyle(authors[0])} et al.`;
  }

  // Individual author formatting
  private formatAuthorAPAStyle(author: string): string {
    const parts = author.split(' ');
    if (parts.length < 2) return author;
    const lastName = parts[parts.length - 1];
    const firstNames = parts.slice(0, -1).map(name => name.charAt(0).toUpperCase() + '.').join(' ');
    return `${lastName}, ${firstNames}`;
  }

  private formatAuthorMLAStyle(author: string): string {
    const parts = author.split(' ');
    if (parts.length < 2) return author;
    const lastName = parts[parts.length - 1];
    const firstNames = parts.slice(0, -1).join(' ');
    return `${lastName}, ${firstNames}`;
  }

  private formatAuthorIEEEStyle(author: string): string {
    const parts = author.split(' ');
    if (parts.length < 2) return author;
    const lastName = parts[parts.length - 1];
    const firstNames = parts.slice(0, -1).map(name => name.charAt(0).toUpperCase() + '.').join(' ');
    return `${firstNames} ${lastName}`;
  }

  private formatAuthorNatureStyle(author: string): string {
    const parts = author.split(' ');
    if (parts.length < 2) return author;
    const lastName = parts[parts.length - 1];
    const firstNames = parts.slice(0, -1).map(name => name.charAt(0).toUpperCase() + '.').join(' ');
    return `${lastName}, ${firstNames}`;
  }

  private formatAuthorLastName(author: string): string {
    const parts = author.split(' ');
    return parts[parts.length - 1];
  }

  // Date formatting helpers
  private extractYear(dateString: string): string {
    const year = new Date(dateString).getFullYear();
    return isNaN(year) ? 'n.d.' : year.toString();
  }

  private formatMLADate(dateString: string): string {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  private formatChicagoDate(dateString: string): string {
    const date = new Date(dateString);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }

  private formatIEEEDate(dateString: string): string {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  // Bibliography sorting
  private sortBibliography(entries: Bibliography['entries'], sortOrder: Bibliography['sortOrder']): void {
    switch (sortOrder) {
      case 'alphabetical':
        entries.sort((a, b) => {
          const authorA = a.source.authors[0] || 'Unknown';
          const authorB = b.source.authors[0] || 'Unknown';
          return authorA.localeCompare(authorB);
        });
        break;
      
      case 'chronological':
        entries.sort((a, b) => {
          const dateA = new Date(a.source.publishedDate || '1900-01-01');
          const dateB = new Date(b.source.publishedDate || '1900-01-01');
          return dateB.getTime() - dateA.getTime(); // Most recent first
        });
        break;
      
      case 'order-of-appearance':
        // Keep the order as added
        break;
    }
  }

  // Footnote numbering (for Chicago style)
  private footnoteCounter = 0;
  
  private getNextFootnoteNumber(): number {
    return ++this.footnoteCounter;
  }

  /**
   * Get citation style guidelines
   */
  public getStyleGuidelines(): string {
    const guidelines = {
      apa: 'American Psychological Association (APA) - Common in psychology, education, and social sciences',
      mla: 'Modern Language Association (MLA) - Common in literature, arts, and humanities',
      chicago: 'Chicago Manual of Style - Common in history, literature, and arts',
      harvard: 'Harvard Referencing - Common in social sciences and humanities',
      ieee: 'Institute of Electrical and Electronics Engineers (IEEE) - Common in engineering and computer science',
      nature: 'Nature Style - Common in natural sciences'
    };
    
    return guidelines[this.style] || 'Unknown citation style';
  }

  /**
   * Validate citation data
   */
  public validateCitation(citation: CitationData): string[] {
    const errors: string[] = [];
    
    if (!citation.title) errors.push('Title is required');
    if (citation.authors.length === 0) errors.push('At least one author is required');
    if (!citation.publishedDate && !citation.accessedDate) errors.push('Publication date or access date is required');
    
    if (citation.type === 'journal' && !citation.journal) {
      errors.push('Journal name is required for journal articles');
    }
    
    if (citation.type === 'website' && !citation.url) {
      errors.push('URL is required for website citations');
    }
    
    return errors;
  }
}
