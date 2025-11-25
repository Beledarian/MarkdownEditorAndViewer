import React, { useState, useEffect, useCallback, useMemo } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { Toaster, toast } from 'react-hot-toast';
import html2pdf from 'html2pdf.js';
import Sidebar from './components/Sidebar';
import SettingsModal from './components/SettingsModal';
import CheatSheetModal from './components/CheatSheetModal';
import Tooltip from './components/Tooltip';
import HighlightToolbar from './components/HighlightToolbar';
import CustomImage from './components/CustomImage';
import Toolbar from './components/Toolbar';
import StatusBar from './components/StatusBar';
import { scanDirectory, loadIgnoreFile, saveIgnoreFile } from './utils/fileSystem';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeExternalLinks from 'rehype-external-links';
import { saveDirectoryHandle, getDirectoryHandle } from './utils/storage';
import { loadAnnotations, saveAnnotations } from './utils/annotations';
import './App.css';
import './components/HighlightToolbar.css';
import cssContent from './App.css?raw';

const DEFAULT_SHORTCUTS = {
  save: 'Ctrl+S',
  openFolder: 'Ctrl+O',
  viewMode: 'Ctrl+Shift+V',
  sidebar: 'Ctrl+B',
  theme: 'Ctrl+Shift+T',
  html: 'Ctrl+Alt+H',
  pdf: 'Ctrl+Alt+P',
  copy: 'Ctrl+Shift+C',
  settings: 'Ctrl+,',
  zen: 'F11',
  zoomIn: 'Ctrl+=',
  zoomOut: 'Ctrl+-',
  resetZoom: 'Ctrl+0',
  timestamp: 'Ctrl+Alt+T',
  cheatsheet: 'Ctrl+/'
};

