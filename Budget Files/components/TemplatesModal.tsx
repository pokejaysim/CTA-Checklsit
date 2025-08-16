'use client';

import React, { useState, useEffect } from 'react';
import { X, FileText, Plus, Trash2, Check } from 'lucide-react';
import { loadTemplates, saveTemplate, deleteTemplate, applyTemplate, type BudgetTemplate } from '@/lib/templates';
import type { BudgetData } from '@/types/budget';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (budgetData: BudgetData) => void;
  currentBudgetData: BudgetData;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onApplyTemplate,
  currentBudgetData,
}) => {
  const [templates, setTemplates] = useState<BudgetTemplate[]>([]);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState<BudgetTemplate['category']>('Custom');

  useEffect(() => {
    if (isOpen) {
      setTemplates(loadTemplates());
    }
  }, [isOpen]);

  const handleApplyTemplate = (templateId: string) => {
    const updatedData = applyTemplate(templateId, currentBudgetData);
    onApplyTemplate(updatedData);
    onClose();
  };

  const handleSaveTemplate = () => {
    if (!newTemplateName.trim()) return;

    const { studyInfo, ...templateData } = currentBudgetData;
    void studyInfo; // Explicitly indicate we're discarding this value
    
    saveTemplate({
      name: newTemplateName,
      description: newTemplateDescription,
      category: newTemplateCategory,
      data: templateData,
    });

    setTemplates(loadTemplates());
    setShowSaveForm(false);
    setNewTemplateName('');
    setNewTemplateDescription('');
    setNewTemplateCategory('Custom');
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      deleteTemplate(templateId);
      setTemplates(loadTemplates());
    }
  };

  const categoryColors = {
    'Phase I': 'bg-red-100 text-red-800',
    'Phase II': 'bg-yellow-100 text-yellow-800',
    'Phase III': 'bg-green-100 text-green-800',
    'Observational': 'bg-blue-100 text-blue-800',
    'Device': 'bg-purple-100 text-purple-800',
    'Custom': 'bg-gray-100 text-gray-800',
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 shadow-xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-700" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Budget Templates</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowSaveForm(!showSaveForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Save Current Budget as Template
          </button>
        </div>

        {showSaveForm && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Create New Template</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., My Phase II Study Template"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={newTemplateCategory}
                  onChange={(e) => setNewTemplateCategory(e.target.value as BudgetTemplate['category'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Custom">Custom</option>
                  <option value="Phase I">Phase I</option>
                  <option value="Phase II">Phase II</option>
                  <option value="Phase III">Phase III</option>
                  <option value="Observational">Observational</option>
                  <option value="Device">Device</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={newTemplateDescription}
                onChange={(e) => setNewTemplateDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description of this template..."
              />
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleSaveTemplate}
                disabled={!newTemplateName.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                Save Template
              </button>
              <button
                onClick={() => setShowSaveForm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{template.name}</h4>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${categoryColors[template.category]}`}>
                    {template.category}
                  </span>
                </div>
                {!template.isDefault && (
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete template"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{template.description}</p>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-4">
                <div>
                  <span className="font-medium">Enrollment:</span> {template.data.targetEnrollment}
                </div>
                <div>
                  <span className="font-medium">Overhead:</span> {template.data.overhead}%
                </div>
                <div>
                  <span className="font-medium">Visits:</span> {template.data.visits.length}
                </div>
                <div>
                  <span className="font-medium">Personnel:</span> {template.data.personnelReimbursements.length}
                </div>
              </div>

              <button
                onClick={() => handleApplyTemplate(template.id)}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Apply Template
              </button>
            </div>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No templates available</p>
          </div>
        )}
      </div>
    </div>
  );
};