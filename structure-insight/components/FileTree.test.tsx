import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import FileTree from './FileTree';
import type { FileNode } from '../types';

vi.mock('react-virtuoso', () => ({
  Virtuoso: ({ data, itemContent }: any) => (
    <div data-testid="virtuoso" data-count={String(data.length)}>
      {data.slice(0, 12).map((item: any, index: number) => (
        <div key={item.path}>{itemContent(index, item)}</div>
      ))}
    </div>
  ),
}));

const makeLargeTree = (): FileNode[] => [
  {
    name: 'src',
    path: 'src',
    isDirectory: true,
    children: Array.from({ length: 200 }, (_, index) => ({
      name: `file-${index}.ts`,
      path: `src/file-${index}.ts`,
      isDirectory: false,
      children: [],
      status: 'processed' as const,
    })),
  },
];

describe('FileTree virtualization', () => {
  it('passes the flattened visible rows into the virtual list instead of mounting the full tree', () => {
    render(
      <FileTree
        nodes={makeLargeTree()}
        onFileSelect={vi.fn()}
        onDeleteFile={vi.fn()}
        onCopyPath={vi.fn()}
        onToggleExclude={vi.fn()}
        selectedFilePath={null}
        showCharCount={false}
      />
    );

    expect(screen.getByTestId('virtuoso').getAttribute('data-count')).toBe('201');
    expect(screen.getByText('file-0.ts')).not.toBeNull();
    expect(screen.queryByText('file-199.ts')).toBeNull();
  });
});
