# Markdown Editor and Viewer Documentation

This document provides a comprehensive guide to all the features of the Markdown Editor and Viewer.

## File Management

### Opening a Folder

To open a folder and view its files in the sidebar, you can either:
- Click the "Open Folder" button.
- Use the `Ctrl+O` shortcut.

This will open a dialog where you can select a folder from your local file system.

### Saving a File

To save the currently opened file, you can:
- Click the "💾 Save" button.
- Use the `Ctrl+S` shortcut.

If you haven't opened a file, this will download the current content as a new markdown file.

### Auto-save

The editor has an auto-save feature that is enabled by default. It automatically saves your work every 2 seconds after you stop typing. You can disable this feature by unchecking the "Auto-save" checkbox in the top bar.

## Editing

The editor provides a simple and intuitive interface for writing in Markdown. It supports all standard Markdown syntax.

## Preview

The live preview pane on the right side of the editor renders your Markdown as HTML in real-time.

## Colored Text

You can add colored text to your document by using inline HTML `<span>` tags with a `style` attribute.

For example, to create red text, you can write:
```html
<span style="color:red">This text will be red.</span>
```

You can use any valid CSS color, including hex codes, RGB values, and color names.

## Exporting

### Export to HTML

To export your document as an HTML file, you can:
- Click the "html" button.
- Use the `Ctrl+Alt+H` shortcut.

### Export to PDF

To export your document as a PDF file, you can:
- Click the "pdf" button.
- Use the `Ctrl+Alt+P` shortcut.

The exported PDF will have black text and is optimized for printing.

## Keyboard Shortcuts

| Action | Shortcut |
| --- | --- |
| Save File | `Ctrl+S` |
| Open Folder | `Ctrl+O` |
| Toggle View Mode | `Ctrl+Shift+V` |
| Toggle Sidebar | `Ctrl+B` |
| Toggle Theme | `Ctrl+Shift+T` |
| Export to HTML | `Ctrl+Alt+H` |
| Export to PDF | `Ctrl+Alt+P` |
| Copy Markdown | `Ctrl+Shift+C` |
| Open Settings | `Ctrl+,` |
| Zen Mode | `F11` |
| Zoom In | `Ctrl+=` |
| Zoom Out | `Ctrl+-` |
| Reset Zoom | `Ctrl+0` |
| Insert Timestamp | `Ctrl+Alt+T` |
| Show Cheatsheet | `Ctrl+/` |

## Settings

You can customize the editor's settings by clicking the "⚙️" button or using the `Ctrl+,` shortcut. In the settings modal, you can:
- Change the keyboard shortcuts.
- Set a word count goal.
