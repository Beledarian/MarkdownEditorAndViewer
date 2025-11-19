import { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import html2pdf from 'html2pdf.js';
import './App.css';
import cssContent from './App.css?raw';

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

  const handleExportHTML = () => {
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
              /* Additional styles for standalone view */
              body {
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background-color: #2c3e50;
                color: #ecf0f1;
                font-family: sans-serif;
              }
              .preview {
                width: 80%;
                max-width: 800px;
                background-color: #34495e;
                padding: 20px;
                border-radius: 5px;
              }
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
  };

  const handleExportPDF = () => {
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
        <button onClick={handleExportHTML}>Export as HTML</button>
        <button onClick={handleExportPDF}>Export as PDF</button>
      </div>
      <div className="container">
        <MDEditor
          value={markdown}
          onChange={(val) => setMarkdown(val)}
        />
        <div id="preview" style={{ overflow: 'auto' }}>
          <MDEditor.Markdown
            source={markdown}
            style={{ whiteSpace: 'pre-wrap', backgroundColor: 'transparent' }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;