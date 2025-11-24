import { useState } from 'react';

const Sidebar = ({ 
    files, 
    assets, 
    loading, 
    ignorePatterns, 
    currentFile,
    onFileSelect, 
    onInsertImage, 
    onRefresh, 
    onAddIgnore, 
    onRemoveIgnore,
    onOpenFolder
}) => {
  const [filter, setFilter] = useState('');
  const [newIgnore, setNewIgnore] = useState('');
  const [showIgnoreSettings, setShowIgnoreSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('files');

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(filter.toLowerCase())
  );
  const filteredAssets = assets.filter(f => 
    f.name.toLowerCase().includes(filter.toLowerCase())
  );

  const handleAddIgnoreSubmit = () => {
      if(newIgnore) {
          onAddIgnore(newIgnore);
          setNewIgnore('');
      }
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <button onClick={onOpenFolder} className="primary-btn full-width">
          📂 Open Folder
        </button>
      </div>

      {/* Always show search/tabs if we have items or just show generic empty state */}
      {(files.length > 0 || assets.length > 0 || loading) && (
        <>
            <div className="sidebar-tabs">
                <button 
                    className={activeTab === 'files' ? 'active' : ''} 
                    onClick={() => setActiveTab('files')}
                >
                    Files ({filteredFiles.length})
                </button>
                <button 
                    className={activeTab === 'assets' ? 'active' : ''} 
                    onClick={() => setActiveTab('assets')}
                >
                    Assets ({filteredAssets.length})
                </button>
            </div>

          <div className="sidebar-search">
            <input
              type="text"
              placeholder={activeTab === 'files' ? "Filter files..." : "Filter images..."}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>

          <div className="sidebar-actions">
            <button 
              className="text-btn"
              onClick={() => setShowIgnoreSettings(!showIgnoreSettings)}
            >
              {showIgnoreSettings ? 'Hide Settings' : '⚙️ Settings'}
            </button>
            <button className="text-btn" onClick={onRefresh}>🔄 Refresh</button>
          </div>

          {showIgnoreSettings && (
            <div className="ignore-settings">
              <h4>Ignore Patterns</h4>
              <div className="add-ignore">
                <input
                  type="text"
                  placeholder="e.g. draft"
                  value={newIgnore}
                  onChange={(e) => setNewIgnore(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddIgnoreSubmit()}
                />
                <button onClick={handleAddIgnoreSubmit}>+</button>
              </div>
              <div className="ignore-list">
                {ignorePatterns.map(pat => (
                  <span key={pat} className="ignore-tag">
                    {pat}
                    <button onClick={() => onRemoveIgnore(pat)}>×</button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="file-list">
            {loading ? (
              <div className="loading">Scanning...</div>
            ) : activeTab === 'files' ? (
                filteredFiles.map(file => (
                    <div
                    key={file.path}
                    className={`file-item ${currentFile?.path === file.path ? 'active' : ''}`}
                    onClick={() => onFileSelect(file)}
                    >
                    📄 {file.name}
                    </div>
                ))
            ) : (
                filteredAssets.map(file => (
                    <div
                    key={file.path}
                    className="file-item asset-item"
                    title="Click to insert markdown"
                    onClick={() => onInsertImage && onInsertImage(file)}
                    >
                    🖼️ {file.name}
                    </div>
                ))
            )}
            
            {!loading && ((activeTab === 'files' && filteredFiles.length === 0) || (activeTab === 'assets' && filteredAssets.length === 0)) && (
              <div className="empty-state">No items found</div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;
