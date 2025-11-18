# GEMINI.md: Implementation Plan for a Simple Markdown Editor and Viewer

This document outlines the plan for creating a simple but effective Markdown editor and viewer application.

## 1. Project Goal

The goal is to build a desktop or web application that provides a real-time, side-by-side editor and viewer for Markdown files. As the user types Markdown in the editor pane, the rendered HTML will be instantly updated in the viewer pane.

## 2. Core Features

*   **Markdown Editor:** A simple text area where the user can write and edit Markdown syntax.
*   **Live Preview:** A pane that displays the rendered HTML output of the Markdown from the editor, updating in real-time.
*   **Basic Styling:** Clean and readable default styling for both the editor and the rendered content.

## 3. Technology Stack

This plan assumes a web-based technology stack, which is versatile for creating both web and desktop applications (using frameworks like Electron).

*   **Frontend Framework:** React.js for building the user interface components.
*   **Markdown Parsing:** A reliable library like `marked` or `react-markdown` to convert Markdown text to HTML.
*   **Styling:** CSS or a pre-processor like Sass for styling. A simple CSS reset will be used to ensure consistent rendering across browsers.

## 4. Implementation Steps

### Step 1: Project Setup
*   Initialize a new React project using `create-react-app` or Vite.
*   Install the necessary dependencies:
    *   `react` and `react-dom` (included with project setup).
    *   A Markdown parsing library (e.g., `marked`).

### Step 2: Component Structure
The application will be built with a few key components:

*   **`App.js`:** The main container component that will manage the overall layout and state.
*   **`Editor.js`:** A component that contains the `textarea` for Markdown input. It will handle user input and pass the content up to the `App` component.
*   **`Viewer.js`:** A component that takes the Markdown text as a prop, uses the parsing library to convert it to HTML, and displays the result.

### Step 3: State Management
*   A single state variable, `markdownText`, will be held in the `App.js` component.
*   The `Editor` component will have a controlled `textarea` that updates `markdownText` via a callback function passed down from `App.js`.
*   The `Viewer` component will receive `markdownText` as a prop and re-render whenever it changes.

### Step 4: Markdown Parsing and Rendering
*   In the `Viewer` component, the `marked` library will be used to convert the `markdownText` prop into an HTML string.
*   To prevent XSS attacks, the generated HTML will be sanitized before being rendered. The `marked` library has options for this.
*   The sanitized HTML will be injected into a `div` using `dangerouslySetInnerHTML` or a similar method provided by the framework.

### Step 5: Styling
*   Create a simple two-column layout for the editor and viewer.
*   Apply basic styling to the `textarea` in the `Editor` for a better writing experience (e.g., monospaced font, appropriate padding).
*   Apply default styling to the rendered HTML in the `Viewer` to make headings, lists, code blocks, and other elements look clean and readable.

## 5. Future Enhancements (Optional)

*   **File Operations:** Add buttons to open `.md` files from the local filesystem and save the content of the editor to a new `.md` file.
*   **Syntax Highlighting:** Implement syntax highlighting in the editor for Markdown syntax.
*   **Toolbar:** Add a toolbar with buttons for common Markdown formatting (e.g., bold, italic, lists).
*   **Export to HTML/PDF:** Allow users to export the rendered content.
*   **Themes:** Add support for different editor and viewer themes (e.g., dark mode).
