// Day 5: Multiple Output Formats
// Generate PDF reports, create Markdown output, implement JSON data export

import { ReportStructure } from './structure';
import { ReportSection } from './engine';

export interface ExportOptions {
  format: 'pdf' | 'markdown' | 'json' | 'html';
  includeMetadata?: boolean;
  includeBibliography?: boolean;
  includeTableOfContents?: boolean;
  template?: 'academic' | 'business' | 'minimal';
  citationStyle?: 'apa' | 'mla' | 'chicago' | 'harvard' | 'ieee' | 'nature';
}

export interface ExportResult {
  success: boolean;
  content?: string;
  fileName?: string;
  mimeType?: string;
  error?: string;
}

export class ReportExporter {
  private report: ReportStructure;

  constructor(report: ReportStructure) {
    this.report = report;
  }

  /**
   * Export report in specified format
   */
  public async export(options: ExportOptions): Promise<ExportResult> {
    try {
      switch (options.format) {
        case 'markdown':
          return this.exportMarkdown(options);
        case 'json':
          return this.exportJSON(options);
        case 'html':
          return this.exportHTML(options);
        case 'pdf':
          return this.exportPDF(options);
        default:
          throw new Error(`Unsupported format: ${options.format}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed'
      };
    }
  }

  /**
   * Export as Markdown
   */
  private exportMarkdown(options: ExportOptions): ExportResult {
    let markdown = '';

    // Title
    markdown += `# ${this.report.title}\n\n`;

    // Metadata
    if (options.includeMetadata !== false) {
      markdown += this.generateMarkdownMetadata();
    }

    // Table of Contents
    if (options.includeTableOfContents !== false) {
      markdown += this.generateMarkdownTOC();
    }

    // Executive Summary
    markdown += `## Executive Summary\n\n${this.report.executiveSummary}\n\n`;

    // Sections
    this.report.sections.forEach(section => {
      markdown += this.convertSectionToMarkdown(section, 2);
    });

    // Bibliography
    if (options.includeBibliography !== false && this.report.bibliography.length > 0) {
      markdown += this.generateMarkdownBibliography();
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `report-${timestamp}.md`;

    return {
      success: true,
      content: markdown,
      fileName,
      mimeType: 'text/markdown'
    };
  }

  /**
   * Export as JSON
   */
  private exportJSON(options: ExportOptions): ExportResult {
    const jsonData = {
      ...this.report,
      exportOptions: options,
      exportedAt: new Date().toISOString()
    };

    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `report-data-${timestamp}.json`;

    return {
      success: true,
      content: JSON.stringify(jsonData, null, 2),
      fileName,
      mimeType: 'application/json'
    };
  }

  /**
   * Export as HTML
   */
  private exportHTML(options: ExportOptions): ExportResult {
    const template = options.template || 'academic';
    const html = this.generateHTML(template, options);

    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `report-${timestamp}.html`;

    return {
      success: true,
      content: html,
      fileName,
      mimeType: 'text/html'
    };
  }

  /**
   * Export as PDF (simplified - would require additional PDF library)
   */
  private async exportPDF(options: ExportOptions): Promise<ExportResult> {
    // For now, return HTML that can be converted to PDF
    const htmlResult = this.exportHTML({ ...options, format: 'html' });
    
    if (!htmlResult.success) {
      return htmlResult;
    }

    // In a real implementation, you would use libraries like:
    // - puppeteer for headless Chrome PDF generation
    // - jsPDF for client-side PDF generation
    // - PDFKit for server-side PDF generation

    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `report-${timestamp}.pdf`;

    return {
      success: true,
      content: htmlResult.content, // Would be PDF binary data in real implementation
      fileName,
      mimeType: 'application/pdf'
    };
  }

  /**
   * Generate HTML content
   */
  private generateHTML(template: string, options: ExportOptions): string {
    const styles = this.getTemplateStyles(template);
    
    let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.report.title}</title>
    <style>${styles}</style>
</head>
<body>
    <div class="report-container">
`;

    // Title page
    html += this.generateHTMLTitlePage();

    // Table of Contents
    if (options.includeTableOfContents !== false) {
      html += this.generateHTMLTOC();
    }

    // Executive Summary
    html += `
        <section class="executive-summary">
            <h2>Executive Summary</h2>
            <p>${this.report.executiveSummary}</p>
        </section>
`;

    // Sections
    this.report.sections.forEach(section => {
      html += this.convertSectionToHTML(section, 2);
    });

    // Bibliography
    if (options.includeBibliography !== false && this.report.bibliography.length > 0) {
      html += this.generateHTMLBibliography();
    }

    // Metadata footer
    if (options.includeMetadata !== false) {
      html += this.generateHTMLMetadata();
    }

    html += `
    </div>
</body>
</html>`;

    return html;
  }

  /**
   * Generate Markdown metadata section
   */
  private generateMarkdownMetadata(): string {
    const metadata = this.report.metadata;
    
    return `---
**Report Metadata**

- **Query:** ${metadata.query}
- **Generated:** ${new Date(metadata.generatedAt).toLocaleString()}
- **Sources:** ${metadata.sourceCount}
- **Confidence Score:** ${Math.round(metadata.confidenceScore * 100)}%
- **Word Count:** ${metadata.wordCount}
- **Reading Time:** ${metadata.estimatedReadingTime} minutes

---

`;
  }

  /**
   * Generate Markdown Table of Contents
   */
  private generateMarkdownTOC(): string {
    let toc = `## Table of Contents\n\n`;
    
    this.report.tableOfContents.forEach(item => {
      toc += `- [${item.section}](#${this.slugify(item.section)})\n`;
      
      if (item.subsections) {
        item.subsections.forEach(sub => {
          toc += `  - [${sub.title}](#${this.slugify(sub.title)})\n`;
        });
      }
    });
    
    toc += '\n';
    return toc;
  }

  /**
   * Convert section to Markdown
   */
  private convertSectionToMarkdown(section: ReportSection, level: number): string {
    const headingLevel = '#'.repeat(level);
    let markdown = `${headingLevel} ${section.title}\n\n`;
    
    markdown += `${section.content}\n\n`;
    
    // Add citations if present
    if (section.citations.length > 0) {
      markdown += `*Sources: ${section.citations.join(', ')}*\n\n`;
    }
    
    // Add subsections
    if (section.subsections) {
      section.subsections.forEach((subsection: ReportSection) => {
        markdown += this.convertSectionToMarkdown(subsection, level + 1);
      });
    }
    
    return markdown;
  }

  /**
   * Generate Markdown bibliography
   */
  private generateMarkdownBibliography(): string {
    let bibliography = `## Bibliography\n\n`;
    
    this.report.bibliography.forEach((citation, index) => {
      bibliography += `${index + 1}. ${citation}\n`;
    });
    
    bibliography += '\n';
    return bibliography;
  }

  /**
   * Generate HTML title page
   */
  private generateHTMLTitlePage(): string {
    return `
        <div class="title-page">
            <h1>${this.report.title}</h1>
            <div class="subtitle">
                <p><strong>Research Query:</strong> ${this.report.metadata.query}</p>
                <p><strong>Generated:</strong> ${new Date(this.report.metadata.generatedAt).toLocaleString()}</p>
            </div>
        </div>
        <div class="page-break"></div>
`;
  }

  /**
   * Generate HTML Table of Contents
   */
  private generateHTMLTOC(): string {
    let toc = `
        <section class="table-of-contents">
            <h2>Table of Contents</h2>
            <ul class="toc-list">
`;
    
    this.report.tableOfContents.forEach(item => {
      toc += `                <li><a href="#${this.slugify(item.section)}">${item.section}</a>`;
      
      if (item.subsections) {
        toc += `
                    <ul>`;
        item.subsections.forEach(sub => {
          toc += `
                        <li><a href="#${this.slugify(sub.title)}">${sub.title}</a></li>`;
        });
        toc += `
                    </ul>`;
      }
      
      toc += `</li>
`;
    });
    
    toc += `            </ul>
        </section>
`;
    
    return toc;
  }

  /**
   * Convert section to HTML
   */
  private convertSectionToHTML(section: ReportSection, level: number): string {
    const headingTag = `h${level}`;
    const sectionId = this.slugify(section.title);
    
    let html = `
        <section class="report-section" id="${sectionId}">
            <${headingTag}>${section.title}</${headingTag}>
            <div class="section-content">
                ${this.formatHTMLContent(section.content)}
            </div>
`;
    
    // Add citations if present
    if (section.citations.length > 0) {
      html += `
            <div class="citations">
                <small><em>Sources: ${section.citations.join(', ')}</em></small>
            </div>
`;
    }
    
    // Add subsections
    if (section.subsections) {
      section.subsections.forEach((subsection: ReportSection) => {
        html += this.convertSectionToHTML(subsection, level + 1);
      });
    }
    
    html += `        </section>
`;
    
    return html;
  }

  /**
   * Generate HTML bibliography
   */
  private generateHTMLBibliography(): string {
    let bibliography = `
        <section class="bibliography">
            <h2>Bibliography</h2>
            <ol class="bibliography-list">
`;
    
    this.report.bibliography.forEach(citation => {
      bibliography += `                <li>${citation}</li>
`;
    });
    
    bibliography += `            </ol>
        </section>
`;
    
    return bibliography;
  }

  /**
   * Generate HTML metadata footer
   */
  private generateHTMLMetadata(): string {
    const metadata = this.report.metadata;
    
    return `
        <footer class="report-metadata">
            <hr>
            <div class="metadata-grid">
                <div class="metadata-item">
                    <strong>Sources:</strong> ${metadata.sourceCount}
                </div>
                <div class="metadata-item">
                    <strong>Confidence:</strong> ${Math.round(metadata.confidenceScore * 100)}%
                </div>
                <div class="metadata-item">
                    <strong>Word Count:</strong> ${metadata.wordCount}
                </div>
                <div class="metadata-item">
                    <strong>Reading Time:</strong> ${metadata.estimatedReadingTime} min
                </div>
            </div>
        </footer>
`;
  }

  /**
   * Get template-specific CSS styles
   */
  private getTemplateStyles(template: string): string {
    const baseStyles = `
        body {
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
            color: #333;
        }
        
        .report-container {
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            padding: 40px;
        }
        
        .title-page {
            text-align: center;
            margin-bottom: 60px;
        }
        
        .title-page h1 {
            font-size: 2.5em;
            margin-bottom: 20px;
            color: #2c3e50;
        }
        
        .subtitle {
            font-size: 1.1em;
            color: #666;
        }
        
        .page-break {
            page-break-after: always;
        }
        
        .table-of-contents {
            margin-bottom: 40px;
        }
        
        .toc-list {
            list-style: none;
            padding-left: 0;
        }
        
        .toc-list li {
            margin: 8px 0;
        }
        
        .toc-list ul {
            margin-left: 20px;
        }
        
        .toc-list a {
            text-decoration: none;
            color: #2c3e50;
        }
        
        .toc-list a:hover {
            text-decoration: underline;
        }
        
        .report-section {
            margin-bottom: 30px;
        }
        
        .section-content {
            margin: 15px 0;
        }
        
        .citations {
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid #eee;
        }
        
        .executive-summary {
            background: #f8f9fa;
            padding: 20px;
            border-left: 4px solid #007bff;
            margin-bottom: 30px;
        }
        
        .bibliography {
            margin-top: 40px;
        }
        
        .bibliography-list {
            padding-left: 20px;
        }
        
        .bibliography-list li {
            margin: 10px 0;
        }
        
        .report-metadata {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #eee;
        }
        
        .metadata-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-top: 10px;
        }
        
        .metadata-item {
            font-size: 0.9em;
            color: #666;
        }
        
        h1, h2, h3, h4, h5, h6 {
            color: #2c3e50;
            margin-top: 30px;
            margin-bottom: 15px;
        }
        
        p {
            margin: 15px 0;
            text-align: justify;
        }
        
        @media print {
            .report-container {
                box-shadow: none;
                padding: 0;
            }
            
            .page-break {
                page-break-after: always;
            }
        }
    `;

    switch (template) {
      case 'business':
        return baseStyles + `
            body { font-family: Arial, sans-serif; }
            .title-page h1 { color: #1f2937; }
            .executive-summary { background: #f3f4f6; border-left-color: #059669; }
        `;
      
      case 'minimal':
        return baseStyles + `
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
            .report-container { box-shadow: none; }
            .executive-summary { background: none; border: 1px solid #ddd; }
        `;
      
      default: // academic
        return baseStyles;
    }
  }

  /**
   * Format content for HTML (convert line breaks, etc.)
   */
  private formatHTMLContent(content: string): string {
    return content
      .replace(/\n\n/g, '</p><p>')
      .replace(/^\s*/, '<p>')
      .replace(/\s*$/, '</p>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  }

  /**
   * Create URL-friendly slug from text
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

/**
 * Utility function to download content as file
 */
export function downloadReport(content: string, fileName: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Utility function to preview HTML content
 */
export function previewHTML(content: string): void {
  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.write(content);
    newWindow.document.close();
  }
}
