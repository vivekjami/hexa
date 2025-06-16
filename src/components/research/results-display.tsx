'use client'

import { ExternalLink, Calendar, User, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExaSearchResult } from '@/lib/exa/types'
import { truncateText, formatDate } from '@/lib/utils'

interface ResultsDisplayProps {
  results: ExaSearchResult[]
  query?: string
  loading?: boolean
}

export function ResultsDisplay({ results, query, loading }: ResultsDisplayProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!results.length) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <p className="text-gray-500">No results found. Try a different search query.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {query && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Research results for: <span className="text-blue-600">&quot;{query}&quot;</span>
          </h2>
          <p className="text-gray-600 mt-1">{results.length} sources found</p>
        </div>
      )}
      
      <div className="grid gap-4">
        {results.map((result, index) => (
          <Card key={result.id || index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {result.title}
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    {result.author && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{result.author}</span>
                      </div>
                    )}
                    {result.publishedDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(new Date(result.publishedDate))}</span>
                      </div>
                    )}
                    {result.score && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        <span>{(result.score * 100).toFixed(0)}% match</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  <a href={result.url} target="_blank" rel="noopener noreferrer" className="ml-1">
                    View
                  </a>
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {result.text && (
                <p className="text-gray-700 leading-relaxed">
                  {truncateText(result.text, 300)}
                </p>
              )}
              
              {result.highlights && result.highlights.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-600 mb-2">Key highlights:</p>
                  <div className="space-y-1">
                    {result.highlights.slice(0, 2).map((highlight, i) => (
                      <p key={i} className="text-sm bg-yellow-50 border-l-2 border-yellow-400 pl-3 py-1">
                        &quot;{highlight}&quot;
                      </p>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-3 pt-3 border-t border-gray-100">
                <a 
                  href={result.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 break-all"
                >
                  {result.url}
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}