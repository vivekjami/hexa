import { NextRequest } from 'next/server';

// Store active WebSocket connections
const connections = new Set<WebSocket>();

interface RealTimeUpdate {
  type: 'progress' | 'status' | 'result' | 'error';
  stage: string;
  message: string;
  progress?: number;
  data?: any;
  timestamp: string;
}

// Helper function to broadcast updates to all connected clients
export function broadcastUpdate(update: RealTimeUpdate) {
  const message = JSON.stringify(update);
  connections.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(message);
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        connections.delete(ws);
      }
    } else {
      connections.delete(ws);
    }
  });
}

export async function GET(request: NextRequest) {
  // Check if this is a WebSocket upgrade request
  const upgrade = request.headers.get('upgrade');
  
  if (upgrade !== 'websocket') {
    return new Response('Expected WebSocket upgrade', { status: 426 });
  }

  try {
    // For development/demo purposes, we'll simulate WebSocket functionality
    // In production, you'd use a proper WebSocket server like Socket.IO
    
    const response = new Response(null, {
      status: 101,
      statusText: 'Switching Protocols',
      headers: {
        'Upgrade': 'websocket',
        'Connection': 'Upgrade',
        'Sec-WebSocket-Accept': 'demo-key',
      },
    });

    return response;
  } catch (error) {
    console.error('WebSocket upgrade error:', error);
    return new Response('WebSocket upgrade failed', { status: 500 });
  }
}

// Utility functions to send updates during research operations
export const ResearchProgress = {
  analyzing: (query: string, progress = 0) => {
    broadcastUpdate({
      type: 'progress',
      stage: 'analyzing',
      message: `Analyzing query: "${query}"`,
      progress,
      timestamp: new Date().toISOString()
    });
  },

  searching: (strategy: string, progress = 0) => {
    broadcastUpdate({
      type: 'progress',
      stage: 'searching',
      message: `Executing ${strategy} search strategy`,
      progress,
      timestamp: new Date().toISOString()
    });
  },

  processing: (sources: number, progress = 0) => {
    broadcastUpdate({
      type: 'progress',
      stage: 'processing',
      message: `Processing ${sources} sources for quality and relevance`,
      progress,
      timestamp: new Date().toISOString()
    });
  },

  synthesizing: (facts: number, progress = 0) => {
    broadcastUpdate({
      type: 'progress',
      stage: 'synthesizing',
      message: `Synthesizing ${facts} key facts into research report`,
      progress,
      timestamp: new Date().toISOString()
    });
  },

  result: (stage: string, message: string, data?: any) => {
    broadcastUpdate({
      type: 'result',
      stage,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  },

  error: (stage: string, error: string) => {
    broadcastUpdate({
      type: 'error',
      stage,
      message: `Error in ${stage}: ${error}`,
      timestamp: new Date().toISOString()
    });
  },

  status: (stage: string, message: string) => {
    broadcastUpdate({
      type: 'status',
      stage,
      message,
      timestamp: new Date().toISOString()
    });
  }
};

export default GET;
