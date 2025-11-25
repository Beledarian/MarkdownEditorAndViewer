import React, { useState, useRef, useEffect } from 'react';
import './ColorPicker.css';
import Tooltip from './Tooltip';

const CURATED_COLORS = [
    '#000000', '#434343', '#666666', '#999999', '#FFFFFF',
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
    '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
    '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
    '#EC4899', '#F43F5E'
];

const ColorPicker = ({ onColorSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleColorClick = (color) => {
        onColorSelect(color);
        setIsOpen(false);
    };

    const handleCustomColorChange = (e) => {
        onColorSelect(e.target.value);
        setIsOpen(false);
    };

    return (
        <div className="color-picker-container" ref={containerRef}>
            <Tooltip text="Text Color">
                <button
                    className="color-picker-btn"
                    onClick={() => setIsOpen(!isOpen)}
                    onMouseDown={(e) => e.preventDefault()}
                    aria-label="Text Color"
                >
                    <span style={{
                        width: '14px',
                        height: '14px',
                        background: 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)',
                        borderRadius: '2px',
                        display: 'inline-block'
                    }}></span>
                    Color
                </button>
            </Tooltip>

            {isOpen && (
                <div className="color-dropdown">
                    <div className="color-presets">
                        {CURATED_COLORS.map((color) => (
                            <div
                                key={color}
                                className="color-preset"
                                style={{ backgroundColor: color }}
                                onClick={() => handleColorClick(color)}
                                onMouseDown={(e) => e.preventDefault()}
                                title={color}
                            />
                        ))}
                    </div>
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '5px' }}>
                        <button
                            className="custom-color-btn"
                            onClick={() => inputRef.current.click()}
                        >
                            Custom Color...
                        </button>
                        <input
                            ref={inputRef}
                            type="color"
                            style={{ display: 'none' }}
                            onChange={handleCustomColorChange}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ColorPicker;
