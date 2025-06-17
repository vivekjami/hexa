import { NextRequest, NextResponse } from 'next/server';
import { analyzeContentForFacts } from '@/lib/gemini/client';

// Day 4: Fact Cross-Verification API
// Compare claims across multiple sources and identify contradictions

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

interface VerificationResult {
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

export async function POST(request: NextRequest) {
  try {
    const { sources } = await request.json();

    if (!sources || !Array.isArray(sources) || sources.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 sources required for cross-verification' },
        { status: 400 }
      );
    }

    console.log(`🔍 Starting fact cross-verification across ${sources.length} sources`);

    // Extract facts from all sources
    const sourceFacts = await Promise.all(
      sources.map(async (source: any) => {
        const analysis = await analyzeContentForFacts(source.text, source.url);
        return {
          url: source.url,
          title: source.title,
          facts: analysis.success ? analysis.data?.keyFacts || [] : [],
          credibility: analysis.data?.credibilityAssessment || 'Unknown'
        };
      })
    );

    // Cross-verify claims
    const verifiedClaims: ClaimComparison[] = [];
    const contradictions: VerificationResult['contradictions'] = [];

    // Group similar claims for comparison
    const claimGroups = groupSimilarClaims(sourceFacts);

    for (const group of claimGroups) {
      if (group.claims.length < 2) continue; // Need at least 2 sources for verification

      const comparison = await compareClaimsAcrossSources(group);
      verifiedClaims.push(comparison);

      // Identify contradictions
      const conflictingSources = comparison.sources.filter(s => s.agreement === 'disagree');
      if (conflictingSources.length > 0) {
        contradictions.push({
          claim: comparison.claim,
          sources: conflictingSources.map(s => ({
            url: s.url,
            position: s.evidence,
            confidence: s.confidence
          }))
        });
      }
    }

    // Calculate overall reliability
    const reliabilityScores = verifiedClaims.map(c => c.reliabilityScore);
    const overallReliability = reliabilityScores.length > 0 
      ? reliabilityScores.reduce((sum, score) => sum + score, 0) / reliabilityScores.length 
      : 0;

    // Identify claims that need verification
    const needsVerification = verifiedClaims
      .filter(c => c.consensus === 'conflicted' || c.reliabilityScore < 0.6)
      .map(c => c.claim);

    const result: VerificationResult = {
      totalClaims: verifiedClaims.length,
      verifiedClaims,
      contradictions,
      overallReliability,
      needsVerification
    };

    console.log(`✅ Cross-verification completed: ${verifiedClaims.length} claims analyzed`);

    return NextResponse.json({ success: true, data: result });

  } catch (error) {
    console.error('Fact verification error:', error);
    return NextResponse.json(
      { error: 'Fact verification failed' },
      { status: 500 }
    );
  }
}

// Helper function to group similar claims
function groupSimilarClaims(sourceFacts: Array<{
  url: string;
  title: string;
  facts: Array<{ claim: string; confidence: number }>;
  credibility: string;
}>): Array<{
  topic: string;
  claims: Array<{
    claim: string;
    source: string;
    title: string;
    confidence: number;
  }>;
}> {
  const groups: { [key: string]: {
    topic: string;
    claims: Array<{
      claim: string;
      source: string;
      title: string;
      confidence: number;
    }>;
  } } = {};

  sourceFacts.forEach(source => {
    source.facts.forEach((fact: { claim: string; confidence: number }) => {
      // Simple keyword-based grouping (could be enhanced with NLP)
      const keywords = extractKeywords(fact.claim);
      const key = keywords.slice(0, 3).join('_');

      if (!groups[key]) {
        groups[key] = {
          topic: key,
          claims: []
        };
      }

      groups[key].claims.push({
        claim: fact.claim,
        source: source.url,
        title: source.title,
        confidence: fact.confidence
      });
    });
  });

  return Object.values(groups).filter(group => group.claims.length >= 2);
}

// Helper function to extract keywords from a claim
function extractKeywords(claim: string): string[] {
  const stopWords = ['the', 'is', 'at', 'which', 'on', 'and', 'a', 'to', 'are', 'was', 'will', 'be'];
  return claim
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.includes(word))
    .slice(0, 5);
}

// Helper function to compare claims across sources
async function compareClaimsAcrossSources(group: any): Promise<ClaimComparison> {
  const claims = group.claims;
  const primaryClaim = claims[0].claim;

  // Analyze agreement between sources
  const sources: Array<{
    url: string;
    title: string;
    agreement: 'agree' | 'disagree' | 'partial' | 'neutral';
    confidence: number;
    evidence: string;
  }> = claims.map((claim: any) => {
    // Simple agreement detection (could be enhanced with AI)
    const agreement = detectAgreement(primaryClaim, claim.claim);
    
    return {
      url: claim.source,
      title: claim.title,
      agreement,
      confidence: claim.confidence,
      evidence: claim.claim
    };
  });

  // Calculate reliability score
  const agreementCount = sources.filter((s: { agreement: string }) => s.agreement === 'agree').length;
  const disagreementCount = sources.filter((s: { agreement: string }) => s.agreement === 'disagree').length;
  const reliabilityScore = agreementCount / (agreementCount + disagreementCount + 1);

  // Determine consensus
  let consensus: ClaimComparison['consensus'];
  if (agreementCount >= sources.length * 0.8) {
    consensus = 'strong_agreement';
  } else if (agreementCount >= sources.length * 0.6) {
    consensus = 'weak_agreement';
  } else if (disagreementCount > 0) {
    consensus = 'conflicted';
  } else {
    consensus = 'insufficient_data';
  }

  // Identify contradictions
  const contradictions = sources
    .filter((s: { agreement: string }) => s.agreement === 'disagree')
    .map((s: { title: string; evidence: string }) => `${s.title}: ${s.evidence}`);

  return {
    claim: primaryClaim,
    sources,
    reliabilityScore,
    consensus,
    contradictions
  };
}

// Simple agreement detection (could be enhanced with NLP/AI)
function detectAgreement(claim1: string, claim2: string): 'agree' | 'disagree' | 'partial' | 'neutral' {
  const words1 = new Set(claim1.toLowerCase().split(/\s+/));
  const words2 = new Set(claim2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter((x: string) => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  const similarity = intersection.size / union.size;

  if (similarity > 0.7) return 'agree';
  if (similarity > 0.4) return 'partial';
  if (similarity > 0.2) return 'neutral';
  return 'disagree';
}
