import { useState } from 'react';

import { Virtuoso } from 'react-virtuoso';

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

  const filteredFiles = files.filter(f => {
    try {
      if (filter.startsWith('/')) {
        // Regex mode
        const regex = new RegExp(filter.slice(1), 'i');
        return regex.test(f.name);
      }
      // Fuzzy mode
      const search = filter.toLowerCase();
      const name = f.name.toLowerCase();
      let i = 0, j = 0;
      while (i < name.length && j < search.length) {
        if (name[i] === search[j]) j++;
        i++;
      }
      return j === search.length;
    } catch {
      return f.name.toLowerCase().includes(filter.toLowerCase());
    }
  });

  const filteredAssets = assets.filter(f => {
    try {
      if (filter.startsWith('/')) {
        const regex = new RegExp(filter.slice(1), 'i');
        return regex.test(f.name);
      }
      const search = filter.toLowerCase();
      const name = f.name.toLowerCase();
      let i = 0, j = 0;
      while (i < name.length && j < search.length) {
        if (name[i] === search[j]) j++;
        i++;
      }
      return j === search.length;
    } catch {
      return f.name.toLowerCase().includes(filter.toLowerCase());
    }
  });

  const items = activeTab === 'files' ? filteredFiles : filteredAssets;

  const handleAddIgnoreSubmit = () => {
    if (newIgnore) {
      onAddIgnore(newIgnore);
      setNewIgnore('');
    }
  }

  const Row = (index) => {
    const item = items[index];
    if (activeTab === 'files') {
      return (
        <div
          className={`file-item ${currentFile?.path === item.path ? 'active' : ''}`}
          onClick={() => onFileSelect(item)}
        >
          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            📄 {item.name}
          </div>
        </div>
      );
    } else {
      return (
        <div
          className="file-item asset-item"
          title="Click to insert markdown"
          onClick={() => onInsertImage && onInsertImage(item)}
        >
          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            🖼️ {item.name}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <button onClick={onOpenFolder} className="primary-btn full-width">
          📂 Open Folder
        </button>
      </div>

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
                <button onClick={handleAddIgnoreSubmit} aria-label="Add Ignore Pattern">+</button>
              </div>
              <div className="ignore-list">
                {ignorePatterns.map(pat => (
                  <span key={pat} className="ignore-tag">
                    {pat}
                    <button onClick={() => onRemoveIgnore(pat)} aria-label="Remove Ignore Pattern">×</button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="file-list">
            {loading ? (
              <div className="loading">Scanning...</div>
            ) : items.length > 0 ? (
              <Virtuoso
                style={{ height: '100%' }}
                totalCount={items.length}
                itemContent={Row}
              />
            ) : (
              <div className="empty-state">No items found</div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;
