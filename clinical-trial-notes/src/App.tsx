import React from 'react';
import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { NotesList } from './components/NotesList';
import { NoteEditor } from './components/NoteEditor';

function App() {
  return (
    <AppProvider>
      <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <NotesList />
          <NoteEditor />
        </div>
      </div>
    </AppProvider>
  );
}

export default App;