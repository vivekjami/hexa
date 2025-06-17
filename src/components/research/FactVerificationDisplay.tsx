'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  EyeOff,
  ExternalLink,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

// Day 4: Fact Cross-Verification Display Component

interface ClaimComparison {
  claim: string;
  sources: Array<{
    url: string;
    title: string;
    agreement: 'agree' | 'disagree' | 'partial' | 'neutral';
    confidence: number;
    evidence: string;
  }>;
  reliabilityScore: number;
  consensus: 'strong_agreement' | 'weak_agreement' | 'conflicted' | 'insufficient_data';
  contradictions: string[];
}

interface VerificationData {
  totalClaims: number;
  verifiedClaims: ClaimComparison[];
  contradictions: Array<{
    claim: string;
    sources: Array<{
      url: string;
      position: string;
      confidence: number;
    }>;
  }>;
  overallReliability: number;
  needsVerification: string[];
}

interface FactVerificationDisplayProps {
  data: VerificationData;
  onClaimClick?: (claim: ClaimComparison) => void;
}

export default function FactVerificationDisplay({ 
  data, 
  onClaimClick 
}: FactVerificationDisplayProps) {
  const [expandedClaims, setExpandedClaims] = useState<Set<string>>(new Set());
  const [filterLevel, setFilterLevel] = useState<'all' | 'reliable' | 'conflicted' | 'needs_verification'>('all');

  const toggleClaim = (claim: string) => {
    const newExpanded = new Set(expandedClaims);
    if (newExpanded.has(claim)) {
      newExpanded.delete(claim);
    } else {
      newExpanded.add(claim);
    }
    setExpandedClaims(newExpanded);
  };

  const getConsensusIcon = (consensus: ClaimComparison['consensus']) => {
    switch (consensus) {
      case 'strong_agreement':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'weak_agreement':
        return <CheckCircle className="h-5 w-5 text-yellow-600" />;
      case 'conflicted':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'insufficient_data':
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getConsensusColor = (consensus: ClaimComparison['consensus']) => {
    switch (consensus) {
      case 'strong_agreement':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'weak_agreement':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'conflicted':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'insufficient_data':
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAgreementIcon = (agreement: string) => {
    switch (agreement) {
      case 'agree':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'disagree':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'partial':
        return <Minus className="h-4 w-4 text-yellow-600" />;
      case 'neutral':
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getReliabilityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredClaims = data.verifiedClaims.filter(claim => {
    switch (filterLevel) {
      case 'reliable':
        return claim.reliabilityScore >= 0.7;
      case 'conflicted':
        return claim.consensus === 'conflicted';
      case 'needs_verification':
        return data.needsVerification.includes(claim.claim);
      default:
        return true;
    }
  });

  return (
    <div className="space-y-6">
      {/* Overview Statistics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Fact Verification Overview
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{data.totalClaims}</div>
            <div className="text-sm text-gray-600">Total Claims</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getReliabilityColor(data.overallReliability)}`}>
              {Math.round(data.overallReliability * 100)}%
            </div>
            <div className="text-sm text-gray-600">Overall Reliability</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{data.contradictions.length}</div>
            <div className="text-sm text-gray-600">Contradictions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{data.needsVerification.length}</div>
            <div className="text-sm text-gray-600">Need Verification</div>
          </div>
        </div>
      </Card>

      {/* Filter Controls */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">Filter by:</span>
          {[
            { key: 'all', label: 'All Claims', count: data.verifiedClaims.length },
            { key: 'reliable', label: 'Reliable', count: data.verifiedClaims.filter(c => c.reliabilityScore >= 0.7).length },
            { key: 'conflicted', label: 'Conflicted', count: data.verifiedClaims.filter(c => c.consensus === 'conflicted').length },
            { key: 'needs_verification', label: 'Needs Verification', count: data.needsVerification.length }
          ].map(filter => (
            <Button
              key={filter.key}
              variant={filterLevel === filter.key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterLevel(filter.key as any)}
            >
              {filter.label} ({filter.count})
            </Button>
          ))}
        </div>
      </Card>

      {/* Major Contradictions */}
      {data.contradictions.length > 0 && (
        <Card className="p-6 border-red-200 bg-red-50">
          <h4 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            Major Contradictions Found
          </h4>
          <div className="space-y-4">
            {data.contradictions.map((contradiction, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg border border-red-200">
                <div className="font-medium text-red-900 mb-2">{contradiction.claim}</div>
                <div className="space-y-2">
                  {contradiction.sources.map((source, sourceIdx) => (
                    <div key={sourceIdx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          Source {sourceIdx + 1}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <div className="text-gray-600">
                        Confidence: {Math.round(source.confidence * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Verified Claims */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Verified Claims ({filteredClaims.length})
        </h3>
        
        {filteredClaims.map((claim, idx) => (
          <Card key={idx} className={`border-l-4 ${
            claim.consensus === 'strong_agreement' ? 'border-l-green-500' :
            claim.consensus === 'weak_agreement' ? 'border-l-yellow-500' :
            claim.consensus === 'conflicted' ? 'border-l-red-500' :
            'border-l-gray-500'
          }`}>
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getConsensusIcon(claim.consensus)}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getConsensusColor(claim.consensus)}`}>
                      {claim.consensus.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`font-semibold ${getReliabilityColor(claim.reliabilityScore)}`}>
                      {Math.round(claim.reliabilityScore * 100)}% Reliable
                    </span>
                  </div>
                  
                  <div className="text-gray-900 mb-3 leading-relaxed">
                    {claim.claim}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{claim.sources.length} sources</span>
                    <span>
                      {claim.sources.filter(s => s.agreement === 'agree').length} agree, 
                      {claim.sources.filter(s => s.agreement === 'disagree').length} disagree
                    </span>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleClaim(claim.claim)}
                >
                  {expandedClaims.has(claim.claim) ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {expandedClaims.has(claim.claim) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h5 className="font-medium mb-3">Source Analysis</h5>
                  <div className="space-y-3">
                    {claim.sources.map((source, sourceIdx) => (
                      <div key={sourceIdx} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getAgreementIcon(source.agreement)}
                            <a 
                              href={source.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                              {source.title}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                          <div className="text-sm text-gray-600">
                            {Math.round(source.confidence * 100)}% confident
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-700 italic">
                          "{source.evidence}"
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {claim.contradictions.length > 0 && (
                    <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                      <h6 className="font-medium text-red-900 mb-2">Contradictions:</h6>
                      <ul className="space-y-1">
                        {claim.contradictions.map((contradiction, contIdx) => (
                          <li key={contIdx} className="text-sm text-red-800">
                            • {contradiction}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onClaimClick?.(claim)}
                    >
                      Investigate Further
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
      
      {filteredClaims.length === 0 && (
        <Card className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Claims Found</h4>
          <p className="text-gray-600">
            No claims match the current filter criteria. Try adjusting your filters.
          </p>
        </Card>
      )}
    </div>
  );
}
