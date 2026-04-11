import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useInteraction } from './useInteraction';
import type { ConfirmationState, ProcessedFiles } from '../types';

const INITIAL_DATA: ProcessedFiles = {
    rootName: 'demo',
    structureString: 'demo\n└── app.ts (3 字符)\n',
    treeData: [
        {
            name: 'app.ts',
            path: 'app.ts',
            isDirectory: false,
            children: [],
            status: 'processed',
            lines: 1,
            chars: 3,
        },
    ],
    fileContents: [
        {
            path: 'app.ts',
            content: 'abc',
            language: 'typescript',
            stats: { lines: 1, chars: 3 },
        },
    ],
};

describe('useInteraction', () => {
    it('keeps tree stats and structure output in sync after editing a file', () => {
        const setConfirmation = vi.fn() as React.Dispatch<React.SetStateAction<ConfirmationState>>;

        const { result } = renderHook(() => {
            const [processedData, setProcessedData] = React.useState<ProcessedFiles | null>(INITIAL_DATA);
            const interaction = useInteraction({
                processedData,
                setProcessedData,
                handleShowToast: vi.fn(),
                isMobile: false,
                setMobileView: vi.fn(),
                setConfirmation,
                selectedFilePath: 'app.ts',
                setSelectedFilePath: vi.fn(),
                setActiveView: vi.fn(),
                showCharCount: true,
            });

            return { processedData, ...interaction };
        });

        act(() => {
            result.current.handleSaveEdit('app.ts', 'line one\nline two');
        });

        const updatedData = result.current.processedData;
        expect(updatedData).not.toBeNull();
        expect(updatedData!.fileContents[0].stats).toEqual({ lines: 2, chars: 17 });
        expect(updatedData!.treeData[0].lines).toBe(2);
        expect(updatedData!.treeData[0].chars).toBe(17);
        expect(updatedData!.structureString).toContain('app.ts (17 字符)');
    });
});
