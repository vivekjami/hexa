'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Copy, 
  Download, 
  Filter,
  ExternalLink,
  Calendar,
  User,
  Search,
  SortAsc,
  SortDesc
} from 'lucide-react';

// Day 4: Citation Manager Component

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

interface CitationManagerProps {
  data: CitationDatabase;
}

export default function CitationManager({ 
  data
}: CitationManagerProps) {
  const [selectedFormat, setSelectedFormat] = useState<'apa' | 'mla' | 'chicago' | 'harvard'>('apa');
  const [sortBy, setSortBy] = useState<'title' | 'author' | 'date' | 'credibility'>('credibility');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<'all' | 'academic' | 'news' | 'government' | 'high_credibility'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCitation, setCopiedCitation] = useState<string | null>(null);

  const getSourceTypeColor = (type: string) => {
    const colorMap: { [key: string]: string } = {
      'academic': 'bg-green-100 text-green-800',
      'news': 'bg-blue-100 text-blue-800',
      'government': 'bg-yellow-100 text-yellow-800',
      'commercial': 'bg-purple-100 text-purple-800',
      'blog': 'bg-pink-100 text-pink-800',
      'social': 'bg-orange-100 text-orange-800',
      'unknown': 'bg-gray-100 text-gray-800'
    };
    return colorMap[type] || colorMap.unknown;
  };

  const getCredibilityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const sortedAndFilteredCitations = data.citations
    .filter(citation => {
      // Apply type filter
      if (filterType === 'academic' && citation.sourceType !== 'academic') return false;
      if (filterType === 'news' && citation.sourceType !== 'news') return false;
      if (filterType === 'government' && citation.sourceType !== 'government') return false;
      if (filterType === 'high_credibility' && citation.credibilityScore < 0.7) return false;
      
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          citation.title.toLowerCase().includes(searchLower) ||
          citation.author?.toLowerCase().includes(searchLower) ||
          citation.format[selectedFormat].toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'author':
          comparison = (a.author || '').localeCompare(b.author || '');
          break;
        case 'date':
          comparison = new Date(a.publishedDate || 0).getTime() - new Date(b.publishedDate || 0).getTime();
          break;
        case 'credibility':
          comparison = a.credibilityScore - b.credibilityScore;
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  const copyCitation = async (citation: Citation) => {
    const citationText = citation.format[selectedFormat];
    try {
      await navigator.clipboard.writeText(citationText);
      setCopiedCitation(citation.id);
      setTimeout(() => setCopiedCitation(null), 2000);
    } catch (err) {
      console.error('Failed to copy citation:', err);
    }
  };

  const exportCitations = () => {
    const citationText = sortedAndFilteredCitations
      .map((citation, index) => `${index + 1}. ${citation.format[selectedFormat]}`)
      .join('\n\n');
    
    const blob = new Blob([citationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `citations-${selectedFormat}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportBibliography = () => {
    const bibliography = `Bibliography (${selectedFormat.toUpperCase()} Format)
Generated on ${new Date().toLocaleDateString()}
Total Sources: ${sortedAndFilteredCitations.length}

${sortedAndFilteredCitations
  .map((citation, index) => `${index + 1}. ${citation.format[selectedFormat]}`)
  .join('\n\n')}`;
    
    const blob = new Blob([bibliography], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bibliography-${selectedFormat}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header and Statistics */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Citation Database
          </h3>
          <div className="flex gap-2">
            <Button onClick={exportCitations} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Citations
            </Button>
            <Button onClick={exportBibliography} variant="default" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Bibliography
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{data.totalSources}</div>
            <div className="text-sm text-gray-600">Total Sources</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{data.highCredibilitySources}</div>
            <div className="text-sm text-gray-600">High Credibility</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{data.factsCited}</div>
            <div className="text-sm text-gray-600">Facts Cited</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{data.duplicatesRemoved}</div>
            <div className="text-sm text-gray-600">Duplicates Removed</div>
          </div>
        </div>
      </Card>

      {/* Controls */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Citation Format Selection */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Format:</span>
            {['apa', 'mla', 'chicago', 'harvard'].map(format => (
              <Button
                key={format}
                variant={selectedFormat === format ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFormat(format as any)}
                className="uppercase"
              >
                {format}
              </Button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search citations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Filter by source type"
            >
              <option value="all">All Sources</option>
              <option value="academic">Academic</option>
              <option value="news">News</option>
              <option value="government">Government</option>
              <option value="high_credibility">High Credibility</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Sort citations by"
            >
              <option value="credibility">Credibility</option>
              <option value="title">Title</option>
              <option value="author">Author</option>
              <option value="date">Date</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </Card>

      {/* Citations List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">
            Citations ({sortedAndFilteredCitations.length})
          </h4>
          <span className="text-sm text-gray-600">
            Format: {selectedFormat.toUpperCase()}
          </span>
        </div>

        {sortedAndFilteredCitations.map((citation) => (
          <Card key={citation.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="space-y-4">
              {/* Citation Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSourceTypeColor(citation.sourceType)}`}>
                      {citation.sourceType}
                    </span>
                    <span className={`font-semibold ${getCredibilityColor(citation.credibilityScore)}`}>
                      {Math.round(citation.credibilityScore * 100)}% credible
                    </span>
                    <span className="text-sm text-gray-600">
                      {citation.facts.length} facts cited
                    </span>
                  </div>
                  
                  <h5 className="font-medium text-gray-900 mb-1">{citation.title}</h5>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {citation.author && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {citation.author}
                      </div>
                    )}
                    {citation.publishedDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(citation.publishedDate).toLocaleDateString()}
                      </div>
                    )}
                    <a 
                      href={citation.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Source
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyCitation(citation)}
                    className={copiedCitation === citation.id ? "bg-green-50 text-green-700" : ""}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {copiedCitation === citation.id ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>

              {/* Formatted Citation */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="font-mono text-sm text-gray-800 leading-relaxed">
                  {citation.format[selectedFormat]}
                </div>
              </div>

              {/* Cited Facts */}
              {citation.facts.length > 0 && (
                <div className="border-t pt-4">
                  <h6 className="font-medium text-gray-900 mb-2">Cited Facts:</h6>
                  <div className="space-y-2">
                    {citation.facts.slice(0, 3).map((fact, factIdx) => (
                      <div key={factIdx} className="text-sm text-gray-700 bg-blue-50 p-3 rounded">
                        <div className="font-medium">{fact.claim}</div>
                        {fact.quote && (
                          <div className="italic text-gray-600 mt-1">
                            "{fact.quote}"
                          </div>
                        )}
                      </div>
                    ))}
                    {citation.facts.length > 3 && (
                      <div className="text-sm text-gray-600">
                        ... and {citation.facts.length - 3} more facts
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {sortedAndFilteredCitations.length === 0 && (
        <Card className="p-8 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Citations Found</h4>
          <p className="text-gray-600">
            No citations match your current search and filter criteria.
          </p>
        </Card>
      )}

      {/* Format Examples */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h4 className="font-medium text-blue-900 mb-3">Citation Format Examples</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium text-blue-800">APA Format:</div>
            <div className="text-blue-700 font-mono">
              Author, A. A. (Year). Title of work. Publisher. URL
            </div>
          </div>
          <div>
            <div className="font-medium text-blue-800">MLA Format:</div>
            <div className="text-blue-700 font-mono">
              Author. "Title." Website, Date, URL.
            </div>
          </div>
          <div>
            <div className="font-medium text-blue-800">Chicago Format:</div>
            <div className="text-blue-700 font-mono">
              Author. "Title." Website. Date. URL.
            </div>
          </div>
          <div>
            <div className="font-medium text-blue-800">Harvard Format:</div>
            <div className="text-blue-700 font-mono">
              Author Year, Title, Website, viewed Date, &lt;URL&gt;
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
