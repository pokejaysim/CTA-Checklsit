import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface TagInputProps {
  noteTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export const TagInput: React.FC<TagInputProps> = ({ noteTags, onTagsChange }) => {
  const { tags, createTag } = useApp();
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const availableTags = tags.map(t => t.name);
  const suggestions = availableTags.filter(
    tag => !noteTags.includes(tag) && tag.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleAddTag = async (tagName: string) => {
    if (!tagName.trim() || noteTags.includes(tagName)) return;

    const existingTag = tags.find(t => t.name === tagName);
    if (!existingTag) {
      await createTag({
        name: tagName,
        color: '#' + Math.floor(Math.random()*16777215).toString(16)
      });
    }

    onTagsChange([...noteTags, tagName]);
    setInputValue('');
    setShowSuggestions(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(noteTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      handleAddTag(inputValue.trim());
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {noteTags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
          >
            {tag}
            <button
              onClick={() => handleRemoveTag(tag)}
              className="ml-2 hover:text-blue-600 dark:hover:text-blue-300"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>

      <div className="relative">
        <div className="flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyPress={handleKeyPress}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Add a tag..."
            className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => handleAddTag(inputValue.trim())}
            disabled={!inputValue.trim()}
            className="px-3 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {showSuggestions && suggestions.length > 0 && inputValue && (
          <div className="absolute top-full mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
            {suggestions.map((tag) => (
              <button
                key={tag}
                onClick={() => handleAddTag(tag)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};