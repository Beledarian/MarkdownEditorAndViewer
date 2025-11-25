import React from 'react';
import Tooltip from './Tooltip';
import ColorPicker from './ColorPicker';

const Toolbar = ({
    sidebarOpen,
    setSidebarOpen,
    savedHandle,
    dirHandle,
    handleRestoreFolder,
    handleSaveFile,
    handleExportHTML,
    handleExportPDF,
    copyToClipboard,
    handleColorChange,
    viewMode,
    setViewMode,
    theme,
    toggleTheme,
    setShowSettings,
    setShowCheatSheet,
    zenMode,
    setZenMode,
    fontSize,
    setFontSize,
    autoSaveEnabled,
    setAutoSaveEnabled,
    shortcuts,
    onFileLoad
}) => {
    return (
        <div className="top-bar">
            <Tooltip text="Toggle Sidebar" shortcut={shortcuts.sidebar}>
                <button onClick={() => setSidebarOpen(!sidebarOpen)}>
                    {sidebarOpen ? 'Hide Menu' : 'Show Menu'}
                </button>
            </Tooltip>

            <div className="button-container">
                {savedHandle && !dirHandle && (
                    <button
                        onClick={handleRestoreFolder}
                        style={{ borderColor: '#4caf50', color: '#4caf50' }}
                    >
                        Restore "{savedHandle.name}"
                    </button>
                )}

                {/* Fallback File Input */}
                <input
                    type="file"
                    accept=".md"
                    onChange={onFileLoad}
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

                <ColorPicker onColorSelect={handleColorChange} />

                <Tooltip text="Toggle View Mode" shortcut={shortcuts.viewMode}>
                    <button onClick={() => setViewMode(!viewMode)}>
                        {viewMode ? 'Edit' : 'View'}
                    </button>
                </Tooltip>

                <Tooltip text="Toggle Theme" shortcut={shortcuts.theme}>
                    <button onClick={toggleTheme} aria-label="Toggle Theme">
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                </Tooltip>

                <Tooltip text="Settings" shortcut={shortcuts.settings}>
                    <button onClick={() => setShowSettings(true)} className="text-btn" style={{ fontSize: '16px' }} aria-label="Settings">
                        ⚙️
                    </button>
                </Tooltip>

                <Tooltip text="Cheat Sheet" shortcut={shortcuts.cheatsheet}>
                    <button onClick={() => setShowCheatSheet(true)} className="text-btn" style={{ fontSize: '16px' }} aria-label="Markdown Cheat Sheet">
                        ?
                    </button>
                </Tooltip>

                <Tooltip text="Zen Mode" shortcut={shortcuts.zen}>
                    <button onClick={() => setZenMode(!zenMode)} className="text-btn">
                        Zen
                    </button>
                </Tooltip>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '10px', fontSize: '12px' }}>
                    <button className="text-btn" onClick={() => setFontSize(s => s - 1)} aria-label="Decrease Font Size">-</button>
                    <span>{fontSize}px</span>
                    <button className="text-btn" onClick={() => setFontSize(s => s + 1)} aria-label="Increase Font Size">+</button>
                </div>

                <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '10px' }}>
                    <input type="checkbox" checked={autoSaveEnabled} onChange={(e) => setAutoSaveEnabled(e.target.checked)} />
                    Auto-save
                </label>
            </div>
        </div>
    );
};

export default Toolbar;
