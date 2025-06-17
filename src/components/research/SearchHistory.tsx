'use client';

import React, { useState } from 'react';
import { 
  Star, 
  Trash2, 
  Search, 
  Clock, 
  Download, 
  Eye,
  FileText,
  Calendar,
  Edit3,
  Save,
  X
} from 'lucide-react';

interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: string;
  mode: 'standard' | 'discovery';
  options?: any;
  resultCount?: number;
  starred?: boolean;
}

interface ResearchSession {
  id: string;
  name: string;
  createdAt: string;
  lastModified: string;
  query: string;
  notes?: string;
  tags?: string[];
  starred?: boolean;
}

interface Props {
  history: SearchHistoryItem[];
  sessions: ResearchSession[];
  onLoadFromHistory: (item: SearchHistoryItem) => void;
  onStarItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onLoadSession: (session: ResearchSession) => void;
  onSaveSession: (session: ResearchSession) => void;
}

const SearchHistory: React.FC<Props> = ({
  history,
  sessions,
  onLoadFromHistory,
  onStarItem,
  onDeleteItem,
  onLoadSession,
  onSaveSession
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'sessions'>('history');
  const [filterMode, setFilterMode] = useState<'all' | 'starred' | 'recent'>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedSession, setSelectedSession] = useState<ResearchSession | null>(null);
  const [isEditingSession, setIsEditingSession] = useState(false);

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.query.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesFilter = filterMode === 'all' || 
                         (filterMode === 'starred' && item.starred) ||
                         (filterMode === 'recent' && Date.now() - new Date(item.timestamp).getTime() < 24 * 60 * 60 * 1000);
    return matchesSearch && matchesFilter;
  });

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                         session.query.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesFilter = filterMode === 'all' || 
                         (filterMode === 'starred' && session.starred) ||
                         (filterMode === 'recent' && Date.now() - new Date(session.lastModified).getTime() < 24 * 60 * 60 * 1000);
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getModeColor = (mode: string) => {
    return mode === 'discovery' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700';
  };

  const exportHistory = () => {
    const dataStr = JSON.stringify({ history, sessions }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hexa-research-history-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleEditSession = (session: ResearchSession) => {
    setSelectedSession({ ...session });
    setIsEditingSession(true);
  };

  const handleSaveSessionEdit = () => {
    if (selectedSession) {
      onSaveSession({
        ...selectedSession,
        lastModified: new Date().toISOString()
      });
      setIsEditingSession(false);
      setSelectedSession(null);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Research History</h2>
          <button
            onClick={exportHistory}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-4">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Clock className="h-4 w-4 mr-2 inline" />
            Search History ({history.length})
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'sessions'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="h-4 w-4 mr-2 inline" />
            Research Sessions ({sessions.length})
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                filterMode === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterMode('starred')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                filterMode === 'starred'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Star className="h-4 w-4 mr-1 inline" />
              Starred
            </button>
            <button
              onClick={() => setFilterMode('recent')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                filterMode === 'recent'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Clock className="h-4 w-4 mr-1 inline" />
              Recent
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'history' ? (
          <div className="space-y-4">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No search history found</p>
                <p className="text-sm">Your searches will appear here</p>
              </div>
            ) : (
              filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getModeColor(item.mode)}`}>
                          {item.mode === 'discovery' ? 'Discovery' : 'Standard'}
                        </span>
                        <span className="text-xs text-gray-500">{formatDate(item.timestamp)}</span>
                        {item.resultCount && (
                          <span className="text-xs text-gray-500">
                            {item.resultCount} results
                          </span>
                        )}
                      </div>
                      <p className="text-gray-900 font-medium mb-1 truncate">{item.query}</p>
                      {item.options && Object.keys(item.options).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.options.sourceTypes?.map((type: string) => (
                            <span key={type} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              {type}
                            </span>
                          ))}
                          {item.options.dateRange && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              Date filtered
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => onStarItem(item.id)}
                        className={`p-2 rounded-md transition-colors ${
                          item.starred
                            ? 'text-yellow-500 hover:text-yellow-600'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                        aria-label={item.starred ? 'Remove from favorites' : 'Add to favorites'}
                        title={item.starred ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Star className={`h-4 w-4 ${item.starred ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={() => onLoadFromHistory(item)}
                        className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
                        aria-label="Load this search"
                        title="Load this search"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="p-2 text-red-600 hover:text-red-700 transition-colors"
                        aria-label="Delete this search"
                        title="Delete this search"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSessions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No research sessions found</p>
                <p className="text-sm">Your saved research sessions will appear here</p>
              </div>
            ) : (
              filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {session.name}
                        </h3>
                        {session.starred && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2 truncate">{session.query}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Created {formatDate(session.createdAt)}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Modified {formatDate(session.lastModified)}
                        </span>
                      </div>
                      {session.tags && session.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {session.tags.map((tag) => (
                            <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {session.notes && (
                        <p className="text-sm text-gray-600 mt-2 italic">"{session.notes}"</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEditSession(session)}
                        className="p-2 text-gray-600 hover:text-gray-700 transition-colors"
                        aria-label="Edit session"
                        title="Edit session"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onLoadSession(session)}
                        className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
                        aria-label="Load session"
                        title="Load session"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Session Edit Modal */}
      {isEditingSession && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Research Session</h3>
              <button
                onClick={() => setIsEditingSession(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close edit modal"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="session-name" className="block text-sm font-medium text-gray-700 mb-1">Session Name</label>
                <input
                  id="session-name"
                  type="text"
                  value={selectedSession.name}
                  onChange={(e) => setSelectedSession({ ...selectedSession, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Session name"
                  placeholder="Enter session name"
                />
              </div>
              
              <div>
                <label htmlFor="session-notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  id="session-notes"
                  value={selectedSession.notes || ''}
                  onChange={(e) => setSelectedSession({ ...selectedSession, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Add notes about this research session..."
                  title="Session notes"
                />
              </div>
              
              <div>
                <label htmlFor="session-tags" className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <input
                  id="session-tags"
                  type="text"
                  value={selectedSession.tags?.join(', ') || ''}
                  onChange={(e) => setSelectedSession({ 
                    ...selectedSession, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  })}
                  placeholder="tag1, tag2, tag3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Session tags"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="starred"
                  checked={selectedSession.starred || false}
                  onChange={(e) => setSelectedSession({ ...selectedSession, starred: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="starred" className="ml-2 text-sm text-gray-700">
                  Star this session
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsEditingSession(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSessionEdit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2 inline" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchHistory;
