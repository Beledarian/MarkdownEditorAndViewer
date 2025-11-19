import React from 'react';

const CheatSheetModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const cheatSheetData = [
    { syntax: '# Heading 1', description: 'Big Header' },
    { syntax: '## Heading 2', description: 'Medium Header' },
    { syntax: '**Bold**', description: 'Bold Text' },
    { syntax: '*Italic*', description: 'Italic Text' },
    { syntax: '[Link](http://...)', description: 'Hyperlink' },
    { syntax: '![Alt](img.png)', description: 'Image' },
    { syntax: '> Blockquote', description: 'Blockquote' },
    { syntax: '`Code`', description: 'Inline Code' },
    { syntax: '```\nCode Block\n```', description: 'Code Block' },
    { syntax: '- List Item', description: 'Unordered List' },
    { syntax: '1. List Item', description: 'Ordered List' },
    { syntax: '- [ ] Task', description: 'Task List' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Markdown Cheat Sheet</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <div className="modal-body">
           <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '0.9em'}}>
               <thead>
                   <tr style={{textAlign: 'left', borderBottom: '1px solid var(--border-color)'}}>
                       <th style={{padding: '8px'}}>Syntax</th>
                       <th style={{padding: '8px'}}>Description</th>
                   </tr>
               </thead>
               <tbody>
                   {cheatSheetData.map((item, index) => (
                       <tr key={index} style={{borderBottom: '1px solid rgba(0,0,0,0.1)'}}>
                           <td style={{padding: '8px', fontFamily: 'monospace', color: 'var(--button-bg-color)'}}>{item.syntax}</td>
                           <td style={{padding: '8px'}}>{item.description}</td>
                       </tr>
                   ))}
               </tbody>
           </table>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="primary-btn">Close</button>
        </div>
      </div>
    </div>
  );
};

export default CheatSheetModal;
