import { Note, Folder, Tag } from '../types';

const STORAGE_KEYS = {
  NOTES: 'clinical_trial_notes',
  FOLDERS: 'clinical_trial_folders',
  TAGS: 'clinical_trial_tags',
  THEME: 'clinical_trial_theme'
};

export class NotesService {
  // Note operations
  async createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    const notes = this.getNotes();
    const newNote: Note = {
      ...note,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    notes.push(newNote);
    this.saveNotes(notes);
    return newNote;
  }

  async updateNote(id: string, updates: Partial<Note>): Promise<Note> {
    const notes = this.getNotes();
    const index = notes.findIndex(n => n.id === id);
    if (index === -1) throw new Error('Note not found');
    
    notes[index] = {
      ...notes[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveNotes(notes);
    return notes[index];
  }

  async deleteNote(id: string): Promise<void> {
    const notes = this.getNotes();
    const filtered = notes.filter(n => n.id !== id);
    this.saveNotes(filtered);
  }

  async getNoteById(id: string): Promise<Note | null> {
    const notes = this.getNotes();
    return notes.find(n => n.id === id) || null;
  }

  async getAllNotes(): Promise<Note[]> {
    return this.getNotes();
  }

  async getNotesByFolder(folderId: string): Promise<Note[]> {
    const notes = this.getNotes();
    return notes.filter(n => n.folderId === folderId);
  }

  async searchNotes(query: string): Promise<Note[]> {
    const notes = this.getNotes();
    const lowerQuery = query.toLowerCase();
    return notes.filter(n => 
      n.title.toLowerCase().includes(lowerQuery) || 
      n.content.toLowerCase().includes(lowerQuery) ||
      n.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  async getFavoriteNotes(): Promise<Note[]> {
    const notes = this.getNotes();
    return notes.filter(n => n.isFavorite);
  }

  async getRecentNotes(limit: number = 10): Promise<Note[]> {
    const notes = this.getNotes();
    return notes
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  }

  // Folder operations
  async createFolder(folder: Omit<Folder, 'id' | 'createdAt'>): Promise<Folder> {
    const folders = this.getFolders();
    const newFolder: Folder = {
      ...folder,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    folders.push(newFolder);
    this.saveFolders(folders);
    return newFolder;
  }

  async updateFolder(id: string, updates: Partial<Folder>): Promise<Folder> {
    const folders = this.getFolders();
    const index = folders.findIndex(f => f.id === id);
    if (index === -1) throw new Error('Folder not found');
    
    folders[index] = { ...folders[index], ...updates };
    this.saveFolders(folders);
    return folders[index];
  }

  async deleteFolder(id: string): Promise<void> {
    const folders = this.getFolders();
    const filtered = folders.filter(f => f.id !== id && !f.isDefault);
    this.saveFolders(filtered);
    
    // Move notes from deleted folder to default folder
    const notes = this.getNotes();
    const defaultFolder = folders.find(f => f.name === 'All Notes');
    if (defaultFolder) {
      const updatedNotes = notes.map(n => 
        n.folderId === id ? { ...n, folderId: defaultFolder.id } : n
      );
      this.saveNotes(updatedNotes);
    }
  }

  async getAllFolders(): Promise<Folder[]> {
    return this.getFolders();
  }

  // Tag operations
  async getAllTags(): Promise<Tag[]> {
    const tags = localStorage.getItem(STORAGE_KEYS.TAGS);
    return tags ? JSON.parse(tags) : [];
  }

  async createTag(tag: Omit<Tag, 'id'>): Promise<Tag> {
    const tags = await this.getAllTags();
    const newTag: Tag = {
      ...tag,
      id: this.generateId()
    };
    tags.push(newTag);
    localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));
    return newTag;
  }

  // Theme operations
  async getTheme(): Promise<boolean> {
    const theme = localStorage.getItem(STORAGE_KEYS.THEME);
    return theme === 'dark';
  }

  async setTheme(isDark: boolean): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
  }

  // Export operations
  async exportNote(noteId: string): Promise<string> {
    const note = await this.getNoteById(noteId);
    if (!note) throw new Error('Note not found');
    
    return `# ${note.title}\n\n${note.content}\n\n---\nCreated: ${note.createdAt}\nUpdated: ${note.updatedAt}\nTags: ${note.tags.join(', ')}`;
  }

  async exportAllNotes(): Promise<{ [key: string]: any }> {
    return {
      notes: this.getNotes(),
      folders: this.getFolders(),
      tags: await this.getAllTags(),
      exportDate: new Date().toISOString()
    };
  }

  async importNotes(data: { notes?: Note[], folders?: Folder[], tags?: Tag[] }): Promise<void> {
    if (data.notes) {
      const existingNotes = this.getNotes();
      this.saveNotes([...existingNotes, ...data.notes]);
    }
    if (data.folders) {
      const existingFolders = this.getFolders();
      this.saveFolders([...existingFolders, ...data.folders]);
    }
    if (data.tags) {
      const existingTags = await this.getAllTags();
      localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify([...existingTags, ...data.tags]));
    }
  }

  // Initialize default data
  async initialize(): Promise<void> {
    const folders = this.getFolders();
    if (folders.length === 0) {
      // Create default folders
      await this.createFolder({ name: 'All Notes', color: '#6B7280', isDefault: true });
      await this.createFolder({ name: 'Recent', color: '#3B82F6', isDefault: true });
      await this.createFolder({ name: 'Favorites', color: '#EF4444', isDefault: true });
    }
  }

  // Private helper methods
  private getNotes(): Note[] {
    const notes = localStorage.getItem(STORAGE_KEYS.NOTES);
    return notes ? JSON.parse(notes) : [];
  }

  private saveNotes(notes: Note[]): void {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  }

  private getFolders(): Folder[] {
    const folders = localStorage.getItem(STORAGE_KEYS.FOLDERS);
    return folders ? JSON.parse(folders) : [];
  }

  private saveFolders(folders: Folder[]): void {
    localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const notesService = new NotesService();