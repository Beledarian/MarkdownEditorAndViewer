import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import MDEditor from '@uiw/react-md-editor';
import remarkGfm from 'remark-gfm';
import '@uiw/react-md-editor/markdown-editor.css';
import html2pdf from 'html2pdf.js';
import { Toaster, toast } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Tooltip from './components/Tooltip';
import SettingsModal from './components/SettingsModal';
import CheatSheetModal from './components/CheatSheetModal';
import { scanDirectory, loadIgnoreFile, saveIgnoreFile } from './utils/fileSystem';
import './App.css';
import cssContent from './App.css?raw';

// Custom Image Component to handle local file blobs
const CustomImage = ({ src, alt, assets, currentFilePath }) => {
    const [imgSrc, setImgSrc] = useState(src);

    useEffect(() => {
        let isMounted = true;
        const loadLocalImage = async () => {
            if (src && !src.match(/^(http|https|data):/)) {
                let asset = null;
                // 1. Try exact path match (absolute path from project root)
                asset = assets.find(a => a.path === src);

                // 2. Try relative to current file
                if (!asset && currentFilePath) {
                     const currentDir = currentFilePath.includes('/') 
                        ? currentFilePath.substring(0, currentFilePath.lastIndexOf('/')) 
                        : '';
                     
                     let potentialPath = currentDir ? `${currentDir}/${src}` : src;
                     potentialPath = potentialPath.replace(/\/\.\//g, '/');
                     
                     asset = assets.find(a => a.path === potentialPath);
                }

                // 3. Fallback: match by filename (lazy mode)
                if (!asset) {
                    const cleanName = src.replace(/^.*[\\\/]/, '');
                    asset = assets.find(a => a.name === cleanName);
                }
                
                if (asset && asset.handle) {
                    try {
                        const file = await asset.handle.getFile();
                        const url = URL.createObjectURL(file);
                        if (isMounted) setImgSrc(url);
                        return () => URL.revokeObjectURL(url);
                    } catch (e) {
                        console.error("Failed to load image asset", e);
                    }
                }
            }
        };
        loadLocalImage();
        return () => { isMounted = false; };
    }, [src, assets, currentFilePath]);

    return <img src={imgSrc} alt={alt} style={{ maxWidth: '100%' }} />;
};

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
  const [files, setFiles] = useState([]);
  const [assets, setAssets] = useState([]);
  const [ignorePatterns, setIgnorePatterns] = useState(['node_modules', '.git', 'dist', 'build']);
  const [fsLoading, setFsLoading] = useState(false);

  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState(Date.now());
  const [isSaving, setIsSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [zenMode, setZenMode] = useState(false);

  const [shortcuts, setShortcuts] = useState(() => {
      const saved = localStorage.getItem('md-shortcuts');
      return saved ? JSON.parse(saved) : DEFAULT_SHORTCUTS;
  });

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

  const handleOpenFolder = async () => {
    try {
      const handle = await window.showDirectoryPicker();
      setDirHandle(handle);
      setFsLoading(true);
      
      const loadedPatterns = await loadIgnoreFile(handle);
      setIgnorePatterns(loadedPatterns);

      const { mdFiles, assetFiles } = await scanDirectory(handle, loadedPatterns);
      setFiles(mdFiles);
      setAssets(assetFiles);
      setFsLoading(false);
      
      setSidebarOpen(true); // Auto open sidebar when folder loaded
      toast.success('Folder opened!');
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error(err);
        toast.error('Failed to open folder.');
      }
      setFsLoading(false);
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
        <html>
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
                background-color: ${theme === 'dark' ? '#2c3e50' : '#ecf0f1'};
                color: ${theme === 'dark' ? '#ecf0f1' : '#2c3e50'};
                font-family: sans-serif;
              }
              .preview {
                width: 80%;
                max-width: 800px;
                background-color: ${theme === 'dark' ? '#34495e' : '#ffffff'};
                padding: 20px;
                border-radius: 5px;
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
      const opt = {
        margin:       1,
        filename:     'markdown.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      html2pdf().from(previewElement).set(opt).save();
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
                          } catch (e) { /* fallback to root */ }
                          
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

  return (
    <div className={`app ${zenMode ? 'zen-mode' : ''}`} data-color-mode={theme} data-theme={theme}>
      <Toaster />
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

      <div className="top-bar">
         <Tooltip text="Toggle Sidebar" shortcut={shortcuts.sidebar}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? 'Hide Menu' : 'Show Menu'}
            </button>
         </Tooltip>

        <div className="button-container">
             {/* Fallback File Input */}
            <input
                type="file"
                accept=".md"
                onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                            setMarkdown(ev.target.result);
                            setCurrentFile({ name: file.name, path: 'single-file' });
                        };
                        reader.readAsText(file);
                    }
                }}
                style={{ display: 'none' }}
                id="file-input"
            />
            
            <Tooltip text="Save File" shortcut={shortcuts.save}>
                <button onClick={handleSaveFile}>💾 Save</button>
            </Tooltip>

            <Tooltip text="Export HTML" shortcut={shortcuts.html}>
                <button onClick={handleExportHTML}>html</button>
            </Tooltip>
            
            <Tooltip text="Export PDF" shortcut={shortcuts.pdf}>
                <button onClick={handleExportPDF}>pdf</button>
            </Tooltip>
            
            <Tooltip text="Copy Markdown" shortcut={shortcuts.copy}>
                <button onClick={copyToClipboard}>Copy</button>
            </Tooltip>
            
            <Tooltip text="Toggle View Mode" shortcut={shortcuts.viewMode}>
                <button onClick={() => setViewMode(!viewMode)}>
                    {viewMode ? 'Edit' : 'View'}
                </button>
            </Tooltip>

            <Tooltip text="Toggle Theme" shortcut={shortcuts.theme}>
                <button onClick={toggleTheme}>
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>
            </Tooltip>

            <Tooltip text="Settings" shortcut={shortcuts.settings}>
                <button onClick={() => setShowSettings(true)} className="text-btn" style={{fontSize: '16px'}}>
                    ⚙️
                </button>
            </Tooltip>
            
            <Tooltip text="Cheat Sheet" shortcut={shortcuts.cheatsheet}>
                <button onClick={() => setShowCheatSheet(true)} className="text-btn" style={{fontSize: '16px'}}>
                    ?
                </button>
            </Tooltip>

             <Tooltip text="Zen Mode" shortcut={shortcuts.zen}>
                <button onClick={() => setZenMode(!zenMode)} className="text-btn">
                    Zen
                </button>
            </Tooltip>
            
            <div style={{display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '10px', fontSize: '12px'}}>
                 <button className="text-btn" onClick={() => setFontSize(s => s-1)}>-</button>
                 <span>{fontSize}px</span>
                 <button className="text-btn" onClick={() => setFontSize(s => s+1)}>+</button>
            </div>

            <label style={{fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '10px'}}>
                <input type="checkbox" checked={autoSaveEnabled} onChange={(e) => setAutoSaveEnabled(e.target.checked)} />
                Auto-save
            </label>
        </div>
      </div>

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
            <div id="preview" style={{ overflow: 'auto', padding: viewMode ? '20px' : '20px', height: '100%' }}>
            <MDEditor.Markdown
                source={markdown}
                components={components}
                remarkPlugins={[remarkGfm]}
                style={{ whiteSpace: 'pre-wrap', backgroundColor: 'transparent', minHeight: '100%' }}
            />
            </div>
        </div>
      </div>
      <div className="status-bar">
          <div className="status-item">
            {currentFile ? `File: ${currentFile.name}` : 'Unsaved Draft'} 
            {isSaving && ' (Saving...)'}
          </div>
          <div style={{display: 'flex', gap: '15px'}}>
            <div className="status-item">Ln {lineCount}</div>
            <div className="status-item">
                Words: {wordCount}
                {wordGoal > 0 && (
                    <span style={{
                        marginLeft: '5px', 
                        color: wordCount >= wordGoal ? '#4caf50' : 'inherit', 
                        fontWeight: wordCount >= wordGoal ? 'bold' : 'normal'
                    }}>
                        / {wordGoal}
                    </span>
                )}
            </div>
            <div className="status-item">Chars: {charCount}</div>
            <div className="status-item">Read: ~{readingTime} min</div>
            <Tooltip text="Insert Timestamp" shortcut={shortcuts.timestamp}>
                 <button className="text-btn" onClick={handleInsertTimestamp} style={{padding: 0}}>🕒</button>
            </Tooltip>
          </div>
      </div>
    </div>
  );
}

export default App;