import React, { useEffect, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading2, 
  Quote,
  Trash2,
  Download,
  Tag
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import { TagInput } from './TagInput';

export const NoteEditor: React.FC = () => {
  const { selectedNote, updateNote, deleteNote, setSelectedNote } = useApp();
  const [title, setTitle] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start typing your note...',
      }),
    ],
    content: selectedNote?.content || '',
    onUpdate: ({ editor }) => {
      if (selectedNote) {
        const content = editor.getHTML();
        updateNote(selectedNote.id, { content });
      }
    },
  });

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      editor?.commands.setContent(selectedNote.content);
    } else {
      setTitle('');
      editor?.commands.setContent('');
    }
  }, [selectedNote, editor]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (selectedNote) {
      updateNote(selectedNote.id, { title: newTitle });
    }
  }, [selectedNote, updateNote]);

  const handleDelete = async () => {
    if (!selectedNote || isDeleting) return;
    
    if (window.confirm('Are you sure you want to delete this note?')) {
      setIsDeleting(true);
      await deleteNote(selectedNote.id);
      setSelectedNote(null);
      setIsDeleting(false);
    }
  };

  const handleExport = () => {
    if (!selectedNote) return;
    
    const content = `# ${selectedNote.title}\n\n${selectedNote.content.replace(/<[^>]*>/g, '')}\n\n---\nCreated: ${format(new Date(selectedNote.createdAt), 'PPP')}\nUpdated: ${format(new Date(selectedNote.updatedAt), 'PPP')}\nTags: ${selectedNote.tags.join(', ')}`;
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedNote.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!selectedNote) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-2">
            Select a note to edit
          </h3>
          <p className="text-gray-500 dark:text-gray-500">
            Choose a note from the list or create a new one
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 relative">
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            className="text-2xl font-bold bg-transparent border-none outline-none flex-1 text-gray-800 dark:text-gray-200 placeholder-gray-400"
            placeholder="Untitled Note"
          />
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowTagInput(!showTagInput)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Add tags"
            >
              <Tag className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={handleExport}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Export note"
            >
              <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Delete note"
            >
              <Trash2 className="w-5 h-5 text-red-500" />
            </button>
          </div>
        </div>

        {showTagInput && (
          <div className="mb-4">
            <TagInput
              noteTags={selectedNote.tags}
              onTagsChange={(tags) => updateNote(selectedNote.id, { tags })}
            />
          </div>
        )}

        <div className="flex items-center space-x-1 border-t border-gray-200 dark:border-gray-700 pt-2">
          <button
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`p-2 rounded transition-colors ${
              editor?.isActive('bold') 
                ? 'bg-gray-200 dark:bg-gray-700' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Bold className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`p-2 rounded transition-colors ${
              editor?.isActive('italic') 
                ? 'bg-gray-200 dark:bg-gray-700' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Italic className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded transition-colors ${
              editor?.isActive('heading', { level: 2 }) 
                ? 'bg-gray-200 dark:bg-gray-700' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Heading2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded transition-colors ${
              editor?.isActive('bulletList') 
                ? 'bg-gray-200 dark:bg-gray-700' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <List className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded transition-colors ${
              editor?.isActive('orderedList') 
                ? 'bg-gray-200 dark:bg-gray-700' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <ListOrdered className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded transition-colors ${
              editor?.isActive('blockquote') 
                ? 'bg-gray-200 dark:bg-gray-700' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Quote className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      <div 
        className="flex-1 overflow-y-auto cursor-text editor-container"
        onClick={() => editor?.commands.focus()}
      >
        <EditorContent 
          editor={editor} 
          className="prose prose-gray dark:prose-invert max-w-none focus:outline-none h-full"
        />
        {(!selectedNote?.content || selectedNote.content === '') && (
          <div 
            className="absolute inset-6 flex items-start justify-start pointer-events-none text-gray-400 dark:text-gray-500"
            style={{ top: '200px' }}
          >
            <p className="text-lg">Click anywhere to start writing...</p>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 p-4 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex justify-between">
          <span>Created: {format(new Date(selectedNote.createdAt), 'PPP')}</span>
          <span>Updated: {format(new Date(selectedNote.updatedAt), 'PPP')}</span>
        </div>
      </div>
    </div>
  );
};