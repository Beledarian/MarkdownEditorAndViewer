import React from 'react';
import Tooltip from './Tooltip';

const StatusBar = ({
    currentFile,
    isSaving,
    lineCount,
    wordCount,
    wordGoal,
    charCount,
    readingTime,
    handleInsertTimestamp,
    shortcuts
}) => {
    return (
        <div className="status-bar">
            <div className="status-item">
                {currentFile ? `File: ${currentFile.name}` : 'Unsaved Draft'}
                {isSaving && ' (Saving...)'}
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
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
                    <button className="text-btn" onClick={handleInsertTimestamp} style={{ padding: 0 }} aria-label="Insert Timestamp">🕒</button>
                </Tooltip>
            </div>
        </div>
    );
};

export default StatusBar;
