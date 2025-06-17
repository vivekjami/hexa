'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Download,
  BookOpen,
  FileDown,
  Settings,
  Copy,
  BarChart3,
  Clock,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface EnhancedReportData {
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
    style: string;
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
}

interface EnhancedReportComponentProps {
  data: EnhancedReportData;
  originalQuery: string;
  onRegenerateReport?: (options: any) => void;
  isLoading?: boolean;
}

export default function EnhancedReportComponent({ 
  data, 
  onRegenerateReport,
  isLoading = false 
}: EnhancedReportComponentProps) {
  const [activeTab, setActiveTab] = useState<'report' | 'synthesis' | 'bibliography' | 'timeline'>('report');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'markdown' | 'json' | 'html'>('markdown');
  const [citationStyle, setCitationStyle] = useState<'apa' | 'mla' | 'chicago' | 'harvard'>('apa');
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleExport = async () => {
    if (onRegenerateReport) {
      await onRegenerateReport({
        exportFormat,
        citationStyle,
        includeMetadata: true,
        includeBibliography: true,
        includeTableOfContents: true
      });
    }
  };

  const copyToClipboard = async (content: string, sectionId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedSection(sectionId);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy content:', err);
    }
  };

  const downloadContent = (content: string, fileName: string, mimeType: string) => {
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
  };

  const getConsensusColor = (consensus: string) => {
    switch (consensus) {
      case 'strong': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-blue-600 bg-blue-100';
      case 'weak': return 'text-yellow-600 bg-yellow-100';
      case 'conflicting': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="bg-gray-200 rounded-lg h-48"></div>
          <div className="space-y-4">
            <div className="bg-gray-200 rounded h-6 w-3/4"></div>
            <div className="bg-gray-200 rounded h-4 w-full"></div>
            <div className="bg-gray-200 rounded h-4 w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header with controls */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">{data.report.title}</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportOptions(!showExportOptions)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Export Options
            </Button>
            
            <Button
              onClick={handleExport}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Generate Export
            </Button>
          </div>
        </div>

        {/* Export options panel */}
        {showExportOptions && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export Format
                </label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  aria-label="Export Format"
                >
                  <option value="markdown">Markdown</option>
                  <option value="html">HTML</option>
                  <option value="pdf">PDF</option>
                  <option value="json">JSON Data</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Citation Style
                </label>
                <select
                  value={citationStyle}
                  onChange={(e) => setCitationStyle(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  aria-label="Citation Style"
                >
                  <option value="apa">APA</option>
                  <option value="mla">MLA</option>
                  <option value="chicago">Chicago</option>
                  <option value="harvard">Harvard</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Report metadata */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-blue-600">{data.report.metadata.sourceCount}</div>
            <div className="text-gray-600">Sources</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-green-600">
              {Math.round(data.report.metadata.confidenceScore * 100)}%
            </div>
            <div className="text-gray-600">Confidence</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-purple-600">{data.report.metadata.wordCount}</div>
            <div className="text-gray-600">Words</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-orange-600">{data.report.metadata.estimatedReadingTime}</div>
            <div className="text-gray-600">Min Read</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-600">{data.report.sections.length}</div>
            <div className="text-gray-600">Sections</div>
          </div>
        </div>
      </Card>

      {/* Navigation tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'report', label: 'Report', icon: FileText },
          { id: 'synthesis', label: 'Analysis', icon: BarChart3 },
          { id: 'timeline', label: 'Timeline', icon: Clock },
          { id: 'bibliography', label: 'Bibliography', icon: BookOpen }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'report' && (
        <div className="space-y-6">
          {/* Executive Summary */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Executive Summary</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(data.report.executiveSummary, 'executive-summary')}
              >
                <Copy className="h-4 w-4" />
                {copiedSection === 'executive-summary' ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">{data.report.executiveSummary}</p>
            </div>
          </Card>

          {/* Report sections */}
          {data.report.sections.map((section) => (
            <Card key={section.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{section.title}</h3>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${getConfidenceColor(section.confidence)}`}>
                    {Math.round(section.confidence * 100)}% confident
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(section.content, section.id)}
                  >
                    <Copy className="h-4 w-4" />
                    {copiedSection === section.id ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>
              
              <div className="prose max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {section.content}
                </div>
              </div>

              {section.citations.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    <strong>Citations:</strong> {section.citations.join(', ')}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'synthesis' && (
        <div className="space-y-6">
          {/* Key Themes */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Key Themes Analysis</h2>
            <div className="space-y-4">
              {data.synthesis.keyThemes.map((theme, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{theme.theme}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConsensusColor(theme.consensus)}`}>
                      {theme.consensus} consensus
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {theme.evidence.slice(0, 3).map((evidence, evidenceIndex) => (
                      <div key={evidenceIndex} className="text-sm bg-gray-50 p-3 rounded">
                        <div className="font-medium text-gray-800">{evidence.claim}</div>
                        <div className="text-gray-600 mt-1">
                          Confidence: {Math.round(evidence.confidence * 100)}%
                        </div>
                      </div>
                    ))}
                    {theme.evidence.length > 3 && (
                      <div className="text-sm text-gray-600">
                        ... and {theme.evidence.length - 3} more pieces of evidence
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Statistics */}
          {data.synthesis.statistics.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Key Statistics</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {data.synthesis.statistics.map((stat, index) => (
                  <div key={index} className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-lg font-bold text-blue-900">{stat.value}</div>
                    <div className="text-sm text-blue-700">{stat.metric}</div>
                    <div className="text-xs text-blue-600 mt-1">
                      Confidence: {Math.round(stat.confidence * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Controversies */}
          {data.synthesis.controversies.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                Controversies & Conflicting Evidence
              </h2>
              <div className="space-y-4">
                {data.synthesis.controversies.map((controversy, index) => (
                  <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <h3 className="font-medium text-red-900 mb-2">{controversy.topic}</h3>
                    <div className="space-y-2">
                      {controversy.conflictingSources.map((source, sourceIndex) => (
                        <div key={sourceIndex} className="text-sm bg-white p-2 rounded border">
                          <div className="font-medium text-gray-800">Source Position:</div>
                          <div className="text-gray-700">{source.position}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'timeline' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Chronological Timeline</h2>
          {data.synthesis.timeline && data.synthesis.timeline.length > 0 ? (
            <div className="space-y-4">
              {data.synthesis.timeline.map((event, index) => (
                <div key={index} className="flex items-start space-x-4 pb-4 border-b border-gray-200 last:border-b-0">
                  <div className="flex-shrink-0 w-24 text-sm font-medium text-blue-600">
                    {event.date}
                  </div>
                  <div className="flex-grow">
                    <div className="text-gray-900">{event.event}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Sources: {event.sources.length}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No timeline events were identified in the source material.</p>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'bibliography' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Bibliography ({data.bibliography.style.toUpperCase()} Style)</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const content = data.bibliography.entries.map((entry, index) => 
                  `${index + 1}. ${entry.formatted}`
                ).join('\n\n');
                copyToClipboard(content, 'bibliography');
              }}
            >
              <Copy className="h-4 w-4 mr-2" />
              {copiedSection === 'bibliography' ? 'Copied!' : 'Copy All'}
            </Button>
          </div>
          
          <div className="space-y-3">
            {data.bibliography.entries.map((entry, index) => (
              <div key={entry.id} className="p-3 bg-gray-50 rounded border">
                <div className="flex items-start justify-between">
                  <div className="flex-grow">
                    <span className="text-sm font-medium text-gray-600 mr-2">{index + 1}.</span>
                    <span className="text-sm text-gray-800 font-mono">{entry.formatted}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(entry.formatted, `citation-${index}`)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {data.bibliography.entries.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No bibliography entries available.</p>
            </div>
          )}
        </Card>
      )}

      {/* Export download section */}
      {data.export && (
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-900">Export Ready</h3>
                <p className="text-sm text-green-700">
                  Your report has been generated and is ready for download
                </p>
              </div>
            </div>
            <Button
              onClick={() => downloadContent(data.export!.content, data.export!.fileName, data.export!.mimeType)}
              className="bg-green-600 hover:bg-green-700"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Download {data.export.fileName}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
