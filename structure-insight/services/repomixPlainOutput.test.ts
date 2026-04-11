import { describe, expect, it } from 'vitest';
import type { ProcessedFiles } from '../types';
import { generateRepomixPlainOutput } from './repomixPlainOutput';

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
                    lines: 2,
                    chars: 27,
                },
            ],
        },
    ],
    fileContents: [
        {
            path: 'src/app.ts',
            content: 'const message = "edited";\n',
            originalContent: 'const message = "original";\n',
            language: 'typescript',
            stats: { lines: 1, chars: 26 },
        },
        {
            path: 'README.md',
            content: '# Hidden\n',
            language: 'markdown',
            stats: { lines: 1, chars: 9 },
            excluded: true,
        },
    ],
    exportMetadata: {
        usesDefaultIgnorePatterns: true,
        usesGitignorePatterns: true,
        sortsByGitChangeCount: false,
    },
};

const EXPECTED_DEFAULT_OUTPUT = [
    'This file is a merged representation of the entire codebase, combined into a single document by Repomix.',
    '',
    '================================================================',
    'File Summary',
    '================================================================',
    '',
    'Purpose:',
    '--------',
    "This file contains a packed representation of the entire repository's contents.",
    'It is designed to be easily consumable by AI systems for analysis, code review,',
    'or other automated processes.',
    '',
    'File Format:',
    '------------',
    'The content is organized as follows:',
    '1. This summary section',
    '2. Repository information',
    '3. Directory structure',
    '4. Repository files (if enabled)',
    '5. Multiple file entries, each consisting of:',
    '  a. A separator line (================)',
    '  b. The file path (File: path/to/file)',
    '  c. Another separator line',
    '  d. The full contents of the file',
    '  e. A blank line',
    '',
    'Usage Guidelines:',
    '-----------------',
    '- This file should be treated as read-only. Any changes should be made to the',
    '  original repository files, not this packed version.',
    '- When processing this file, use the file path to distinguish',
    '  between different files in the repository.',
    '- Be aware that this file may contain sensitive information. Handle it with',
    '  the same level of security as you would the original repository.',
    '',
    'Notes:',
    '------',
    "- Some files may have been excluded based on .gitignore rules and Repomix's configuration",
    '- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files',
    '- Files matching patterns in .gitignore are excluded',
    '- Files matching default ignore patterns are excluded',
    '',
    '================================================================',
    'Directory Structure',
    '================================================================',
    'src/',
    '  app.ts',
    '',
    '================================================================',
    'Files',
    '================================================================',
    '',
    '================',
    'File: src/app.ts',
    '================',
    'const message = "edited";\n',
    '',
    '================================================================',
    'End of Codebase',
    '================================================================',
    '',
].join('\n');

