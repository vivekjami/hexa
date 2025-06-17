import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Day 4: Knowledge Graph Creation API
// Build connections between sources and concepts

interface KnowledgeNode {
  id: string;
  type: 'source' | 'concept' | 'entity' | 'fact';
  label: string;
  data: {
    url?: string;
    confidence?: number;
    category?: string;
    description?: string;
    credibilityScore?: number;
  };
  size: number;
  color: string;
}

interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  type: 'cites' | 'relates_to' | 'contradicts' | 'supports' | 'contains';
  weight: number;
  label?: string;
}

interface KnowledgeGraph {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  metadata: {
    totalNodes: number;
    totalEdges: number;
    sourceNodes: number;
    conceptNodes: number;
    entityNodes: number;
    factNodes: number;
    averageConnectivity: number;
    clusters: Array<{
      id: string;
      label: string;
      nodes: string[];
      centroid: { x: number; y: number };
    }>;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { sources, verificationData } = await request.json();

    if (!sources || !Array.isArray(sources)) {
      return NextResponse.json(
        { error: 'Sources array is required' },
        { status: 400 }
      );
    }

    console.log(`🕸️ Building knowledge graph from ${sources.length} sources`);

    const nodes: KnowledgeNode[] = [];
    const edges: KnowledgeEdge[] = [];
    const nodeMap = new Map<string, string>(); // label -> id mapping

    // Step 1: Create source nodes
    for (const source of sources) {
      const sourceId = uuidv4();
      
      nodes.push({
        id: sourceId,
        type: 'source',
        label: source.title || extractDomainName(source.url),
        data: {
          url: source.url,
          credibilityScore: source.quality?.credibilityScore || 0.5,
          description: source.structuredData?.summary || ''
        },
        size: Math.max(10, (source.quality?.credibilityScore || 0.5) * 20),
        color: getSourceColor(source.quality?.sourceType || 'unknown')
      });

      nodeMap.set(source.url, sourceId);
    }

    // Step 2: Create concept and entity nodes
    const entityFrequency = new Map<string, number>();
    const conceptFrequency = new Map<string, number>();

    for (const source of sources) {
      // Extract entities
      if (source.structuredData?.namedEntities) {
        Object.entries(source.structuredData.namedEntities as Record<string, string[]>).forEach(([category, entities]: [string, string[]]) => {
          entities.forEach((entity: string) => {
            const key = `${category}:${entity}`;
            entityFrequency.set(key, (entityFrequency.get(key) || 0) + 1);
          });
        });
      }

      // Extract concepts from topics
      if (source.structuredData?.mainTopics) {
        source.structuredData.mainTopics.forEach((topic: string) => {
          conceptFrequency.set(topic, (conceptFrequency.get(topic) || 0) + 1);
        });
      }
    }

    // Create entity nodes (only for frequently mentioned entities)
    entityFrequency.forEach((frequency, entityKey) => {
      if (frequency >= 2) { // Only include entities mentioned in multiple sources
        const [category, entity] = entityKey.split(':');
        const entityId = uuidv4();
        
        nodes.push({
          id: entityId,
          type: 'entity',
          label: entity,
          data: {
            category,
            confidence: Math.min(frequency / sources.length, 1)
          },
          size: Math.max(8, frequency * 3),
          color: getEntityColor(category)
        });

        nodeMap.set(entityKey, entityId);
      }
    });

    // Create concept nodes
    conceptFrequency.forEach((frequency, concept) => {
      if (frequency >= 2) {
        const conceptId = uuidv4();
        
        nodes.push({
          id: conceptId,
          type: 'concept',
          label: concept,
          data: {
            confidence: Math.min(frequency / sources.length, 1)
          },
          size: Math.max(12, frequency * 4),
          color: '#8B5CF6' // Purple for concepts
        });

        nodeMap.set(`concept:${concept}`, conceptId);
      }
    });

    // Step 3: Create fact nodes and relationships
    for (const source of sources) {
      const sourceId = nodeMap.get(source.url);
      if (!sourceId) continue;

      // Create fact nodes
      if (source.structuredData?.keyFacts) {
        source.structuredData.keyFacts.forEach((fact: any) => {
          const factId = uuidv4();
          
          nodes.push({
            id: factId,
            type: 'fact',
            label: fact.claim.substring(0, 50) + '...',
            data: {
              description: fact.claim,
              confidence: fact.confidence,
              category: fact.category
            },
            size: Math.max(6, fact.confidence * 12),
            color: getFactColor(fact.category)
          });

          // Connect fact to source
          edges.push({
            id: uuidv4(),
            source: sourceId,
            target: factId,
            type: 'contains',
            weight: fact.confidence,
            label: 'contains'
          });

          // Connect fact to related entities
          if (fact.entities) {
            fact.entities.forEach((entity: string) => {
              // Find matching entity nodes
              const entityKeys = Array.from(entityFrequency.keys()).filter(key => 
                key.includes(entity.toLowerCase())
              );
              
              entityKeys.forEach(entityKey => {
                const entityId = nodeMap.get(entityKey);
                if (entityId) {
                  edges.push({
                    id: uuidv4(),
                    source: factId,
                    target: entityId,
                    type: 'relates_to',
                    weight: 0.7,
                    label: 'mentions'
                  });
                }
              });
            });
          }
        });
      }

      // Connect source to concepts
      if (source.structuredData?.mainTopics) {
        source.structuredData.mainTopics.forEach((topic: string) => {
          const conceptId = nodeMap.get(`concept:${topic}`);
          if (conceptId) {
            edges.push({
              id: uuidv4(),
              source: sourceId,
              target: conceptId,
              type: 'relates_to',
              weight: 0.8,
              label: 'discusses'
            });
          }
        });
      }
    }

