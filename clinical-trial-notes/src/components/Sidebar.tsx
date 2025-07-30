import React, { useState } from 'react';
import { Folder, Plus, MoreVertical, Edit2, Trash2, Star, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar: React.FC = () => {
  const { folders, selectedFolder, setSelectedFolder, createFolder, updateFolder, deleteFolder, notes } = useApp();
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      await createFolder({
        name: newFolderName.trim(),
        color: '#' + Math.floor(Math.random()*16777215).toString(16)
      });
      setNewFolderName('');
      setIsCreatingFolder(false);
    }
  };

  const handleUpdateFolder = async (id: string) => {
    if (editingFolderName.trim()) {
      await updateFolder(id, { name: editingFolderName.trim() });
      setEditingFolderId(null);
      setEditingFolderName('');
    }
  };

  const handleDeleteFolder = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this folder? Notes will be moved to "All Notes".')) {
      await deleteFolder(id);
      setShowDropdown(null);
    }
  };

  const getNoteCount = (folderId: string, folderName: string) => {
    switch (folderName) {
      case 'All Notes':
        return notes.length;
      case 'Recent':
        return Math.min(notes.length, 10);
      case 'Favorites':
        return notes.filter(n => n.isFavorite).length;
      default:
        return notes.filter(n => n.folderId === folderId).length;
    }
  };

  const getFolderIcon = (folderName: string) => {
    switch (folderName) {
      case 'Recent':
        return <Clock className="w-4 h-4" />;
      case 'Favorites':
        return <Star className="w-4 h-4" />;
      default:
        return <Folder className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-64 h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Folders</h2>
        <button
          onClick={() => setIsCreatingFolder(true)}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
        >
          <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <div className="space-y-1">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className={`group relative flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
              selectedFolder?.id === folder.id
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setSelectedFolder(folder)}
          >
            <div className="flex items-center flex-1">
              <div style={{ color: folder.color }} className="mr-2">
                {getFolderIcon(folder.name)}
              </div>
              {editingFolderId === folder.id ? (
                <input
                  type="text"
                  value={editingFolderName}
                  onChange={(e) => setEditingFolderName(e.target.value)}
                  onBlur={() => handleUpdateFolder(folder.id)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUpdateFolder(folder.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded"
                  autoFocus
                />
              ) : (
                <span className="flex-1 text-sm font-medium">{folder.name}</span>
              )}
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                {getNoteCount(folder.id, folder.name)}
              </span>
            </div>

            {!folder.isDefault && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdown(showDropdown === folder.id ? null : folder.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-opacity"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                
                {showDropdown === folder.id && (
                  <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingFolderId(folder.id);
                        setEditingFolderName(folder.name);
                        setShowDropdown(null);
                      }}
                      className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Rename
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFolder(folder.id);
                      }}
                      className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {isCreatingFolder && (
          <div className="p-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onBlur={() => {
                if (!newFolderName.trim()) setIsCreatingFolder(false);
                else handleCreateFolder();
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleCreateFolder();
                if (e.key === 'Escape') {
                  setIsCreatingFolder(false);
                  setNewFolderName('');
                }
              }}
              placeholder="Folder name"
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
        )}
      </div>
    </div>
  );
};