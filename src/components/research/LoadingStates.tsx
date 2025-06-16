'use client';

import React from 'react';
import { Loader2, Search, Brain, FileText } from 'lucide-react';

interface LoadingStatesProps {
  stage: 'analyzing' | 'searching' | 'processing' | 'synthesizing';
  message?: string;
}

export default function LoadingStates({ stage, message }: LoadingStatesProps) {
  const stages = {
    analyzing: {
      icon: Brain,
      title: 'Analyzing Query',
      description: 'Breaking down your research question into targeted searches...',
      color: 'text-purple-600'
    },
    searching: {
      icon: Search,
      title: 'Searching Sources',
      description: 'Discovering high-quality sources across the web...',
      color: 'text-blue-600'
    },
    processing: {
      icon: Loader2,
      title: 'Processing Results',
      description: 'Extracting and analyzing key information...',
      color: 'text-green-600'
    },
    synthesizing: {
      icon: FileText,
      title: 'Synthesizing Report',
      description: 'Combining findings into comprehensive insights...',
      color: 'text-orange-600'
    }
  };

  const currentStage = stages[stage];
  const Icon = currentStage.icon;

  return (
    <div className="w-full max-w-2xl mx-auto text-center py-12">
      <div className="space-y-4">
        <div className={`${currentStage.color} mx-auto`}>
          <Icon className="h-12 w-12 mx-auto animate-spin" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {currentStage.title}
          </h3>
          <p className="text-gray-600">
            {message || currentStage.description}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center space-x-2 mt-6">
          {Object.keys(stages).map((stageKey) => (
            <div
              key={stageKey}
              className={`h-2 w-8 rounded-full transition-all duration-300 ${
                stageKey === stage
                  ? 'bg-blue-600'
                  : Object.keys(stages).indexOf(stageKey) < Object.keys(stages).indexOf(stage)
                  ? 'bg-green-400'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}