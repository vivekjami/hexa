import { ResearchSession } from '@/components/research/research-session'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            HEXA Research Platform
          </h1>
          <p className="text-xl text-gray-600">
            AI-powered research assistant for comprehensive topic exploration
          </p>
        </div>
        
        <ResearchSession />
      </div>
    </main>
  )
}