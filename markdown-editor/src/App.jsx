import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './App.css';

function App() {
  const [markdown, setMarkdown] = useState('# Hello, world!');
  const [showEditor, setShowEditor] = useState(false);

  const handleOpenFile = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMarkdown(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleSaveFile = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'markdown.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app">
      <div className="button-container">
        <button onClick={() => setShowEditor(!showEditor)}>
          {showEditor ? 'Hide Editor' : 'Show Editor'}
        </button>
        <input
          type="file"
          accept=".md"
          onChange={handleOpenFile}
          style={{ display: 'none' }}
          id="file-input"
        />
        <button onClick={() => document.getElementById('file-input').click()}>
          Open File
        </button>
        <button onClick={handleSaveFile}>Save File</button>
      </div>
      {showEditor && (
        <textarea
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          className="editor"
        />
      )}
      <div className="preview">
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </div>
    </div>
  );
}

export default App;
