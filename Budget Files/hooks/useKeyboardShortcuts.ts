import { useEffect, useCallback } from 'react';

interface KeyboardShortcuts {
  onSave?: () => void;
  onExportPDF?: () => void;
  onExportExcel?: () => void;
  onExportJSON?: () => void;
  onTemplates?: () => void;
  onClearAll?: () => void;
  onImport?: () => void;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcuts) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs or textareas
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement
    ) {
      return;
    }

    // Check for modifier keys (Ctrl/Cmd)
    const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const ctrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

    if (ctrlOrCmd) {
      switch (event.key.toLowerCase()) {
        case 's':
          event.preventDefault();
          shortcuts.onSave?.();
          break;
        case 'p':
          event.preventDefault();
          shortcuts.onExportPDF?.();
          break;
        case 'e':
          event.preventDefault();
          shortcuts.onExportExcel?.();
          break;
        case 'j':
          event.preventDefault();
          shortcuts.onExportJSON?.();
          break;
        case 't':
          event.preventDefault();
          shortcuts.onTemplates?.();
          break;
        case 'i':
          event.preventDefault();
          shortcuts.onImport?.();
          break;
        case 'r':
          if (event.shiftKey) {
            event.preventDefault();
            shortcuts.onClearAll?.();
          }
          break;
      }
    }

    // Single key shortcuts (without modifiers)
    if (!ctrlOrCmd && !event.shiftKey && !event.altKey) {
      switch (event.key) {
        case '?':
          // Show help modal (future feature)
          event.preventDefault();
          break;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Return the shortcuts for display purposes
  const getShortcutText = useCallback(() => {
    const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifier = isMac ? '⌘' : 'Ctrl';
    
    return {
      save: `${modifier}+S`,
      exportPDF: `${modifier}+P`,
      exportExcel: `${modifier}+E`,
      exportJSON: `${modifier}+J`,
      templates: `${modifier}+T`,
      import: `${modifier}+I`,
      clearAll: `${modifier}+Shift+R`,
    };
  }, []);

  return { getShortcutText };
};