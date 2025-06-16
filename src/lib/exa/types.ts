export interface ExaSearchOptions {
  query: string
  numResults?: number
  includeDomains?: string[]
  excludeDomains?: string[]
  startCrawlDate?: string
  endCrawlDate?: string
  useAutoprompt?: boolean
  type?: 'neural' | 'keyword'
}

export interface ExaSearchResult {
  id: string
  title: string
  url: string
  publishedDate?: string
  author?: string
  score?: number
  text?: string
  highlights?: string[]
  summary?: string
}

export interface ExaResponse {
  results: ExaSearchResult[]
  autopromptString?: string
  requestId?: string
}

export interface ExaError {
  message: string
  status?: number
  code?: string
}