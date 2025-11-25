# Bug and Improvement Report

This document outlines identified bugs, potential security risks, and areas for improvement in the Markdown Editor and Viewer codebase. It is intended to guide future development and refactoring efforts.

## 1. Bugs and Issues

### 1.1 Security
*   **Unsanitized HTML Rendering**: The application uses `rehype-raw` in `App.jsx` (line 808) to render Markdown. This allows raw HTML execution. While this is a feature, it poses a Cross-Site Scripting (XSS) risk if users open malicious Markdown files obtained from untrusted sources.
    *   **Recommendation**: Implement a sanitization step using `rehype-sanitize` to whitelist safe HTML tags and attributes.

### 1.2 Performance
*   **Recursive Directory Scanning**: The `scanDirectory` function in `src/utils/fileSystem.js` processes directories recursively and sequentially. This can cause the UI to freeze or become unresponsive when opening folders with a large number of files or deep nesting.
    *   **Recommendation**: Implement an asynchronous, generator-based approach or use a worker thread for file scanning. Consider lazy loading subdirectories in the Sidebar.
*   **Frequent Re-renders**: The `App` component has many state variables. Updates to one piece of state (e.g., `markdown` content) can cause re-renders of the entire component tree, including the Sidebar and other unrelated parts.
    *   **Recommendation**: Optimize component re-renders using `React.memo` and split the `App` component into smaller, more focused components.

### 1.3 Accessibility (a11y)
*   **Missing ARIA Labels**: Several buttons in `App.jsx` and `Sidebar.jsx` rely solely on emojis or icons for visual representation (e.g., Theme toggle, Settings button). Screen reader users will not understand the purpose of these buttons.
    *   **Recommendation**: Add `aria-label` attributes to all icon-only buttons.
*   **Keyboard Navigation**: While some global shortcuts exist, standard keyboard navigation (Tab key) through the Sidebar and Editor might need verification to ensure a logical flow.

### 1.4 Code Quality & Maintainability
*   **Monolithic `App.jsx`**: The `App.jsx` file is over 800 lines long and handles too many responsibilities: layout, state management, file system logic, event handling, and rendering.
    *   **Recommendation**: Refactor `App.jsx`.
        *   Extract `CustomImage` to its own file.
        *   Move state management to a Context (e.g., `FileSystemContext`, `EditorContext`).
        *   Extract the toolbar and status bar into separate components.
*   **Hardcoded Styles in Export**: The `handleExportHTML` function contains a hardcoded CSS string. This duplicates the logic from `App.css` and will lead to inconsistencies if the main theme changes.
    *   **Recommendation**: Extract the export CSS to a separate file or template that can be shared or imported.

## 2. Improvements and Feature Requests

### 2.1 Architecture
*   **State Management**: Transition from multiple `useState` hooks to `useReducer` or a dedicated state management library (like Zustand or Redux Toolkit) to handle complex state interactions, especially for the file system and settings.
*   **TypeScript Migration**: Migrating the codebase to TypeScript would improve type safety, reduce runtime errors, and improve developer experience with better autocompletion.

### 2.2 User Experience
*   **Virtualization**: Implement list virtualization (e.g., `react-window`) for the Sidebar file list to handle thousands of files efficiently without DOM bloat.
*   **Search Functionality**: Improve the Sidebar search to support fuzzy matching or regex.
*   **Tabs System**: Currently, only one file can be open at a time. Implementing a tabbed interface would allow users to work on multiple files simultaneously.

### 2.3 Testing
*   **Unit Tests**: There are currently no visible unit tests.
    *   **Recommendation**: Add unit tests for utility functions in `src/utils/` (especially `fileSystem.js` and `annotations.js`).
*   **Component Tests**: Add testing for key components like `Sidebar` and `Editor` using React Testing Library.

## 3. Action Plan for Agents

If you are an agent reading this, prioritize tasks as follows:

1.  **[DONE] Fix Security Vulnerabilities**: Address the `rehype-raw` sanitization issue. (Implemented `rehype-sanitize`)
2.  **[DONE] Refactor `App.jsx`**: Break down the monolithic component to improve readability and maintainability. (Extracted Toolbar, StatusBar, CustomImage)
3.  **[DONE] Improve Accessibility**: Add ARIA labels to all interactive elements. (Added to Toolbar and Sidebar)
4.  **[DONE] Optimize Performance**: Refactor `scanDirectory` and implement list virtualization. (Implemented concurrency limit and react-virtuoso)
5.  **[DONE] Testing**: Added unit tests and component tests. (Added vitest, fileSystem.test.js, Sidebar.test.js)

