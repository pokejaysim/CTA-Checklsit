# Clinical Trial Notes System

A modern notes management system for clinical trials with local storage, built as a test version before adding backend integration.

## Features

✅ **Rich Text Editor** - Full-featured text editing with markdown support
✅ **Folder Organization** - Create, rename, and delete folders to organize notes
✅ **Search Functionality** - Fast search across note titles and content
✅ **Tagging System** - Add tags to notes for better organization
✅ **Dark/Light Theme** - Toggle between themes for comfortable viewing
✅ **Export/Import** - Export notes as JSON or ZIP, import from backups
✅ **Favorites** - Mark important notes as favorites
✅ **Auto-save** - Automatic saving as you type

## Tech Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **Rich Text Editor**: TipTap
- **Storage**: localStorage (migration-ready architecture)
- **State Management**: React Context API
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Getting Started

1. Navigate to the project directory:
   ```bash
   cd clinical-trial-notes
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Creating Notes
- Click the **+** button in the notes list to create a new note
- Notes are automatically saved as you type

### Organizing with Folders
- Use the sidebar to navigate between folders
- Create custom folders by clicking the **+** button next to "Folders"
- Right-click folders to rename or delete them

### Adding Tags
- Click the tag icon in the note editor to add tags
- Tags help categorize and filter your notes

### Searching
- Use the search bar in the header to find notes
- Search works across note titles, content, and tags

### Exporting Data
- Click the download icon to export your notes
- Choose between JSON format (for backups) or ZIP (individual markdown files)

### Dark Mode
- Toggle between light and dark themes using the moon/sun icon

## Architecture

The application is built with a migration-ready architecture:

- **Service Layer**: All data operations go through `NotesService`, making it easy to swap localStorage for a real backend
- **TypeScript Interfaces**: Strongly typed data structures for consistency
- **React Context**: Centralized state management
- **Component Structure**: Modular components for easy maintenance

## Future Enhancements

This test version demonstrates core functionality. Future additions could include:
- Firebase/Supabase backend integration
- Real-time collaboration
- Version history
- Advanced markdown features
- Mobile app version

## Development

### Project Structure
```
src/
├── components/       # React components
├── context/         # App context and state management
├── services/        # Data service layer
└── types/          # TypeScript interfaces
```

### Building for Production
```bash
npm run build
```

This creates an optimized production build in the `build` folder.