describe('generateRepomixPlainOutput', () => {
    it('renders the repomix plain template structure by default', () => {
        const output = generateRepomixPlainOutput(PROJECT_DATA, {
            includeFileSummary: true,
            includeDirectoryStructure: true,
            includeFiles: true,
            includeGitDiffs: false,
            userProvidedHeader: '',
            instruction: '',
        });

        expect(output).toBe(EXPECTED_DEFAULT_OUTPUT);
        expect(output).not.toContain('File: README.md');
    });

    it('omits the summary section and top header when disabled', () => {
        const output = generateRepomixPlainOutput(PROJECT_DATA, {
            includeFileSummary: false,
            includeDirectoryStructure: true,
            includeFiles: true,
            includeGitDiffs: false,
            userProvidedHeader: '',
            instruction: '',
        });

        expect(output).not.toContain('File Summary');
        expect(output).not.toContain('combined into a single document by Repomix');
        expect(output).toContain('Directory Structure');
    });

    it('omits the directory structure section when disabled', () => {
        const output = generateRepomixPlainOutput(PROJECT_DATA, {
            includeFileSummary: true,
            includeDirectoryStructure: false,
            includeFiles: true,
            includeGitDiffs: false,
            userProvidedHeader: '',
            instruction: '',
        });

        expect(output).toContain('File Summary');
        expect(output).not.toContain('Directory Structure');
        expect(output).not.toContain(PROJECT_DATA.structureString.trim());
    });

    it('keeps edited content in the exported file section', () => {
        const output = generateRepomixPlainOutput(PROJECT_DATA, {
            includeFileSummary: true,
            includeDirectoryStructure: true,
            includeFiles: true,
            includeGitDiffs: false,
            userProvidedHeader: '',
            instruction: '',
        });

        expect(output).toContain('const message = "edited";');
    });

    it('keeps an empty Files section when no file contents are available', () => {
        const output = generateRepomixPlainOutput(
            {
                ...PROJECT_DATA,
                fileContents: [],
            },
            {
                includeFileSummary: true,
                includeDirectoryStructure: true,
                includeFiles: true,
                includeGitDiffs: false,
                userProvidedHeader: '',
                instruction: '',
            }
        );

        expect(output).toContain('File Summary');
        expect(output).toContain('Directory Structure');
        expect(output).toContain('Files');
        expect(output).not.toContain('File: src/app.ts');
    });

    it('only includes notes for capabilities that are actually enabled', () => {
        const output = generateRepomixPlainOutput(
            {
                ...PROJECT_DATA,
                exportMetadata: {
                    usesDefaultIgnorePatterns: true,
                    usesGitignorePatterns: false,
                    sortsByGitChangeCount: false,
                },
            },
            {
                includeFileSummary: true,
                includeDirectoryStructure: true,
                includeFiles: true,
                includeGitDiffs: false,
                userProvidedHeader: '',
                instruction: '',
            }
        );

        expect(output).toContain('- Files matching default ignore patterns are excluded');
        expect(output).not.toContain('- Files matching patterns in .gitignore are excluded');
        expect(output).not.toContain('- Files are sorted by Git change count (files with more changes are at the bottom)');
    });

    it('renders multi-root directory structures using repomix root sections', () => {
        const output = generateRepomixPlainOutput(
            {
                rootName: '项目',
                structureString: '',
                treeData: [
                    {
                        name: 'repo-a',
                        path: 'repo-a',
                        isDirectory: true,
                        children: [
                            {
                                name: 'a.ts',
                                path: 'repo-a/a.ts',
                                isDirectory: false,
                                children: [],
                            },
                        ],
                    },
                    {
                        name: 'repo-b',
                        path: 'repo-b',
                        isDirectory: true,
                        children: [
                            {
                                name: 'b.ts',
                                path: 'repo-b/b.ts',
                                isDirectory: false,
                                children: [],
                            },
                        ],
                    },
                ],
                fileContents: [],
            },
            {
                includeFileSummary: false,
                includeDirectoryStructure: true,
                includeFiles: false,
                includeGitDiffs: false,
                userProvidedHeader: '',
                instruction: '',
            }
        );

        expect(output).toContain('[repo-a]/\n  a.ts');
        expect(output).toContain('[repo-b]/\n  b.ts');
        expect(output).not.toContain('repo-a/\n  a.ts\nrepo-b/');
    });

    it('renders user provided header and instruction sections when text is present', () => {
        const output = generateRepomixPlainOutput(PROJECT_DATA, {
            includeFileSummary: true,
            includeDirectoryStructure: true,
            includeFiles: true,
            includeGitDiffs: false,
            userProvidedHeader: 'Project overview',
            instruction: 'Focus on architecture decisions.',
        });

        expect(output).toContain(
            `================================================================\nUser Provided Header\n================================================================\nProject overview`
        );
        expect(output).toContain(
            `================================================================\nInstruction\n================================================================\nFocus on architecture decisions.`
        );
    });

    it('renders a git diff section for edited files when enabled', () => {
        const output = generateRepomixPlainOutput(PROJECT_DATA, {
            includeFileSummary: true,
            includeDirectoryStructure: true,
            includeFiles: true,
            includeGitDiffs: true,
            userProvidedHeader: '',
            instruction: '',
        });

        expect(output).toContain(
            `================================================================\nGit Diffs\n================================================================`
        );
        expect(output).toContain('diff --git a/src/app.ts b/src/app.ts');
        expect(output).toContain('--- a/src/app.ts');
        expect(output).toContain('+++ b/src/app.ts');
        expect(output).toContain('-const message = "original";');
        expect(output).toContain('+const message = "edited";');
    });
});
