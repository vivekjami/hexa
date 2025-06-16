'use client'

import { useState } from 'react'
import { SearchInput } from './search-input'
import { ResultsDisplay } from './results-display'
import { ExaSearchResult } from '@/lib/exa/types'

interface ResearchSession {
  id: string
  query: string
  results: ExaSearchResult[]
  timestamp: Date
}

export function ResearchSession() {
  const [currentSession, setCurrentSession] = useState<ResearchSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (query: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      })

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      const session: ResearchSession = {
        id: Date.now().toString(),
        query,
        results: data.results || [],
        timestamp: new Date()
      }
      
      setCurrentSession(session)
    } catch (err: any) {
      console.error('Search error:', err)
      setError(err.message || 'An error occurred while searching')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <SearchInput onSearch={handleSearch} loading={loading} />
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      )}
      
      {(currentSession || loading) && (
        <ResultsDisplay 
          results={currentSession?.results || []}
          query={currentSession?.query}
          loading={loading}
        />
      )}
    </div>
  )
}