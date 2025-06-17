import { NextRequest, NextResponse } from 'next/server';
import { generateResearchReport, generateFollowUpQuestions } from '@/lib/gemini/client';

// In-memory storage for development (replace with database in production)
const researchSessions = new Map();

export async function POST(request: NextRequest) {
  try {
    const { action, sessionId, data, query, results } = await request.json();

    switch (action) {
      case 'generate':
        if (!query || !results || !Array.isArray(results)) {
          return NextResponse.json(
            { error: 'Query and results are required for research generation' },
            { status: 400 }
          );
        }

        // Generate research report
        const reportResponse = await generateResearchReport(query, results);
        
        if (!reportResponse.success) {
          return NextResponse.json(
            { 
              success: false, 
              error: reportResponse.error || 'Failed to generate research report' 
            },
            { status: 500 }
          );
        }

        // Generate follow-up questions
        let followUpQuestions: string[] = [];
        if (reportResponse.report) {
          const questionsResponse = await generateFollowUpQuestions(query, reportResponse.report);
          if (questionsResponse.success && questionsResponse.questions) {
            followUpQuestions = questionsResponse.questions;
          }
        }

        return NextResponse.json({
          success: true,
          report: reportResponse.report,
          followUpQuestions
        });

      case 'create':
        const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newSession = {
          id: newSessionId,
          query: data.query,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'active',
          results: [],
          metadata: data.metadata || {}
        };
        
        researchSessions.set(newSessionId, newSession);
        
        return NextResponse.json({
          success: true,
          session: newSession
        });

      case 'update':
        if (!sessionId || !researchSessions.has(sessionId)) {
          return NextResponse.json(
            { error: 'Session not found' },
            { status: 404 }
          );
        }

        const existingSession = researchSessions.get(sessionId);
        const updatedSession = {
          ...existingSession,
          ...data,
          updatedAt: new Date().toISOString()
        };
        
        researchSessions.set(sessionId, updatedSession);
        
        return NextResponse.json({
          success: true,
          session: updatedSession
        });

      case 'get':
        if (!sessionId || !researchSessions.has(sessionId)) {
          return NextResponse.json(
            { error: 'Session not found' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          session: researchSessions.get(sessionId)
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Research API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}


export async function GET() {
  // Return all active sessions (for development)
  const sessions = Array.from(researchSessions.values());
  return NextResponse.json({
    success: true,
    sessions: sessions.slice(-10) // Return last 10 sessions
  });
}