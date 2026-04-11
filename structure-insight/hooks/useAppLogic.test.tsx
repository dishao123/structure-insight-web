import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProcessedFiles } from '../types';
import { useAppLogic } from './useAppLogic';

const PROJECT_DATA: ProcessedFiles = {
    rootName: 'demo-project',
    structureString: `demo-project
└── src
    └── app.ts
`,
    treeData: [
        {
            name: 'src',
            path: 'src',
            isDirectory: true,
            children: [
                {
                    name: 'app.ts',
                    path: 'src/app.ts',
                    isDirectory: false,
                    children: [],
                    status: 'processed',
                    lines: 1,
                    chars: 20,
                },
            ],
        },
    ],
    fileContents: [
        {
            path: 'src/app.ts',
            content: 'console.log("demo");\n',
            originalContent: 'console.log("demo");\n',
            language: 'typescript',
            stats: { lines: 1, chars: 21 },
        },
    ],
};

const { generateRepomixPlainOutputMock } = vi.hoisted(() => ({
    generateRepomixPlainOutputMock: vi.fn(() => 'PACKED OUTPUT'),
}));

vi.mock('../services/repomixPlainOutput', () => ({
    generateRepomixPlainOutput: generateRepomixPlainOutputMock,
}));

vi.mock('./useWindowSize', () => ({
    useWindowSize: () => ({ width: 1280, height: 720 }),
}));

vi.mock('./useFileProcessing', () => ({
    useFileProcessing: () => ({
        processedData: PROJECT_DATA,
        setProcessedData: vi.fn(),
        lastProcessedFiles: null,
        setLastProcessedFiles: vi.fn(),
        handleProcessing: vi.fn(),
        handleFileSelect: vi.fn(),
        handleDrop: vi.fn(),
        handleRefresh: vi.fn(),
        handleCancel: vi.fn(),
        abortControllerRef: { current: null },
    }),
}));

vi.mock('./useInteraction', () => ({
    useInteraction: () => ({
        editingPath: null,
        setEditingPath: vi.fn(),
        markdownPreviewPaths: new Set<string>(),
        handleDeleteFile: vi.fn(),
        handleFileTreeSelect: vi.fn(),
        handleSaveEdit: vi.fn(),
        handleToggleMarkdownPreview: vi.fn(),
        clearInteractionState: vi.fn(),
        handleCopyPath: vi.fn(),
        handleToggleExclude: vi.fn(),
    }),
}));

vi.mock('./useSearch', () => ({
    useSearch: () => ({
        isSearchOpen: false,
        setIsSearchOpen: vi.fn(),
        searchResults: [],
        activeResultIndex: null,
        searchQuery: '',
        searchOptions: { caseSensitive: false, useRegex: false, wholeWord: false },
        handleSearch: vi.fn(),
        handleNavigate: vi.fn(),
        resetSearch: vi.fn(),
    }),
}));

describe('useAppLogic', () => {
    beforeEach(() => {
        window.localStorage.clear();
        generateRepomixPlainOutputMock.mockClear();
        vi.restoreAllMocks();

        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: {
                writeText: vi.fn(() => Promise.resolve()),
            },
        });

        Object.defineProperty(URL, 'createObjectURL', {
            configurable: true,
            value: vi.fn(() => 'blob:packed-output'),
        });

        Object.defineProperty(URL, 'revokeObjectURL', {
            configurable: true,
            value: vi.fn(),
        });

        vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    });

    it('defaults output settings to include file summary and directory structure', () => {
        const codeViewRef = React.createRef<HTMLDivElement>();
        const leftPanelRef = React.createRef<HTMLDivElement>();

        const { result } = renderHook(() => useAppLogic(codeViewRef, leftPanelRef));

        expect(result.current.state.includeFileSummary).toBe(true);
        expect(result.current.state.includeDirectoryStructure).toBe(true);
        expect(result.current.state.includeGitDiffs).toBe(false);
        expect(result.current.state.exportHeaderText).toBe('');
        expect(result.current.state.exportInstructionText).toBe('');
    });

    it('uses the shared plain output for copy and save actions', async () => {
        const codeViewRef = React.createRef<HTMLDivElement>();
        const leftPanelRef = React.createRef<HTMLDivElement>();
        const OriginalBlob = globalThis.Blob;
        class FakeBlob {
            parts: unknown[];
            options?: BlobPropertyBag;

            constructor(parts: unknown[], options?: BlobPropertyBag) {
                this.parts = parts;
                this.options = options;
            }
        }
        Object.defineProperty(globalThis, 'Blob', {
            configurable: true,
            value: FakeBlob,
        });

        try {
            const { result } = renderHook(() => useAppLogic(codeViewRef, leftPanelRef));

            expect(generateRepomixPlainOutputMock).toHaveBeenCalledWith(PROJECT_DATA, {
                includeFileSummary: true,
                includeDirectoryStructure: true,
                includeFiles: true,
                includeGitDiffs: false,
                userProvidedHeader: '',
                instruction: '',
            });

            await act(async () => {
                result.current.handlers.handleCopyAll();
            });

            expect(navigator.clipboard.writeText).toHaveBeenCalledWith('PACKED OUTPUT');

            act(() => {
                result.current.handlers.handleSave();
            });

            const createObjectURLMock = vi.mocked(URL.createObjectURL);
            expect(createObjectURLMock).toHaveBeenCalledTimes(1);
            const exportedBlob = createObjectURLMock.mock.calls[0][0] as FakeBlob;

            expect(exportedBlob.parts).toEqual(['PACKED OUTPUT']);
            expect(exportedBlob.options).toEqual({ type: 'text/plain;charset=utf-8' });
        } finally {
            Object.defineProperty(globalThis, 'Blob', {
                configurable: true,
                value: OriginalBlob,
            });
        }
    });
});
