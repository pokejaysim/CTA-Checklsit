import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Note, Folder, Tag } from '../types';
import { notesService } from '../services/NotesService';

interface AppContextType {
  // Notes
  notes: Note[];
  selectedNote: Note | null;
  setSelectedNote: (note: Note | null) => void;
  createNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Note>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  
  // Folders
  folders: Folder[];
  selectedFolder: Folder | null;
  setSelectedFolder: (folder: Folder | null) => void;
  createFolder: (folder: Omit<Folder, 'id' | 'createdAt'>) => Promise<Folder>;
  updateFolder: (id: string, updates: Partial<Folder>) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Note[];
  
  // Tags
  tags: Tag[];
  createTag: (tag: Omit<Tag, 'id'>) => Promise<Tag>;
  
  // Theme
  isDarkMode: boolean;
  toggleTheme: () => void;
  
  // Utilities
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      await notesService.initialize();
      const [loadedNotes, loadedFolders, loadedTags, theme] = await Promise.all([
        notesService.getAllNotes(),
        notesService.getAllFolders(),
        notesService.getAllTags(),
        notesService.getTheme()
      ]);
      
      setNotes(loadedNotes);
      setFolders(loadedFolders);
      setTags(loadedTags);
      setIsDarkMode(theme);
      
      // Set default folder
      const allNotesFolder = loadedFolders.find(f => f.name === 'All Notes');
      if (allNotesFolder && !selectedFolder) {
        setSelectedFolder(allNotesFolder);
      }
    };
    
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update search results when query changes
  useEffect(() => {
    if (searchQuery) {
      notesService.searchNotes(searchQuery).then(setSearchResults);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, notes]);

  // Apply theme class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const loadData = async () => {
    await notesService.initialize();
    const [loadedNotes, loadedFolders, loadedTags, theme] = await Promise.all([
      notesService.getAllNotes(),
      notesService.getAllFolders(),
      notesService.getAllTags(),
      notesService.getTheme()
    ]);
    
    setNotes(loadedNotes);
    setFolders(loadedFolders);
    setTags(loadedTags);
    setIsDarkMode(theme);
    
    // Set default folder
    const allNotesFolder = loadedFolders.find(f => f.name === 'All Notes');
    if (allNotesFolder && !selectedFolder) {
      setSelectedFolder(allNotesFolder);
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  const createNote = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote = await notesService.createNote(noteData);
    setNotes([...notes, newNote]);
    return newNote;
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    await notesService.updateNote(id, updates);
    setNotes(notes.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n));
    if (selectedNote?.id === id) {
      setSelectedNote({ ...selectedNote, ...updates, updatedAt: new Date().toISOString() });
    }
  };

  const deleteNote = async (id: string) => {
    await notesService.deleteNote(id);
    setNotes(notes.filter(n => n.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(null);
    }
  };

  const createFolder = async (folderData: Omit<Folder, 'id' | 'createdAt'>) => {
    const newFolder = await notesService.createFolder(folderData);
    setFolders([...folders, newFolder]);
    return newFolder;
  };

  const updateFolder = async (id: string, updates: Partial<Folder>) => {
    await notesService.updateFolder(id, updates);
    setFolders(folders.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const deleteFolder = async (id: string) => {
    await notesService.deleteFolder(id);
    await refreshData();
  };

  const createTag = async (tagData: Omit<Tag, 'id'>) => {
    const newTag = await notesService.createTag(tagData);
    setTags([...tags, newTag]);
    return newTag;
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    notesService.setTheme(newTheme);
  };

  const value: AppContextType = {
    notes,
    selectedNote,
    setSelectedNote,
    createNote,
    updateNote,
    deleteNote,
    folders,
    selectedFolder,
    setSelectedFolder,
    createFolder,
    updateFolder,
    deleteFolder,
    searchQuery,
    setSearchQuery,
    searchResults,
    tags,
    createTag,
    isDarkMode,
    toggleTheme,
    refreshData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};