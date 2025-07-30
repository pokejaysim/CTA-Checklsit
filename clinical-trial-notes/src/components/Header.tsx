import React from 'react';
import { Moon, Sun, Download, Upload, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { notesService } from '../services/NotesService';
import { SearchBar } from './SearchBar';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

export const Header: React.FC = () => {
  const { isDarkMode, toggleTheme, refreshData } = useApp();

  const handleExportAll = async () => {
    const data = await notesService.exportAllNotes();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    saveAs(blob, `clinical-notes-backup-${new Date().toISOString().split('T')[0]}.json`);
  };

  const handleExportAsZip = async () => {
    const zip = new JSZip();
    const notes = await notesService.getAllNotes();
    
    // Add each note as a markdown file
    for (const note of notes) {
      const content = await notesService.exportNote(note.id);
      const fileName = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
      zip.file(fileName, content);
    }

    // Add metadata
    const metadata = await notesService.exportAllNotes();
    zip.file('metadata.json', JSON.stringify(metadata, null, 2));

    // Generate and download ZIP
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `clinical-notes-${new Date().toISOString().split('T')[0]}.zip`);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            await notesService.importNotes(data);
            await refreshData();
            alert('Notes imported successfully!');
          } catch (error) {
            alert('Failed to import notes. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              Clinical Trial Notes
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="w-96">
            <SearchBar />
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleImport}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Import notes"
            >
              <Upload className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            
            <div className="relative group">
              <button
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Export notes"
              >
                <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleExportAll}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Export as JSON
                </button>
                <button
                  onClick={handleExportAsZip}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Export as ZIP
                </button>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};