function App() {
  // --- Persistence ---
  const [theme, setTheme] = useState(() => localStorage.getItem('md-theme') || 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('md-sidebar');
    return saved ? JSON.parse(saved) : false; // Default closed
  });
  const [fontSize, setFontSize] = useState(() => parseInt(localStorage.getItem('md-fontsize') || '16'));
  const [wordGoal, setWordGoal] = useState(() => parseInt(localStorage.getItem('md-wordgoal') || '0'));

  // --- State ---
  const [markdown, setMarkdown] = useState('# Hello, world!');
  const [viewMode, setViewMode] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);

  // File System State
  const [dirHandle, setDirHandle] = useState(null);
  const [savedHandle, setSavedHandle] = useState(null);
  const [files, setFiles] = useState([]);
  const [assets, setAssets] = useState([]);
  const [ignorePatterns, setIgnorePatterns] = useState(['node_modules', '.git', 'dist', 'build']);
  const [fsLoading, setFsLoading] = useState(false);

  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState(() => Date.now());
  const [isSaving, setIsSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [zenMode, setZenMode] = useState(false);

  // Annotations - use a ref to track the current file path for annotations
  const [annotationsData, setAnnotationsData] = useState({ bookmarks: [], highlights: [] });
  const [selection, setSelection] = useState(null);
  const [showHighlightToolbar, setShowHighlightToolbar] = useState(false);

  const [shortcuts, setShortcuts] = useState(() => {
    const saved = localStorage.getItem('md-shortcuts');
    return saved ? JSON.parse(saved) : DEFAULT_SHORTCUTS;
  });

  // Load annotations when currentFile changes
  const annotations = useMemo(() => {
    if (currentFile) {
      return loadAnnotations(currentFile.path);
    }
    return { bookmarks: [], highlights: [] };
  }, [currentFile]);

  // --- Stats ---
  const wordCount = markdown.trim().split(/\s+/).filter(w => w).length;
  const charCount = markdown.length;
  const lineCount = markdown.split(/\n/).length;
  const readingTime = Math.ceil(wordCount / 200); // approx 200 wpm

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('md-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('md-sidebar', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  useEffect(() => {
    localStorage.setItem('md-fontsize', fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('md-wordgoal', wordGoal.toString());
  }, [wordGoal]);

  // Check for saved directory handle on mount
  useEffect(() => {
    const checkSaved = async () => {
      try {
        const handle = await getDirectoryHandle();
        if (handle) setSavedHandle(handle);
      } catch (e) {
        console.error("Error checking saved handle", e);
      }
    };
    checkSaved();
  }, []);

  // Save annotations when they change
  useEffect(() => {
    if (currentFile) {
      saveAnnotations(currentFile.path, annotationsData);
    }
  }, [annotationsData, currentFile]);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection.toString().trim() !== '') {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelection({
        range,
        rect,
        text: selection.toString()
      });
      setShowHighlightToolbar(true);
    } else {
      setShowHighlightToolbar(false);
    }
  };

  const getPathTo = useCallback((element) => {
    if (element.id === 'preview') return 'preview';
    if (!element.parentElement) return null;

    let path = [];
    let child = element;
    while (child.parentElement && child.id !== 'preview') {
      let sibling = child;
      let count = 1;
      while (sibling.previousElementSibling) {
        sibling = sibling.previousElementSibling;
        count++;
      }
      path.unshift(`${child.tagName}:nth-child(${count})`);
      child = child.parentElement;
    }
    return path.join(' > ');
  }, []);

  const handleHighlight = useCallback(() => {
    if (selection) {
      const { range, text } = selection;
      const id = `highlight-${crypto.randomUUID()}`;

      const startContainer = range.startContainer;
      const endContainer = range.endContainer;

      const startContainerPath = getPathTo(startContainer);
      const endContainerPath = getPathTo(endContainer);

      const newHighlight = {
        id,
        text,
        startContainerPath,
        endContainerPath,
        startOffset: range.startOffset,
        endOffset: range.endOffset,
      };

      setAnnotationsData(prev => ({
        ...prev,
        highlights: [...prev.highlights, newHighlight]
      }));

      // Clear selection and hide toolbar
      window.getSelection().removeAllRanges();
      setShowHighlightToolbar(false);
    }
  }, [selection, getPathTo]);

  // Auto-save logic
  useEffect(() => {
    if (!autoSaveEnabled || !currentFile || !currentFile.handle) return;

    const timer = setTimeout(async () => {
      if (Date.now() - lastSaved > 2000) {
        setIsSaving(true);
        try {
          const writable = await currentFile.handle.createWritable();
          await writable.write(markdown);
          await writable.close();
          setLastSaved(Date.now());
        } catch (e) {
          console.error("Auto-save failed", e);
        }
        setIsSaving(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [markdown, autoSaveEnabled, currentFile, lastSaved]);

  // --- Handlers ---

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const handleFileSystemRefresh = useCallback(async () => {
    if (!dirHandle) return;
    setFsLoading(true);
    const { mdFiles, assetFiles } = await scanDirectory(dirHandle, ignorePatterns);
    setFiles(mdFiles);
    setAssets(assetFiles);
    setFsLoading(false);
  }, [dirHandle, ignorePatterns]);

  const loadDirectory = async (handle) => {
    setDirHandle(handle);
    setFsLoading(true);

    const loadedPatterns = await loadIgnoreFile(handle);
    setIgnorePatterns(loadedPatterns);

    const { mdFiles, assetFiles } = await scanDirectory(handle, loadedPatterns);
    setFiles(mdFiles);
    setAssets(assetFiles);
    setFsLoading(false);

    setSidebarOpen(true);
  };

  const handleOpenFolder = async () => {
    try {
      const handle = await window.showDirectoryPicker();
      await loadDirectory(handle);
      await saveDirectoryHandle(handle);
      setSavedHandle(handle);
      toast.success('Folder opened!');
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error(err);
        toast.error('Failed to open folder.');
      }
      setFsLoading(false);
    }
  };

  const handleRestoreFolder = async () => {
    if (!savedHandle) return;

    // Verify permission
    try {
      // Try to query first
      let perm = await savedHandle.queryPermission({ mode: 'read' });

      if (perm !== 'granted') {
        perm = await savedHandle.requestPermission({ mode: 'read' });
      }

      if (perm === 'granted') {
        await loadDirectory(savedHandle);
        toast.success('Session restored!');
      } else {
        toast('Permission needed to access folder.');
      }
    } catch (e) {
      console.error("Failed to restore", e);
      toast.error("Could not restore folder");
    }
  };

  const handleAddIgnore = async (pattern) => {
    const updated = [...ignorePatterns, pattern];
    setIgnorePatterns(updated);
    await saveIgnoreFile(updated, dirHandle);
    handleFileSystemRefresh();
  };

  const handleRemoveIgnore = async (pattern) => {
    const updated = ignorePatterns.filter(p => p !== pattern);
    setIgnorePatterns(updated);
    await saveIgnoreFile(updated, dirHandle);
    handleFileSystemRefresh();
  };

  const handleFileSelect = async (fileObj) => {
    try {
      const file = await fileObj.handle.getFile();
      const text = await file.text();
      setMarkdown(text);
      setCurrentFile(fileObj);
      setLastSaved(Date.now());
    } catch (err) {
      console.error(err);
      toast.error('Error reading file');
    }
  };

  const handleInsertImage = (asset) => {
    const imageMarkdown = `![${asset.name}](${asset.name})`;
    setMarkdown(prev => prev + '\n' + imageMarkdown);
    toast.success('Image inserted!');
  };

  const handleInsertTimestamp = () => {
    const ts = new Date().toISOString();
    setMarkdown(prev => prev + `\n> ${ts}\n`);
  };

  const applyColor = (color) => {
    const editor = document.querySelector('.w-md-editor-text-input');
    if (editor) {
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const selectedText = markdown.substring(start, end);
      const newText = `<span style="color:${color}">${selectedText}</span>`;
      setMarkdown(markdown.substring(0, start) + newText + markdown.substring(end));
    }
  };

  const handleColorChange = (colorOrEvent) => {
    const color = colorOrEvent?.target?.value || colorOrEvent;
    applyColor(color);
  };

  const handleSaveFile = useCallback(async () => {
    if (currentFile && currentFile.handle) {
      try {
        const writable = await currentFile.handle.createWritable();
        await writable.write(markdown);
        await writable.close();
        toast.success('File Saved!');
        setLastSaved(Date.now());
        return;
      } catch (e) {
        console.error('Save failed', e);
      }
    }

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile ? currentFile.name : 'markdown.md';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('File Downloaded!');
  }, [currentFile, markdown]);

  const handleExportHTML = useCallback(() => {
    const previewElement = document.getElementById('preview');
    if (previewElement) {
      const htmlContent = previewElement.innerHTML;
      const fullHtml = `
        <!DOCTYPE html>
        <html data-theme="${theme}">
          <head>
            <title>Markdown Preview</title>
            <style>
              ${cssContent}
              body {
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background-color: var(--bg-color);
                color: var(--text-color);
                font-family: var(--font-family);
              }
              .preview {
                width: 80%;
                max-width: 800px;
                background-color: var(--modal-bg);
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
              }
              img { max-width: 100%; }
            </style>
          </head>
          <body>
            <div class="preview">${htmlContent}</div>
          </body>
        </html>
      `;
      const blob = new Blob([fullHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'markdown.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [theme]);

  const handleExportPDF = useCallback(() => {
    const previewElement = document.getElementById('preview');
    if (previewElement) {
      previewElement.classList.add('pdf-export');

      const content = previewElement.cloneNode(true);
      content.style.width = '100%';
      content.style.height = '100%';

      const opt = {
        margin: 0.5,
        filename: 'markdown.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      html2pdf().from(content).set(opt).save().then(() => {
        previewElement.classList.remove('pdf-export');
      });
    }
  }, []);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(markdown).then(() => {
      toast.success('Copied to clipboard!');
    });
  }, [markdown]);

  // --- Drag and Drop ---
  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const items = [...e.dataTransfer.items];
    for (let item of items) {
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file.type.startsWith('image/')) {
          // If we have a dirHandle, technically we can't easily save *into* it without user permission per file in some browsers,
          // but standard File System Access API allows getting a file handle from dir handle and writing.

          if (dirHandle) {
            try {
              // Create assets folder if not exists?
              // For simplicity, save to root or current location?
              // Let's save to 'assets' folder if it exists, else root.
              let targetHandle = dirHandle;
              try {
                targetHandle = await dirHandle.getDirectoryHandle('assets', { create: true });
              } catch { /* fallback to root */ }

              const fileHandle = await targetHandle.getFileHandle(file.name, { create: true });
              const writable = await fileHandle.createWritable();
              await writable.write(file);
              await writable.close();

              toast.success(`Saved ${file.name}`);
              handleFileSystemRefresh();

              // Insert Markdown
              const relPath = targetHandle.name === 'assets' ? `assets/${file.name}` : file.name;
              setMarkdown(prev => prev + `\n![${file.name}](${relPath})\n`);

            } catch (err) {
              console.error("Failed to save dropped file", err);
              // Fallback to data URI
              const reader = new FileReader();
              reader.onload = (ev) => {
                setMarkdown(prev => prev + `\n![${file.name}](${ev.target.result})\n`);
              };
              reader.readAsDataURL(file);
            }
          } else {
            // No folder open, use Data URI
            const reader = new FileReader();
            reader.onload = (ev) => {
              setMarkdown(prev => prev + `\n![${file.name}](${ev.target.result})\n`);
            };
            reader.readAsDataURL(file);
          }
        } else if (file.name.endsWith('.md')) {
          // Open the dropped markdown file
          const text = await file.text();
          setMarkdown(text);
          setCurrentFile({ name: file.name, path: 'dropped-file' });
        }
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };


  // Global Shortcut Handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      const match = (shortcutKey) => {
        if (!shortcuts[shortcutKey]) return false;
        const parts = shortcuts[shortcutKey].toUpperCase().split('+');
        const key = parts.pop();

        // Special case for Function keys
        let eventKey = e.key.toUpperCase();
        if (eventKey === 'CONTROL') return false;
        if (eventKey === 'ALT') return false;
        if (eventKey === 'SHIFT') return false;

        // F11 etc
        const codeMatches = eventKey === key || e.code.toUpperCase() === `KEY${key}` || e.code.toUpperCase() === key;

        const ctrlMatches = parts.includes('CTRL') === e.ctrlKey;
        const shiftMatches = parts.includes('SHIFT') === e.shiftKey;
        const altMatches = parts.includes('ALT') === e.altKey;

        return codeMatches && ctrlMatches && shiftMatches && altMatches;
      };

      if (match('save')) { e.preventDefault(); handleSaveFile(); }
      else if (match('viewMode')) { e.preventDefault(); setViewMode(prev => !prev); }
      else if (match('sidebar')) { e.preventDefault(); setSidebarOpen(prev => !prev); }
      else if (match('theme')) { e.preventDefault(); toggleTheme(); }
      else if (match('html')) { e.preventDefault(); handleExportHTML(); }
      else if (match('pdf')) { e.preventDefault(); handleExportPDF(); }
      else if (match('copy')) { e.preventDefault(); copyToClipboard(); }
      else if (match('settings')) { e.preventDefault(); setShowSettings(prev => !prev); }
      else if (match('zen')) { e.preventDefault(); setZenMode(prev => !prev); }
      else if (match('zoomIn')) { e.preventDefault(); setFontSize(prev => Math.min(prev + 2, 32)); }
      else if (match('zoomOut')) { e.preventDefault(); setFontSize(prev => Math.max(prev - 2, 10)); }
      else if (match('resetZoom')) { e.preventDefault(); setFontSize(16); }
      else if (match('timestamp')) { e.preventDefault(); handleInsertTimestamp(); }
      else if (match('cheatsheet')) { e.preventDefault(); setShowCheatSheet(prev => !prev); }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, handleSaveFile, handleExportHTML, handleExportPDF, copyToClipboard, toggleTheme]);

  const updateShortcut = (action, newCombo) => {
    const newShortcuts = { ...shortcuts, [action]: newCombo };
    setShortcuts(newShortcuts);
    localStorage.setItem('md-shortcuts', JSON.stringify(newShortcuts));
  };

  const components = useMemo(() => ({
    img: (props) => <CustomImage {...props} assets={assets} currentFilePath={currentFile?.path} />
  }), [assets, currentFile]);

  useEffect(() => {
    const preview = document.getElementById('preview');
    if (!preview) return;

    // A basic way to clear highlights before re-rendering
    const existingHighlights = preview.querySelectorAll('.highlight');
    existingHighlights.forEach(span => {
      if (span.parentNode) {
        span.parentNode.replaceChild(document.createTextNode(span.textContent), span);
      }
    });


    if (annotations.highlights.length > 0) {
      annotations.highlights.forEach(h => {
        try {
          const startContainer = document.querySelector(`#preview ${h.startContainerPath}`);
          const endContainer = document.querySelector(`#preview ${h.endContainerPath}`);

          if (startContainer && endContainer) {
            const range = document.createRange();
            range.setStart(startContainer.firstChild || startContainer, h.startOffset);
            range.setEnd(endContainer.firstChild || endContainer, h.endOffset);

            const highlightSpan = document.createElement('span');
            highlightSpan.className = 'highlight';
            highlightSpan.id = h.id;

            range.surroundContents(highlightSpan);
          }
        } catch (e) {
          console.error("Failed to render highlight", h, e);
        }
      });
    }
  }, [markdown, annotations.highlights]);

  const handleFileLoad = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setMarkdown(ev.target.result);
        setCurrentFile({ name: file.name, path: 'single-file' });
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className={`app ${zenMode ? 'zen-mode' : ''}`} data-color-mode={theme} data-theme={theme}>
      <Toaster />
      {showHighlightToolbar && selection && (
        <HighlightToolbar
          top={selection.rect.top - 40}
          left={selection.rect.left + (selection.rect.width / 2)}
          onHighlight={handleHighlight}
        />
      )}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        shortcuts={shortcuts}
        onUpdateShortcut={updateShortcut}
        wordGoal={wordGoal}
        setWordGoal={setWordGoal}
      />
      <CheatSheetModal
        isOpen={showCheatSheet}
        onClose={() => setShowCheatSheet(false)}
      />

      <Toolbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        savedHandle={savedHandle}
        dirHandle={dirHandle}
        handleRestoreFolder={handleRestoreFolder}
        handleSaveFile={handleSaveFile}
        handleExportHTML={handleExportHTML}
        handleExportPDF={handleExportPDF}
        copyToClipboard={copyToClipboard}
        handleColorChange={handleColorChange}
        viewMode={viewMode}
        setViewMode={setViewMode}
        theme={theme}
        toggleTheme={toggleTheme}
        setShowSettings={setShowSettings}
        setShowCheatSheet={setShowCheatSheet}
        zenMode={zenMode}
        setZenMode={setZenMode}
        fontSize={fontSize}
        setFontSize={setFontSize}
        autoSaveEnabled={autoSaveEnabled}
        setAutoSaveEnabled={setAutoSaveEnabled}
        shortcuts={shortcuts}
        onFileLoad={handleFileLoad}
      />

      <div className="main-area" onDrop={handleDrop} onDragOver={handleDragOver} style={{ fontSize: `${fontSize}px` }}>
        {sidebarOpen && (
          <Sidebar
            files={files}
            assets={assets}
            loading={fsLoading}
            ignorePatterns={ignorePatterns}
            currentFile={currentFile}
            onFileSelect={handleFileSelect}
            onInsertImage={handleInsertImage}
            onRefresh={handleFileSystemRefresh}
            onAddIgnore={handleAddIgnore}
            onRemoveIgnore={handleRemoveIgnore}
            onOpenFolder={handleOpenFolder}
          />
        )}

        <div className="editor-container" style={{ gridTemplateColumns: viewMode ? '1fr' : '1fr 1fr' }}>
          {!viewMode && (
            <MDEditor
              value={markdown}
              onChange={(val) => {
                setMarkdown(val);
              }}
              height="100%"
              visibleDragbar={false}
              enableScroll={true}
              preview="edit" // We handle preview separately in right pane
            />
          )}
          <div id="preview" onMouseUp={handleMouseUp} style={{ overflow: 'auto', padding: viewMode ? '20px' : '20px', height: '100%' }}>
            <MDEditor.Markdown
              source={markdown}
              components={components}
              rehypePlugins={[
                rehypeRaw,
                rehypeSanitize,
                [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }]
              ]}
              style={{ whiteSpace: 'pre-wrap', backgroundColor: 'transparent', minHeight: '100%' }}
            />
          </div>
        </div>
      </div>

      <StatusBar
        currentFile={currentFile}
        isSaving={isSaving}
        lineCount={lineCount}
        wordCount={wordCount}
        wordGoal={wordGoal}
        charCount={charCount}
        readingTime={readingTime}
        handleInsertTimestamp={handleInsertTimestamp}
        shortcuts={shortcuts}
      />
    </div>
  );
}

export default App;