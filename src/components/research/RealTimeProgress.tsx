'use client';

import React, { useEffect, useRef } from 'react';
import { X, Activity, CheckCircle, AlertCircle, Clock, Wifi, WifiOff } from 'lucide-react';
import styles from './RealTimeProgress.module.css';

interface RealTimeUpdate {
  type: 'progress' | 'status' | 'result' | 'error';
  stage: string;
  message: string;
  progress?: number;
  data?: any;
  timestamp: string;
}

interface Props {
  updates: RealTimeUpdate[];
  onClose: () => void;
  isConnected: boolean;
}

const RealTimeProgress: React.FC<Props> = ({ updates, onClose, isConnected }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [updates]);

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'progress':
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'result':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getUpdateColor = (type: string) => {
    switch (type) {
      case 'progress':
        return 'border-l-blue-500 bg-blue-50';
      case 'result':
        return 'border-l-green-500 bg-green-50';
      case 'error':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getStageProgress = () => {
    const stages = ['analyzing', 'searching', 'processing', 'synthesizing'];
    const currentStage = updates[updates.length - 1]?.stage;
    const currentIndex = stages.indexOf(currentStage);
    return ((currentIndex + 1) / stages.length) * 100;
  };



  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-lg">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Activity className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Live Research Updates</h3>
            <div className="ml-3 flex items-center">
              {isConnected ? (
                <div className="flex items-center text-green-600">
                  <Wifi className="h-4 w-4 mr-1" />
                  <span className="text-sm">Connected</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <WifiOff className="h-4 w-4 mr-1" />
                  <span className="text-sm">Disconnected</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close real-time progress panel"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Overall Progress</span>
            <span>{Math.round(getStageProgress())}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`bg-blue-600 h-2 rounded-full transition-all duration-300 ${styles.overallProgressBar}`}
              data-progress={getStageProgress()}
            ></div>
          </div>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="p-4 max-h-96 overflow-y-auto space-y-3"
      >
        {updates.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>Waiting for updates...</p>
          </div>
        ) : (
          updates.map((update, index) => (
            <div 
              key={index}
              className={`border-l-4 pl-4 py-2 rounded-r-md ${getUpdateColor(update.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2">
                  {getUpdateIcon(update.type)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {update.stage}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(update.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{update.message}</p>
                    
                    {/* Progress bar for individual updates */}
                    {update.progress !== undefined && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div 
                            className={`bg-blue-500 h-1 rounded-full transition-all duration-300 ${styles.progressBar}`}
                            data-progress={update.progress}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Additional data display */}
                    {update.data && (
                      <div className="mt-2 text-xs text-gray-600">
                        {typeof update.data === 'object' ? (
                          <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                            {JSON.stringify(update.data, null, 2)}
                          </pre>
                        ) : (
                          <span>{update.data}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Connection Status Footer */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
        {isConnected ? (
          <span className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Real-time updates enabled
          </span>
        ) : (
          <span className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            Connection lost - attempting to reconnect...
          </span>
        )}
      </div>
    </div>
  );
};

export default RealTimeProgress;
