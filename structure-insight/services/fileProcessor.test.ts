import { describe, expect, it, vi } from 'vitest';
import { processDroppedItems, processFiles } from './fileProcessor';

describe('processDroppedItems', () => {
    it('handles dropped entries even when no abort signal is available yet', async () => {
        const file = new File(['console.log("ok");'], 'index.ts', { type: 'text/plain' });
        const entry = {
            isFile: true,
            isDirectory: false,
            fullPath: '/src/index.ts',
            file: (onSuccess: (value: File) => void) => onSuccess(file),
        } as unknown as FileSystemFileEntry;

        const items = [
            {
                kind: 'file',
                webkitGetAsEntry: () => entry,
                getAsFile: () => file,
            },
        ] as unknown as DataTransferItemList;

        await expect(
            processDroppedItems(items, vi.fn(), undefined as unknown as AbortSignal)
        ).resolves.toHaveLength(1);
    });
});

describe('processFiles', () => {
    it('excludes files matched by the root .gitignore file', async () => {
        const gitignore = new File(['ignored.ts\n'], '.gitignore', { type: 'text/plain' });
        Object.defineProperty(gitignore, 'webkitRelativePath', {
            value: 'demo/.gitignore',
            configurable: true,
        });

        const ignoredFile = new File(['export const ignored = true;\n'], 'ignored.ts', { type: 'text/plain' });
        Object.defineProperty(ignoredFile, 'webkitRelativePath', {
            value: 'demo/ignored.ts',
            configurable: true,
        });

        const keptFile = new File(['export const kept = true;\n'], 'kept.ts', { type: 'text/plain' });
        Object.defineProperty(keptFile, 'webkitRelativePath', {
            value: 'demo/kept.ts',
            configurable: true,
        });

        const result = await processFiles(
            [gitignore, ignoredFile, keptFile],
            vi.fn(),
            true,
            100_000,
            new AbortController().signal
        );

        expect(result.fileContents.map(file => file.path)).toEqual(['demo/.gitignore', 'demo/kept.ts']);
        expect(result.exportMetadata).toEqual({
            usesDefaultIgnorePatterns: true,
            usesGitignorePatterns: true,
            sortsByGitChangeCount: false,
        });
    });
});
