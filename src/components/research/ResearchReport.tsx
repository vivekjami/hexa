'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink, 
  Download,
  Eye,
  EyeOff,
  Lightbulb,
  Target,
  Users,
  TrendingUp
} from 'lucide-react';

interface SearchResult {
  title: string;
  url: string;
  text?: string;
  publishedDate?: string;
  author?: string;
  score?: number;
}

interface ResearchReport {
  executive_summary: string;
  key_findings: string[];
  detailed_analysis: string;
  sources_analysis: string;
  recommendations: string[];
  credibility_assessment: {
    high_credibility: SearchResult[];
    medium_credibility: SearchResult[];
    needs_verification: SearchResult[];
  };
  gaps_and_limitations: string[];
}

interface ResearchReportProps {
  report: ResearchReport;
  originalQuery: string;
  followUpQuestions?: string[];
  onFollowUpQuestion?: (question: string) => void;
  isLoading?: boolean;
}

export default function ResearchReport({ 
  report, 
  originalQuery, 
  followUpQuestions = [],
  onFollowUpQuestion,
  isLoading = false 
}: ResearchReportProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['summary', 'findings'])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const exportReport = () => {
    const reportText = `
HEXA Research Report
===================

Query: ${originalQuery}
Generated: ${new Date().toLocaleString()}

EXECUTIVE SUMMARY
================
${report.executive_summary}

KEY FINDINGS
============
${report.key_findings.map((finding, idx) => `${idx + 1}. ${finding}`).join('\n')}

DETAILED ANALYSIS
================
${report.detailed_analysis}

SOURCES ANALYSIS
===============
${report.sources_analysis}

RECOMMENDATIONS
==============
${report.recommendations.map((rec, idx) => `${idx + 1}. ${rec}`).join('\n')}

GAPS AND LIMITATIONS
===================
${report.gaps_and_limitations.map((gap, idx) => `${idx + 1}. ${gap}`).join('\n')}

HIGH CREDIBILITY SOURCES
=======================
${report.credibility_assessment.high_credibility.map((source, idx) => 
  `${idx + 1}. ${source.title} - ${source.url}`
).join('\n')}
    `.trim();

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="bg-gray-200 rounded-lg p-8 space-y-4">
            <div className="h-6 bg-gray-300 rounded w-1/3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              <div className="h-4 bg-gray-300 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Research Report</h2>
          </div>
          <button
            onClick={exportReport}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
        <p className="text-gray-600">
          <strong>Research Query:</strong> {originalQuery}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Generated on {new Date().toLocaleString()}
        </p>
      </div>

      {/* Executive Summary */}
      <div className="bg-white rounded-lg border border-gray-200">
        <button
          onClick={() => toggleSection('summary')}
          className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Target className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Executive Summary</h3>
          </div>
          {expandedSections.has('summary') ? (
            <EyeOff className="h-5 w-5 text-gray-400" />
          ) : (
            <Eye className="h-5 w-5 text-gray-400" />
          )}
        </button>
        {expandedSections.has('summary') && (
          <div className="px-6 pb-6">
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {report.executive_summary}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Key Findings */}
      <div className="bg-white rounded-lg border border-gray-200">
        <button
          onClick={() => toggleSection('findings')}
          className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Key Findings</h3>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {report.key_findings.length}
            </span>
          </div>
          {expandedSections.has('findings') ? (
            <EyeOff className="h-5 w-5 text-gray-400" />
          ) : (
            <Eye className="h-5 w-5 text-gray-400" />
          )}
        </button>
        {expandedSections.has('findings') && (
          <div className="px-6 pb-6">
            <ul className="space-y-3">
              {report.key_findings.map((finding, idx) => (
                <li key={idx} className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center justify-center font-medium">
                    {idx + 1}
                  </span>
                  <span className="text-gray-700 leading-relaxed">{finding}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Detailed Analysis */}
      <div className="bg-white rounded-lg border border-gray-200">
        <button
          onClick={() => toggleSection('analysis')}
          className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Detailed Analysis</h3>
          </div>
          {expandedSections.has('analysis') ? (
            <EyeOff className="h-5 w-5 text-gray-400" />
          ) : (
            <Eye className="h-5 w-5 text-gray-400" />
          )}
        </button>
        {expandedSections.has('analysis') && (
          <div className="px-6 pb-6">
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {report.detailed_analysis}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sources Analysis */}
      <div className="bg-white rounded-lg border border-gray-200">
        <button
          onClick={() => toggleSection('sources')}
          className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Users className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Sources Analysis</h3>
          </div>
          {expandedSections.has('sources') ? (
            <EyeOff className="h-5 w-5 text-gray-400" />
          ) : (
            <Eye className="h-5 w-5 text-gray-400" />
          )}
        </button>
        {expandedSections.has('sources') && (
          <div className="px-6 pb-6 space-y-4">
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {report.sources_analysis}
              </p>
            </div>
            
            {/* Credibility Assessment */}
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="flex items-center space-x-2 font-medium text-green-900 mb-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>High Credibility ({report.credibility_assessment.high_credibility.length})</span>
                </h4>
                <ul className="space-y-2">
                  {report.credibility_assessment.high_credibility.slice(0, 3).map((source, idx) => (
                    <li key={idx} className="text-sm">
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-green-700 hover:text-green-900 flex items-center space-x-1"
                      >
                        <span className="truncate">{source.title}</span>
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="flex items-center space-x-2 font-medium text-yellow-900 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Medium Credibility ({report.credibility_assessment.medium_credibility.length})</span>
                </h4>
                <ul className="space-y-2">
                  {report.credibility_assessment.medium_credibility.slice(0, 3).map((source, idx) => (
                    <li key={idx} className="text-sm">
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-yellow-700 hover:text-yellow-900 flex items-center space-x-1"
                      >
                        <span className="truncate">{source.title}</span>
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="flex items-center space-x-2 font-medium text-red-900 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Needs Verification ({report.credibility_assessment.needs_verification.length})</span>
                </h4>
                <ul className="space-y-2">
                  {report.credibility_assessment.needs_verification.slice(0, 3).map((source, idx) => (
                    <li key={idx} className="text-sm">
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-red-700 hover:text-red-900 flex items-center space-x-1"
                      >
                        <span className="truncate">{source.title}</span>
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg border border-gray-200">
        <button
          onClick={() => toggleSection('recommendations')}
          className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900">Recommendations</h3>
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
              {report.recommendations.length}
            </span>
          </div>
          {expandedSections.has('recommendations') ? (
            <EyeOff className="h-5 w-5 text-gray-400" />
          ) : (
            <Eye className="h-5 w-5 text-gray-400" />
          )}
        </button>
        {expandedSections.has('recommendations') && (
          <div className="px-6 pb-6">
            <ul className="space-y-3">
              {report.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-yellow-100 text-yellow-800 text-sm rounded-full flex items-center justify-center font-medium">
                    {idx + 1}
                  </span>
                  <span className="text-gray-700 leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Gaps and Limitations */}
      <div className="bg-white rounded-lg border border-gray-200">
        <button
          onClick={() => toggleSection('gaps')}
          className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Gaps & Limitations</h3>
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
              {report.gaps_and_limitations.length}
            </span>
          </div>
          {expandedSections.has('gaps') ? (
            <EyeOff className="h-5 w-5 text-gray-400" />
          ) : (
            <Eye className="h-5 w-5 text-gray-400" />
          )}
        </button>
        {expandedSections.has('gaps') && (
          <div className="px-6 pb-6">
            <ul className="space-y-3">
              {report.gaps_and_limitations.map((gap, idx) => (
                <li key={idx} className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-800 text-sm rounded-full flex items-center justify-center font-medium">
                    {idx + 1}
                  </span>
                  <span className="text-gray-700 leading-relaxed">{gap}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Follow-up Questions */}
      {followUpQuestions.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            <span>Suggested Follow-up Questions</span>
          </h3>
          <div className="space-y-2">
            {followUpQuestions.map((question, idx) => (
              <button
                key={idx}
                onClick={() => onFollowUpQuestion?.(question)}
                className="w-full text-left p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
              >
                <span className="text-gray-700 group-hover:text-blue-900">
                  {question}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
