import React, { useEffect, useState } from 'react';
import { Plus, Star, StarOff, Search } from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '../context/AppContext';
import { Note } from '../types';

export const NotesList: React.FC = () => {
  const { 
    notes, 
    selectedNote, 
    setSelectedNote, 
    selectedFolder, 
    createNote, 
    updateNote,
    searchQuery,
    searchResults,
    folders 
  } = useApp();
  
  const [displayNotes, setDisplayNotes] = useState<Note[]>([]);

  useEffect(() => {
    let filteredNotes: Note[] = [];

    if (searchQuery) {
      filteredNotes = searchResults;
    } else if (selectedFolder) {
      switch (selectedFolder.name) {
        case 'All Notes':
          filteredNotes = notes;
          break;
        case 'Recent':
          filteredNotes = [...notes]
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 10);
          break;
        case 'Favorites':
          filteredNotes = notes.filter(n => n.isFavorite);
          break;
        default:
          filteredNotes = notes.filter(n => n.folderId === selectedFolder.id);
      }
    }

    setDisplayNotes(filteredNotes);
  }, [notes, selectedFolder, searchQuery, searchResults]);

  const handleCreateNote = async () => {
    if (!selectedFolder) return;
    
    const folderId = selectedFolder.isDefault && selectedFolder.name !== 'All Notes' 
      ? notes[0]?.folderId || selectedFolder.id 
      : selectedFolder.id;

    const newNote = await createNote({
      title: 'Untitled Note',
      content: '',
      folderId,
      tags: [],
      isFavorite: false
    });
    
    setSelectedNote(newNote);
  };

  const toggleFavorite = async (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    await updateNote(note.id, { isFavorite: !note.isFavorite });
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength) + '...' 
      : plainText;
  };

  const getNoteFolder = (note: Note) => {
    return folders.find(f => f.id === note.folderId);
  };

  return (
    <div className="w-80 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {searchQuery ? `Search Results (${displayNotes.length})` : selectedFolder?.name || 'Notes'}
          </h3>
          <button
            onClick={handleCreateNote}
            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            disabled={!selectedFolder || searchQuery !== ''}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        {searchQuery && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Search className="w-4 h-4 mr-2" />
            <span>Searching for "{searchQuery}"</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {displayNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p className="text-center mb-2">
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </p>
            {!searchQuery && (
              <p className="text-sm text-center">
                Click the + button to create your first note
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-0">
            {displayNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className={`p-4 cursor-pointer border-b border-gray-100 dark:border-gray-700 transition-colors ${
                  selectedNote?.id === note.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 flex-1 pr-2">
                    {note.title}
                  </h4>
                  <button
                    onClick={(e) => toggleFavorite(note, e)}
                    className="text-gray-400 hover:text-yellow-500 transition-colors"
                  >
                    {note.isFavorite ? (
                      <Star className="w-4 h-4 fill-current text-yellow-500" />
                    ) : (
                      <StarOff className="w-4 h-4" />
                    )}
                  </button>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                  {truncateContent(note.content) || 'No content'}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {/* Show folder indicator when searching or viewing All Notes */}
                    {(searchQuery || selectedFolder?.name === 'All Notes') && (
                      <div className="flex items-center space-x-1">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: getNoteFolder(note)?.color || '#6B7280' }}
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {getNoteFolder(note)?.name || 'Unknown'}
                        </span>
                      </div>
                    )}
                    
                    {note.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {note.tags.length > 2 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        +{note.tags.length - 2}
                      </span>
                    )}
                  </div>
                  
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(note.updatedAt), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};