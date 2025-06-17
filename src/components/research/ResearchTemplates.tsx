'use client';

import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Edit3, 
  Trash2, 
  BookOpen, 
  Briefcase, 
  Newspaper,
  GraduationCap,
  Search,
  Copy,
  Settings
} from 'lucide-react';

interface AdvancedSearchOptions {
  dateRange?: { start?: string; end?: string; };
  domains?: string[];
  sourceTypes?: ('academic' | 'news' | 'government' | 'commercial' | 'blog' | 'social')[];
  language?: string;
  region?: string;
  categories?: string[];
  excludeTerms?: string[];
  sortBy?: 'relevance' | 'date' | 'credibility';
  maxResults?: number;
}

interface ResearchTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  searchQueries: string[];
  advancedOptions: AdvancedSearchOptions;
  reportSections: string[];
  tags: string[];
}

interface Props {
  templates: ResearchTemplate[];
  onApplyTemplate: (template: ResearchTemplate) => void;
  onSaveTemplate: (template: ResearchTemplate) => void;
  onDeleteTemplate: (id: string) => void;
}

const ResearchTemplates: React.FC<Props> = ({
  templates,
  onApplyTemplate,
  onSaveTemplate,
  onDeleteTemplate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ResearchTemplate | null>(null);

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'academic':
        return <GraduationCap className="h-5 w-5" />;
      case 'business':
        return <Briefcase className="h-5 w-5" />;
      case 'journalism':
        return <Newspaper className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'academic':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'business':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'journalism':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-purple-100 text-purple-700 border-purple-200';
    }
  };

  const createNewTemplate = (): ResearchTemplate => ({
    id: Date.now().toString(),
    name: '',
    description: '',
    category: 'General',
    searchQueries: [''],
    advancedOptions: {
      sortBy: 'relevance',
      maxResults: 15
    },
    reportSections: ['Introduction', 'Main Content', 'Conclusion'],
    tags: []
  });

  const handleCreateTemplate = () => {
    setEditingTemplate(createNewTemplate());
    setIsCreating(true);
  };

  const handleSaveTemplate = () => {
    if (editingTemplate) {
      onSaveTemplate(editingTemplate);
      setEditingTemplate(null);
      setIsCreating(false);
    }
  };

  const handleDuplicateTemplate = (template: ResearchTemplate) => {
    const duplicated = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`
    };
    onSaveTemplate(duplicated);
  };

  const handleEditTemplate = (template: ResearchTemplate) => {
    setEditingTemplate({ ...template });
    setIsCreating(false);
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      onDeleteTemplate(id);
    }
  };

  const updateEditingTemplate = (key: keyof ResearchTemplate, value: any) => {
    if (editingTemplate) {
      setEditingTemplate({ ...editingTemplate, [key]: value });
    }
  };

  const addSearchQuery = () => {
    if (editingTemplate) {
      updateEditingTemplate('searchQueries', [...editingTemplate.searchQueries, '']);
    }
  };

  const updateSearchQuery = (index: number, value: string) => {
    if (editingTemplate) {
      const updated = [...editingTemplate.searchQueries];
      updated[index] = value;
      updateEditingTemplate('searchQueries', updated);
    }
  };

  const removeSearchQuery = (index: number) => {
    if (editingTemplate && editingTemplate.searchQueries.length > 1) {
      const updated = editingTemplate.searchQueries.filter((_, i) => i !== index);
      updateEditingTemplate('searchQueries', updated);
    }
  };

  const addReportSection = () => {
    if (editingTemplate) {
      updateEditingTemplate('reportSections', [...editingTemplate.reportSections, '']);
    }
  };

  const updateReportSection = (index: number, value: string) => {
    if (editingTemplate) {
      const updated = [...editingTemplate.reportSections];
      updated[index] = value;
      updateEditingTemplate('reportSections', updated);
    }
  };

  const removeReportSection = (index: number) => {
    if (editingTemplate && editingTemplate.reportSections.length > 1) {
      const updated = editingTemplate.reportSections.filter((_, i) => i !== index);
      updateEditingTemplate('reportSections', updated);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Research Templates</h2>
          <button
            onClick={handleCreateTemplate}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex space-x-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? 'All Categories' : category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="p-6">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Layers className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No templates found</p>
            <p className="text-sm">Create your first research template to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`flex items-center px-3 py-1 rounded-full border ${getCategoryColor(template.category)}`}>
                    {getCategoryIcon(template.category)}
                    <span className="ml-2 text-sm font-medium">{template.category}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDuplicateTemplate(template)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Duplicate template"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditTemplate(template)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Edit template"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-1 text-red-400 hover:text-red-600 transition-colors"
                      title="Delete template"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{template.description}</p>

                {/* Template Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Search className="h-4 w-4 mr-2" />
                    <span>{template.searchQueries.length} search queries</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <BookOpen className="h-4 w-4 mr-2" />
                    <span>{template.reportSections.length} report sections</span>
                  </div>
                  {template.advancedOptions.sourceTypes && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Settings className="h-4 w-4 mr-2" />
                      <span>{template.advancedOptions.sourceTypes.length} source types</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {template.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {template.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Apply Button */}
                <button
                  onClick={() => onApplyTemplate(template)}
                  className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Apply Template
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Template Editor Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {isCreating ? 'Create New Template' : 'Edit Template'}
              </h3>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                  <input
                    type="text"
                    value={editingTemplate.name}
                    onChange={(e) => updateEditingTemplate('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter template name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={editingTemplate.category}
                    onChange={(e) => updateEditingTemplate('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Academic, Business, Journalism"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editingTemplate.description}
                  onChange={(e) => updateEditingTemplate('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe what this template is for"
                />
              </div>

              {/* Search Queries */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">Search Queries</label>
                  <button
                    onClick={addSearchQuery}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    + Add Query
                  </button>
                </div>
                <div className="space-y-2">
                  {editingTemplate.searchQueries.map((query, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={query}
                        onChange={(e) => updateSearchQuery(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter search query"
                      />
                      {editingTemplate.searchQueries.length > 1 && (
                        <button
                          onClick={() => removeSearchQuery(index)}
                          className="text-red-600 hover:text-red-700"
                          aria-label="Remove search query"
                          title="Remove this search query"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Report Sections */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">Report Sections</label>
                  <button
                    onClick={addReportSection}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    + Add Section
                  </button>
                </div>
                <div className="space-y-2">
                  {editingTemplate.reportSections.map((section, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={section}
                        onChange={(e) => updateReportSection(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter section title"
                      />
                      {editingTemplate.reportSections.length > 1 && (
                        <button
                          onClick={() => removeReportSection(index)}
                          className="text-red-600 hover:text-red-700"
                          aria-label="Remove report section"
                          title="Remove this report section"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <input
                  type="text"
                  value={editingTemplate.tags.join(', ')}
                  onChange={(e) => updateEditingTemplate('tags', e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setEditingTemplate(null);
                  setIsCreating(false);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {isCreating ? 'Create Template' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchTemplates;
