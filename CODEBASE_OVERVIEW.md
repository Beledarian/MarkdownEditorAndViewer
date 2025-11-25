# Codebase Overview

This document provides a detailed technical overview of the Markdown Editor and Viewer application. It is intended for developers to understand the project structure, key components, and architectural decisions.

## 1. Project Overview

The **Markdown Editor and Viewer** is a React-based web application designed for writing and previewing Markdown files in real-time. It features a modern interface with support for local file system access, PDF/HTML export, custom theming, and annotation capabilities.

## 2. Technology Stack

*   **Frontend Framework**: React 18+ (using Vite for build tooling)
*   **Language**: JavaScript (ES Modules)
*   **State Management**: React `useState`, `useEffect`, `useContext` (local component state mostly)
*   **Markdown Engine**:
    *   `@uiw/react-md-editor`: Core editor component.
    *   `react-markdown`: Rendering engine.
    *   `rehype-raw`: Support for raw HTML in Markdown.
*   **Styling**: CSS Modules / Vanilla CSS (`App.css`, `index.css`).
*   **Utilities**:
    *   `html2pdf.js`: For exporting content to PDF.
    *   `react-hot-toast`: For toast notifications.
    *   **File System Access API**: For direct interaction with the user's local file system.

## 3. Project Structure

```text
/
├── public/              # Static assets
├── src/
│   ├── assets/          # Project assets (images, icons)
│   ├── components/      # Reusable UI components
│   ├── utils/           # Helper functions and logic
│   ├── App.jsx          # Main application component
│   ├── App.css          # Main application styles
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
└── README.md            # User documentation
```

## 4. Key Components

### `src/App.jsx`
The root component that orchestrates the entire application.
*   **State**: Manages `markdown` content, `currentFile` handle, `theme`, `sidebarOpen`, `annotations`, and `shortcuts`.
*   **Features**:
    *   **File System Integration**: Handles opening folders, reading/writing files, and auto-saving using the File System Access API.
    *   **Shortcuts**: Implements a global keyboard shortcut manager.
    *   **Drag & Drop**: Allows dragging images or markdown files directly into the editor.
    *   **Export**: Functions to export content as HTML or PDF.
    *   **Annotations**: Manages text highlighting and persistence.

### `src/components/`
*   **`Sidebar.jsx`**: Displays the file tree of the opened directory. It handles file selection, image insertion, and managing ignore patterns.
*   **`SettingsModal.jsx`**: A modal for configuring application settings like keyboard shortcuts and word count goals.
*   **`CheatSheetModal.jsx`**: Provides a quick reference for Markdown syntax.
*   **`HighlightToolbar.jsx`**: A floating toolbar that appears when text is selected in the preview, allowing users to highlight text.
*   **`Tooltip.jsx`**: A utility component for showing tooltips on hover.

## 5. Utilities (`src/utils/`)

*   **`fileSystem.js`**: Contains logic for scanning directories recursively, filtering files based on ignore patterns, and managing `.gitignore` style exclusion lists.
*   **`storage.js`**: Handles the persistence of directory handles (likely using IndexedDB) so users can restore their session after a reload.
*   **`annotations.js`**: Manages the loading and saving of user annotations (highlights/bookmarks) associated with specific files.

## 6. Key Features & Implementation Details

### File System Access
The app uses the modern **File System Access API** (`window.showDirectoryPicker`) to gain access to a local folder. This allows:
*   **Real-time Editing**: Changes are saved directly to the disk.
*   **Asset Management**: Images in the folder are detected and can be easily inserted.
*   **Security**: The browser manages permissions, ensuring the user explicitly grants access.

### Custom Image Handling
The `CustomImage` component in `App.jsx` handles the complexity of rendering local images. It attempts to resolve image paths in the following order:
1.  Exact path match.
2.  Relative path to the current file.
3.  Filename match (lazy mode).
It uses `URL.createObjectURL` to render local file handles.

### Annotations
The application supports highlighting text in the preview pane.
*   **Selection**: Detects text selection in the rendered HTML.
*   **Storage**: Saves the start/end container paths and offsets.
*   **Rendering**: Re-applies highlights by traversing the DOM to find the correct text nodes.

## 7. Development Scripts

*   `npm run dev`: Starts the Vite development server.
*   `npm run build`: Builds the application for production.
*   `npm run preview`: Previews the production build locally.
*   `npm run lint`: Runs ESLint to check for code quality issues.
