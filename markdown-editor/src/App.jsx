import { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import './App.css';

function App() {
  const [markdown, setMarkdown] = useState('# Hello, world!');

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
    <div className="app" data-color-mode="dark">
      <div className="button-container">
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
      <div className="container">
        <MDEditor
          value={markdown}
          onChange={(val) => setMarkdown(val)}
        />
        <MDEditor.Markdown
          source={markdown}
          style={{ whiteSpace: 'pre-wrap' }}
        />
      </div>
    </div>
  );
}

export default App;