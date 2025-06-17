// ESLint configuration override for D3 and visualization components
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';

// Day 4: Interactive Knowledge Graph Visualization Component

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
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface KnowledgeEdge {
  id: string;
  source: string | KnowledgeNode;
  target: string | KnowledgeNode;
  type: 'cites' | 'relates_to' | 'contradicts' | 'supports' | 'contains';
  weight: number;
  label?: string;
}

export interface KnowledgeGraphData {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  metadata: {
    totalNodes: number;
    totalEdges: number;
    sourceNodes: number;
    conceptNodes: number;
    entityNodes: number;
    factNodes: number;
    totalRelationships: number;
    averageConnectivity: number;
    clusters: Array<{
      id: string;
      label: string;
      nodes: string[];
      centroid: { x: number; y: number };
    }>;
  };
}

interface KnowledgeVisualizationProps {
  data: KnowledgeGraphData;
  width?: number;
  height?: number;
  onNodeClick?: (node: KnowledgeNode) => void;
  onEdgeClick?: (edge: KnowledgeEdge) => void;
}

export default function KnowledgeVisualization({ 
  data, 
  width = 1000, 
  height = 600,
  onNodeClick,
  onEdgeClick
}: KnowledgeVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set(['source', 'concept', 'entity', 'fact']));
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);

  // Helper functions
  const getEdgeColor = useCallback((type: string): string => {
    const colorMap: { [key: string]: string } = {
      'cites': '#3B82F6',
      'relates_to': '#10B981',
      'contradicts': '#EF4444',
      'supports': '#22C55E',
      'contains': '#8B5CF6'
    };
    return colorMap[type] || '#6B7280';
  }, []);

  const showTooltip = useCallback((event: any, text: string) => {
    d3.select('body')
      .append('div')
      .attr('class', 'knowledge-tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px 12px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '1000')
      .style('white-space', 'pre-line')
      .text(text)
      .style('left', (event.pageX + 10) + 'px')
      .style('top', (event.pageY - 10) + 'px');
  }, []);

  const hideTooltip = useCallback(() => {
    d3.selectAll('.knowledge-tooltip').remove();
  }, []);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Set up dimensions and margins
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create main container
    const container = svg
      .attr('width', width)
      .attr('height', height);

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    container.call(zoom);

    const g = container
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Filter data based on selected filters
    const filteredNodes = data.nodes.filter(node => selectedFilters.has(node.type));
    const filteredEdges = data.edges.filter(edge => {
      const sourceNode = data.nodes.find(n => n.id === (typeof edge.source === 'string' ? edge.source : edge.source.id));
      const targetNode = data.nodes.find(n => n.id === (typeof edge.target === 'string' ? edge.target : edge.target.id));
      return sourceNode && targetNode && selectedFilters.has(sourceNode.type) && selectedFilters.has(targetNode.type);
    });

    // Create force simulation
    const simulation = d3.forceSimulation(filteredNodes as any)
      .force('link', d3.forceLink(filteredEdges)
        .id((d: any) => d.id)
        .distance((d: any) => 100 - d.weight * 50)
        .strength(0.3)
      )
      .force('charge', d3.forceManyBody()
        .strength((d: any) => -300 - d.size * 10)
      )
      .force('center', d3.forceCenter(innerWidth / 2, innerHeight / 2))
      .force('collision', d3.forceCollide()
        .radius((d: any) => d.size + 5)
      );

    // Create arrow markers for directed edges
    const defs = g.append('defs');
    
    const arrowMarker = defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 13)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('xoverflow', 'visible');

    arrowMarker.append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#999')
      .style('stroke', 'none');

    // Create edges
    const links = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(filteredEdges)
      .enter()
      .append('line')
      .attr('stroke', (d: any) => getEdgeColor(d.type))
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d: any) => Math.max(1, d.weight * 3))
      .attr('marker-end', 'url(#arrowhead)')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        if (onEdgeClick) onEdgeClick(d);
      })
      .on('mouseover', function(event, d) {
        d3.select(this).attr('stroke-opacity', 1);
        showTooltip(event, `${d.type}: ${d.label || ''}`);
      })
      .on('mouseout', function() {
        d3.select(this).attr('stroke-opacity', 0.6);
        hideTooltip();
      });

    // Create nodes
    const nodes = g.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(filteredNodes)
      .enter()
      .append('circle')
      .attr('r', (d: any) => d.size)
      .attr('fill', (d: any) => d.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .call(d3.drag<SVGCircleElement, any>()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded)
      )
      .on('click', (event, d) => {
        setSelectedNode(d);
        if (onNodeClick) onNodeClick(d);
      })
      .on('mouseover', function(event, d) {
        d3.select(this).attr('stroke-width', 4);
        showTooltip(event, `${d.label}\n${d.type}: ${d.data.description || ''}`);
      })
      .on('mouseout', function() {
        d3.select(this).attr('stroke-width', 2);
        hideTooltip();
      });

    // Add labels
    const labels = g.append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(filteredNodes)
      .enter()
      .append('text')
      .text((d: any) => d.label.length > 20 ? d.label.substring(0, 20) + '...' : d.label)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', (d: any) => Math.max(8, d.size / 3))
      .attr('font-family', 'Arial, sans-serif')
      .attr('font-weight', (d: any) => d.type === 'source' ? 'bold' : 'normal')
      .attr('fill', '#333')
      .attr('pointer-events', 'none');

    // Simulation tick function
    function ticked() {
      links
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      nodes
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);

      labels
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y + d.size + 15);
    }

    simulation.on('tick', ticked);

    // Drag functions
    function dragStarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragEnded(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Control simulation
    if (!isPlaying) {
      simulation.stop();
    }

    // Cleanup
    return () => {
      simulation.stop();
    };

  }, [data, selectedFilters, isPlaying, width, height, onNodeClick, onEdgeClick, getEdgeColor, showTooltip, hideTooltip]);

  // Control functions
  const handleZoomIn = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().call(
      (svg.node() as any).__zoom.scaleBy,
      1.5
    );
  };

  const handleZoomOut = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().call(
      (svg.node() as any).__zoom.scaleBy,
      1 / 1.5
    );
  };

  const handleReset = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().call(
      (svg.node() as any).__zoom.transform,
      d3.zoomIdentity
    );
    setZoomLevel(1);
  };

  const toggleFilter = (filterType: string) => {
    const newFilters = new Set(selectedFilters);
    if (newFilters.has(filterType)) {
      newFilters.delete(filterType);
    } else {
      newFilters.add(filterType);
    }
    setSelectedFilters(newFilters);
  };

  const exportGraph = () => {
    if (!svgRef.current) return;
    
    const svgElement = svgRef.current;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `knowledge-graph-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getNodeCount = (type: string): number => {
    switch (type) {
      case 'source': return data.metadata.sourceNodes;
      case 'concept': return data.metadata.conceptNodes;
      case 'entity': return data.metadata.entityNodes;
      case 'fact': return data.metadata.factNodes;
      default: return 0;
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Controls */}
      <div className="p-4 border border-gray-200 rounded-lg bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <button 
              className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors" 
              onClick={handleZoomIn}
              title="Zoom In"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            <button 
              className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors" 
              onClick={handleZoomOut}
              title="Zoom Out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <button 
              className="p-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors" 
              onClick={handleReset}
              title="Reset View"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <span className="text-sm text-gray-600 ml-2">
              Zoom: {Math.round(zoomLevel * 100)}%
            </span>
          </div>

          {/* Filter Controls */}
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {['source', 'concept', 'entity', 'fact'].map(type => (
              <button
                key={type}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors capitalize ${
                  selectedFilters.has(type) 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => toggleFilter(type)}
              >
                {type}s ({getNodeCount(type)})
              </button>
            ))}
          </div>

          {/* Animation Controls */}
          <div className="flex items-center gap-2">
            <button
              className={`p-2 rounded text-white transition-colors ${
                isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              }`}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1" />
                </svg>
              )}
            </button>
            <button 
              className="p-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors" 
              onClick={exportGraph}
              title="Export SVG"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Visualization */}
      <div className="p-4 border border-gray-200 rounded-lg bg-white">
        <div className="relative">
          <svg
            ref={svgRef}
            className="border border-gray-200 rounded-lg bg-gray-50"
          />
          
          {/* Legend */}
          <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg border text-sm">
            <h4 className="font-semibold mb-2">Legend</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Academic Sources</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>News Sources</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span>Concepts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span>Entities</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-0.5 bg-red-500"></div>
                <span>Contradictions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-0.5 bg-green-500"></div>
                <span>Supports</span>
              </div>
            </div>
          </div>
        </div>

        {/* Graph Statistics */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <div className="font-semibold text-lg">{data.metadata.totalNodes}</div>
            <div className="text-gray-600">Total Nodes</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <div className="font-semibold text-lg">{data.metadata.totalEdges}</div>
            <div className="text-gray-600">Connections</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <div className="font-semibold text-lg">{data.metadata.clusters.length}</div>
            <div className="text-gray-600">Clusters</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <div className="font-semibold text-lg">{Math.round(data.metadata.averageConnectivity * 100) / 100}</div>
            <div className="text-gray-600">Avg Connectivity</div>
          </div>
        </div>
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
          <h4 className="font-semibold mb-2">Selected: {selectedNode.label}</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Type:</span> {selectedNode.type}
            </div>
            <div>
              <span className="font-medium">Size:</span> {selectedNode.size}
            </div>
            {selectedNode.data.confidence && (
              <div>
                <span className="font-medium">Confidence:</span> {Math.round(selectedNode.data.confidence * 100)}%
              </div>
            )}
            {selectedNode.data.credibilityScore && (
              <div>
                <span className="font-medium">Credibility:</span> {Math.round(selectedNode.data.credibilityScore * 100)}%
              </div>
            )}
          </div>
          {selectedNode.data.description && (
            <div className="mt-2">
              <span className="font-medium">Description:</span>
              <p className="text-gray-700">{selectedNode.data.description}</p>
            </div>
          )}
          {selectedNode.data.url && (
            <div className="mt-2">
              <a 
                href={selectedNode.data.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                View Source
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
