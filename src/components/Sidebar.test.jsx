import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from './Sidebar';

// Mock react-virtuoso since it relies on resize observers which might be tricky in jsdom
vi.mock('react-virtuoso', () => ({
    Virtuoso: ({ itemContent, totalCount }) => (
        <div>
            {Array.from({ length: totalCount }).map((_, index) => (
                <div key={index}>{itemContent(index)}</div>
            ))}
        </div>
    ),
}));

describe('Sidebar', () => {
    const mockFiles = [
        { name: 'test1.md', path: '/test1.md' },
        { name: 'test2.md', path: '/test2.md' },
    ];
    const mockAssets = [];
    const mockProps = {
        files: mockFiles,
        assets: mockAssets,
        loading: false,
        ignorePatterns: [],
        currentFile: null,
        onFileSelect: vi.fn(),
        onInsertImage: vi.fn(),
        onRefresh: vi.fn(),
        onAddIgnore: vi.fn(),
        onRemoveIgnore: vi.fn(),
        onOpenFolder: vi.fn(),
    };

    it('renders file list', () => {
        render(<Sidebar {...mockProps} />);
        expect(screen.getByText('📄 test1.md')).toBeInTheDocument();
        expect(screen.getByText('📄 test2.md')).toBeInTheDocument();
    });

    it('filters files', () => {
        render(<Sidebar {...mockProps} />);
        const input = screen.getByPlaceholderText('Filter files...');
        fireEvent.change(input, { target: { value: 'test1' } });

        expect(screen.getByText('📄 test1.md')).toBeInTheDocument();
        expect(screen.queryByText('📄 test2.md')).not.toBeInTheDocument();
    });

    it('calls onFileSelect when a file is clicked', () => {
        render(<Sidebar {...mockProps} />);
        fireEvent.click(screen.getByText('📄 test1.md'));
        expect(mockProps.onFileSelect).toHaveBeenCalledWith(mockFiles[0]);
    });
});
