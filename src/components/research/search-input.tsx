'use client'

import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

interface SearchInputProps {
  onSearch: (query: string) => void
  loading?: boolean
  placeholder?: string
}

export function SearchInput({ onSearch, loading = false, placeholder = "Enter your research question..." }: SearchInputProps) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim() && !loading) {
      onSearch(query.trim())
    }
  }

  const suggestionQueries = [
    "Impact of AI on healthcare 2024",
    "Sustainable energy investment opportunities", 
    "Remote work effect on urban planning",
    "Latest quantum computing breakthroughs"
  ]

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="pr-12 text-lg h-12"
                disabled={loading}
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <Button 
              type="submit" 
              disabled={!query.trim() || loading}
              size="lg"
              className="h-12 px-6"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Researching...
                </>
              ) : (
                'Research'
              )}
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-500 mr-2">Try:</span>
            {suggestionQueries.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setQuery(suggestion)}
                className="text-sm bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                disabled={loading}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}