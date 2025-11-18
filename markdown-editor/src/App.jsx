import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './App.css';

function App() {
  const [markdown, setMarkdown] = useState('# Hello, world!');
  const [showEditor, setShowEditor] = useState(false);

  return (
    <div className="app">
      <button onClick={() => setShowEditor(!showEditor)}>
        {showEditor ? 'Hide Editor' : 'Show Editor'}
      </button>
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
