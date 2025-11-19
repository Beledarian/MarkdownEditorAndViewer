import { useState, useEffect } from 'react';

const SettingsModal = ({ isOpen, onClose, shortcuts, onUpdateShortcut, wordGoal, setWordGoal }) => {
  if (!isOpen) return null;

  const handleKeyDown = (e, action) => {
    e.preventDefault();
    e.stopPropagation();

    const keys = [];
    if (e.ctrlKey) keys.push('Ctrl');
    if (e.altKey) keys.push('Alt');
    if (e.shiftKey) keys.push('Shift');
    if (e.metaKey) keys.push('Meta');

    // Ignore modifier-only presses
    if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return;

    let key = e.key.toUpperCase();
    if (key === ' ') key = 'SPACE';
    
    keys.push(key);
    
    const combo = keys.join('+');
    onUpdateShortcut(action, combo);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Settings</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <div className="modal-body" style={{maxHeight: '60vh', overflowY: 'auto'}}>
          
          <div style={{marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid rgba(0,0,0,0.1)'}}>
              <h3>Goals</h3>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <label>Daily Word Goal (0 to disable):</label>
                  <input 
                      type="number" 
                      min="0" 
                      value={wordGoal || 0} 
                      onChange={(e) => setWordGoal(parseInt(e.target.value) || 0)}
                      style={{padding: '5px', width: '80px'}}
                  />
              </div>
          </div>

          <h3>Keyboard Shortcuts</h3>
          <div className="shortcut-list">
            {Object.entries(shortcuts).map(([action, combo]) => (
              <div key={action} className="shortcut-item">
                <label>{action.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label>
                <input
                  type="text"
                  value={combo}
                  readOnly
                  onKeyDown={(e) => handleKeyDown(e, action)}
                  placeholder="Click to record shortcut"
                  className="shortcut-input"
                  title="Click and press keys to record new shortcut"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
            <p className="hint">Click an input field and press the desired key combination.</p>
          <button onClick={onClose} className="primary-btn">Done</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
