export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  isDefault?: boolean;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface AppTheme {
  isDark: boolean;
}