    // Step 4: Add verification relationships if available
    if (verificationData?.contradictions) {
      for (const contradiction of verificationData.contradictions) {
        const sourceIds = contradiction.sources
          .map((s: any) => nodeMap.get(s.url))
          .filter(Boolean);

        // Create contradiction edges between sources
        for (let i = 0; i < sourceIds.length; i++) {
          for (let j = i + 1; j < sourceIds.length; j++) {
            edges.push({
              id: uuidv4(),
              source: sourceIds[i],
              target: sourceIds[j],
              type: 'contradicts',
              weight: 0.9,
              label: 'contradicts'
            });
          }
        }
      }
    }

    // Step 5: Detect clusters
    const clusters = detectClusters(nodes, edges);

    // Step 6: Calculate metadata
    const sourceNodes = nodes.filter(n => n.type === 'source').length;
    const conceptNodes = nodes.filter(n => n.type === 'concept').length;
    const entityNodes = nodes.filter(n => n.type === 'entity').length;
    const factNodes = nodes.filter(n => n.type === 'fact').length;
    const averageConnectivity = edges.length / Math.max(nodes.length, 1);

    const graph: KnowledgeGraph = {
      nodes,
      edges,
      metadata: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        sourceNodes,
        conceptNodes,
        entityNodes,
        factNodes,
        averageConnectivity,
        clusters
      }
    };

    console.log(`✅ Knowledge graph created: ${nodes.length} nodes, ${edges.length} edges`);

    return NextResponse.json({ success: true, data: graph });

  } catch (error) {
    console.error('Knowledge graph creation error:', error);
    return NextResponse.json(
      { error: 'Knowledge graph creation failed' },
      { status: 500 }
    );
  }
}

// Helper functions

function extractDomainName(url: string): string {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return domain.split('.')[0];
  } catch {
    return 'Unknown Source';
  }
}

function getSourceColor(sourceType: string): string {
  const colorMap: { [key: string]: string } = {
    'academic': '#10B981', // Green
    'news': '#3B82F6',     // Blue
    'government': '#F59E0B', // Yellow
    'commercial': '#EF4444', // Red
    'blog': '#8B5CF6',      // Purple
    'social': '#EC4899',    // Pink
    'unknown': '#6B7280'    // Gray
  };
  return colorMap[sourceType] || colorMap.unknown;
}

function getEntityColor(category: string): string {
  const colorMap: { [key: string]: string } = {
    'PERSON': '#F97316',    // Orange
    'ORGANIZATION': '#06B6D4', // Cyan
    'LOCATION': '#84CC16',   // Lime
    'DATE': '#A855F7',      // Violet
    'MONEY': '#22C55E',     // Green
    'default': '#64748B'    // Slate
  };
  return colorMap[category] || colorMap.default;
}

function getFactColor(category: string): string {
  const colorMap: { [key: string]: string } = {
    'statistic': '#3B82F6',   // Blue
    'claim': '#10B981',       // Emerald
    'quote': '#F59E0B',       // Amber
    'definition': '#8B5CF6',  // Purple
    'relationship': '#EF4444', // Red
    'default': '#6B7280'      // Gray
  };
  return colorMap[category] || colorMap.default;
}

function detectClusters(nodes: KnowledgeNode[], edges: KnowledgeEdge[]): Array<{
  id: string;
  label: string;
  nodes: string[];
  centroid: { x: number; y: number };
}> {
  // Simple clustering based on connectivity
  const clusters: Array<{
    id: string;
    label: string;
    nodes: string[];
    centroid: { x: number; y: number };
  }> = [];

  const visited = new Set<string>();
  const adjacencyList = new Map<string, string[]>();

  // Build adjacency list
  edges.forEach(edge => {
    if (!adjacencyList.has(edge.source)) {
      adjacencyList.set(edge.source, []);
    }
    if (!adjacencyList.has(edge.target)) {
      adjacencyList.set(edge.target, []);
    }
    adjacencyList.get(edge.source)!.push(edge.target);
    adjacencyList.get(edge.target)!.push(edge.source);
  });

  // DFS to find connected components
  function dfs(nodeId: string, cluster: string[]) {
    visited.add(nodeId);
    cluster.push(nodeId);
    
    const neighbors = adjacencyList.get(nodeId) || [];
    neighbors.forEach(neighbor => {
      if (!visited.has(neighbor)) {
        dfs(neighbor, cluster);
      }
    });
  }

  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      const cluster: string[] = [];
      dfs(node.id, cluster);
      
      if (cluster.length > 1) {
        // Find the most central concept or source as cluster label
        const clusterNodes = cluster.map(id => nodes.find(n => n.id === id)!);
        const conceptNodes = clusterNodes.filter(n => n.type === 'concept');
        const sourceNodes = clusterNodes.filter(n => n.type === 'source');
        
        let label = 'Cluster';
        if (conceptNodes.length > 0) {
          label = conceptNodes[0].label;
        } else if (sourceNodes.length > 0) {
          label = sourceNodes[0].label;
        }

        clusters.push({
          id: uuidv4(),
          label,
          nodes: cluster,
          centroid: { x: 0, y: 0 } // Will be calculated by visualization
        });
      }
    }
  });

  return clusters;
}
