'use client';

import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface SearchInputProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export default function SearchInput({ 
  onSearch, 
  isLoading = false, 
  placeholder = "Ask any research question..." 
}: SearchInputProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-gray-400" />
          )}
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          className="
            block w-full pl-10 pr-3 py-4 
            border border-gray-300 rounded-lg 
            placeholder-gray-500 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-50 disabled:cursor-not-allowed
            text-lg
          "
        />
        
        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="
            absolute inset-y-0 right-0 px-4 
            bg-blue-600 text-white rounded-r-lg
            hover:bg-blue-700 
            disabled:bg-gray-400 disabled:cursor-not-allowed
            transition-colors duration-200
          "
        >
          {isLoading ? 'Searching...' : 'Research'}
        </button>
      </div>
      
      {/* Quick example queries */}
      <div className="mt-3 flex flex-wrap gap-2">
        {[
          "Impact of AI on healthcare 2024",
          "Sustainable energy investment trends",
          "Remote work urban planning effects"
        ].map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setQuery(example)}
            disabled={isLoading}
            className="
              px-3 py-1 text-sm 
              bg-gray-100 hover:bg-gray-200 
              text-gray-700 rounded-full
              transition-colors duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {example}
          </button>
        ))}
      </div>
    </form>
  );
}