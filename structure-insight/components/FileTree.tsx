import React from 'react';
import { Virtuoso, type VirtuosoHandle } from 'react-virtuoso';
import { FileNode } from '../types';
import { collectExpandedDirectoryPaths, flattenVisibleTreeRows, type VisibleTreeRow } from './fileTreeRows';

interface FileTreeProps {
  nodes: FileNode[];
  onFileSelect: (path: string) => void;
  onDeleteFile: (path: string) => void;
  onCopyPath: (path: string) => void;
  onToggleExclude: (path: string) => void;
  onDirDoubleClick?: () => void;
  selectedFilePath: string | null;
  showCharCount: boolean;
}

type IconEntry = { icon: string; color: string };

const specialFileMap = new Map<string, IconEntry>([
  ['package.json', { icon: 'fa-brands fa-npm', color: 'text-[#CB3837]' }],
  ['dockerfile', { icon: 'fa-brands fa-docker', color: 'text-[#2496ED]' }],
  ['makefile', { icon: 'fa-solid fa-gavel', color: 'text-gray-500' }],
  ['jenkinsfile', { icon: 'fa-brands fa-jenkins', color: 'text-[#D24939]' }],
  ['readme.md', { icon: 'fa-brands fa-markdown', color: 'text-gray-700 dark:text-gray-300' }],
  ['.gitignore', { icon: 'fa-brands fa-git-alt', color: 'text-[#F05032]' }],
  ['.gitattributes', { icon: 'fa-brands fa-git-alt', color: 'text-[#F05032]' }],
]);

const extensionMap = new Map<string, IconEntry>([
  ['html', { icon: 'fa-brands fa-html5', color: 'text-[#E34F26]' }],
  ['htm', { icon: 'fa-brands fa-html5', color: 'text-[#E34F26]' }],
  ['css', { icon: 'fa-brands fa-css3-alt', color: 'text-[#1572B6]' }],
  ['scss', { icon: 'fa-brands fa-sass', color: 'text-[#CC6699]' }],
  ['sass', { icon: 'fa-brands fa-sass', color: 'text-[#CC6699]' }],
  ['less', { icon: 'fa-brands fa-less', color: 'text-[#1D365D]' }],
  ['js', { icon: 'fa-brands fa-js', color: 'text-[#F7DF1E]' }],
  ['cjs', { icon: 'fa-brands fa-js', color: 'text-[#F7DF1E]' }],
  ['mjs', { icon: 'fa-brands fa-js', color: 'text-[#F7DF1E]' }],
  ['ts', { icon: 'fa-brands fa-js', color: 'text-[#3178C6]' }],
  ['jsx', { icon: 'fa-brands fa-react', color: 'text-[#61DAFB]' }],
  ['tsx', { icon: 'fa-brands fa-react', color: 'text-[#61DAFB]' }],
  ['vue', { icon: 'fa-brands fa-vuejs', color: 'text-[#4FC08D]' }],
  ['svelte', { icon: 'fa-solid fa-code', color: 'text-[#FF3E00]' }],
  ['php', { icon: 'fa-brands fa-php', color: 'text-[#777BB4]' }],
  ['py', { icon: 'fa-brands fa-python', color: 'text-[#3776AB]' }],
  ['pyc', { icon: 'fa-brands fa-python', color: 'text-[#3776AB]' }],
  ['java', { icon: 'fa-brands fa-java', color: 'text-[#007396]' }],
  ['class', { icon: 'fa-brands fa-java', color: 'text-[#007396]' }],
  ['jar', { icon: 'fa-brands fa-java', color: 'text-[#007396]' }],
  ['rb', { icon: 'fa-regular fa-gem', color: 'text-[#CC342D]' }],
  ['go', { icon: 'fa-brands fa-golang', color: 'text-[#00ADD8]' }],
  ['rs', { icon: 'fa-brands fa-rust', color: 'text-[#DEA584]' }],
  ['swift', { icon: 'fa-brands fa-swift', color: 'text-[#F05138]' }],
  ['c', { icon: 'fa-solid fa-c', color: 'text-[#555555]' }],
  ['h', { icon: 'fa-solid fa-c', color: 'text-[#555555]' }],
  ['cpp', { icon: 'fa-solid fa-c', color: 'text-[#00599C]' }],
  ['hpp', { icon: 'fa-solid fa-c', color: 'text-[#00599C]' }],
  ['cc', { icon: 'fa-solid fa-c', color: 'text-[#00599C]' }],
  ['cs', { icon: 'fa-solid fa-code', color: 'text-[#239120]' }],
  ['sh', { icon: 'fa-solid fa-terminal', color: 'text-gray-500' }],
  ['bash', { icon: 'fa-solid fa-terminal', color: 'text-gray-500' }],
  ['zsh', { icon: 'fa-solid fa-terminal', color: 'text-gray-500' }],
  ['ps1', { icon: 'fa-solid fa-terminal', color: 'text-gray-500' }],
  ['bat', { icon: 'fa-solid fa-terminal', color: 'text-gray-500' }],
  ['cmd', { icon: 'fa-solid fa-terminal', color: 'text-gray-500' }],
  ['json', { icon: 'fa-solid fa-code', color: 'text-yellow-600' }],
  ['xml', { icon: 'fa-solid fa-code', color: 'text-orange-500' }],
  ['yaml', { icon: 'fa-solid fa-list', color: 'text-purple-500' }],
  ['yml', { icon: 'fa-solid fa-list', color: 'text-purple-500' }],
  ['toml', { icon: 'fa-solid fa-gear', color: 'text-gray-500' }],
  ['ini', { icon: 'fa-solid fa-gear', color: 'text-gray-500' }],
  ['env', { icon: 'fa-solid fa-gear', color: 'text-gray-500' }],
  ['sql', { icon: 'fa-solid fa-database', color: 'text-blue-400' }],
  ['db', { icon: 'fa-solid fa-database', color: 'text-blue-400' }],
  ['sqlite', { icon: 'fa-solid fa-database', color: 'text-blue-400' }],
  ['md', { icon: 'fa-brands fa-markdown', color: 'text-gray-700 dark:text-gray-300' }],
  ['txt', { icon: 'fa-regular fa-file-lines', color: 'text-gray-400' }],
  ['pdf', { icon: 'fa-regular fa-file-pdf', color: 'text-red-500' }],
  ['doc', { icon: 'fa-regular fa-file-word', color: 'text-blue-700' }],
  ['docx', { icon: 'fa-regular fa-file-word', color: 'text-blue-700' }],
  ['xls', { icon: 'fa-regular fa-file-excel', color: 'text-green-600' }],
  ['xlsx', { icon: 'fa-regular fa-file-excel', color: 'text-green-600' }],
  ['csv', { icon: 'fa-regular fa-file-excel', color: 'text-green-600' }],
  ['ppt', { icon: 'fa-regular fa-file-powerpoint', color: 'text-orange-600' }],
  ['pptx', { icon: 'fa-regular fa-file-powerpoint', color: 'text-orange-600' }],
  ['png', { icon: 'fa-regular fa-file-image', color: 'text-purple-500' }],
  ['jpg', { icon: 'fa-regular fa-file-image', color: 'text-purple-500' }],
  ['jpeg', { icon: 'fa-regular fa-file-image', color: 'text-purple-500' }],
  ['gif', { icon: 'fa-regular fa-file-image', color: 'text-purple-500' }],
  ['svg', { icon: 'fa-regular fa-file-image', color: 'text-purple-500' }],
  ['ico', { icon: 'fa-regular fa-file-image', color: 'text-purple-500' }],
  ['webp', { icon: 'fa-regular fa-file-image', color: 'text-purple-500' }],
  ['mp3', { icon: 'fa-regular fa-file-audio', color: 'text-yellow-600' }],
  ['wav', { icon: 'fa-regular fa-file-audio', color: 'text-yellow-600' }],
  ['ogg', { icon: 'fa-regular fa-file-audio', color: 'text-yellow-600' }],
  ['mp4', { icon: 'fa-regular fa-file-video', color: 'text-pink-600' }],
  ['mov', { icon: 'fa-regular fa-file-video', color: 'text-pink-600' }],
  ['avi', { icon: 'fa-regular fa-file-video', color: 'text-pink-600' }],
  ['webm', { icon: 'fa-regular fa-file-video', color: 'text-pink-600' }],
  ['zip', { icon: 'fa-regular fa-file-zipper', color: 'text-amber-600' }],
  ['rar', { icon: 'fa-regular fa-file-zipper', color: 'text-amber-600' }],
  ['7z', { icon: 'fa-regular fa-file-zipper', color: 'text-amber-600' }],
  ['tar', { icon: 'fa-regular fa-file-zipper', color: 'text-amber-600' }],
  ['gz', { icon: 'fa-regular fa-file-zipper', color: 'text-amber-600' }],
  ['ttf', { icon: 'fa-solid fa-font', color: 'text-gray-500' }],
  ['otf', { icon: 'fa-solid fa-font', color: 'text-gray-500' }],
  ['woff', { icon: 'fa-solid fa-font', color: 'text-gray-500' }],
  ['woff2', { icon: 'fa-solid fa-font', color: 'text-gray-500' }],
]);

const defaultIcon: IconEntry = { icon: 'fa-regular fa-file', color: 'text-gray-400 dark:text-gray-500' };

export type { IconEntry };

const getFileIcon = (fileName: string): IconEntry => {
  const lowerName = fileName.toLowerCase();
  const special = specialFileMap.get(lowerName);

  if (special) {
    return special;
  }

  if (lowerName.endsWith('.config.js') || lowerName.endsWith('.config.ts')) {
    return { icon: 'fa-solid fa-gear', color: 'text-gray-500' };
  }

  const ext = lowerName.split('.').pop()!;
  return extensionMap.get(ext) ?? defaultIcon;
};

export { getFileIcon };

function countFiles(node: FileNode): number {
  if (!node.isDirectory) {
    return 1;
  }

  let count = 0;
  for (const child of node.children) {
    count += countFiles(child);
  }
  return count;
}

function getRowStatus(node: FileNode): { statusClass: string; title: string; displayName: string } {
  let statusClass = node.status === 'processed' || !node.status ? '' : 'cursor-default';
  let title = node.path;
  let displayName = node.name;

  if (!node.isDirectory && (node.status === 'processed' || !node.status) && typeof node.lines === 'number' && typeof node.chars === 'number') {
    title = `${node.path}\n${node.lines} 行 · ${node.chars} 字符`;
  }

  if (node.status === 'skipped') {
    statusClass += ' opacity-60';
    title = `${node.path} (已跳过)`;
  } else if (node.status === 'error') {
    statusClass += ' text-red-500/80';
    displayName = `错误: ${node.name}`;
    title = `${node.path} (错误: 无法读取文件)`;
  } else if (node.excluded) {
    statusClass += ' opacity-50 italic decoration-slate-400';
    title = `${node.path} (已排除)`;
  }

  return { statusClass, title, displayName };
}

const FileTreeRow: React.FC<{
  row: VisibleTreeRow;
  onFileSelect: (path: string) => void;
  onDeleteFile: (path: string) => void;
  onCopyPath: (path: string) => void;
  onToggleExclude: (path: string) => void;
  onDirDoubleClick?: () => void;
  onToggleExpand: (path: string) => void;
  showCharCount: boolean;
}> = React.memo(({ row, onFileSelect, onDeleteFile, onCopyPath, onToggleExclude, onDirDoubleClick, onToggleExpand, showCharCount }) => {
  const { node, level, isOpen, isSelected, isFocused } = row;
  const { statusClass, title, displayName } = getRowStatus(node);

  const handleToggle = () => {
    if (node.isDirectory) {
      onToggleExpand(node.path);
    }
  };

  const handleSelect = () => {
    if (!node.isDirectory && node.status === 'processed') {
      onFileSelect(node.path);
    } else if (node.isDirectory) {
      handleToggle();
    }
  };

  const handleDoubleClick = () => {
    if (node.isDirectory && onDirDoubleClick) {
      onToggleExpand(node.path);
      onDirDoubleClick();
    }
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDeleteFile(node.path);
  };

  const handleToggleExcludeClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onToggleExclude(node.path);
  };

  const iconElement = node.isDirectory
    ? <i className={`fa-solid ${isOpen ? 'fa-folder-open' : 'fa-folder'} w-5 text-center text-sky-500`}></i>
    : <i className={`${getFileIcon(node.name).icon} w-5 text-center ${getFileIcon(node.name).color}`}></i>;

  return (
    <div
      role="treeitem"
      aria-level={level}
      aria-expanded={node.isDirectory ? isOpen : undefined}
      aria-selected={isSelected || undefined}
      style={{ paddingLeft: `${level > 1 ? 1.25 : 0}rem` }}
      className="list-none"
    >
      <div
        className={`group flex flex-col py-1 px-2 rounded-md cursor-pointer hover:bg-light-border dark:hover:bg-dark-border/50 transition-colors duration-150 ${statusClass} ${isSelected ? 'bg-primary/10 dark:bg-primary/20' : ''} ${isFocused ? 'ring-1 ring-primary/50 bg-primary/5' : ''}`}
        onClick={handleSelect}
        onDoubleClick={handleDoubleClick}
        title={title}
        data-path={node.path}
      >
        <div className="flex items-center space-x-2 w-full">
          {node.isDirectory ? (
            <span className="w-4 text-center shrink-0" onClick={(event) => { event.stopPropagation(); handleToggle(); }}>
              <i className={`fa-solid fa-chevron-down text-xs transition-transform duration-200 text-light-subtle-text dark:text-dark-subtle-text ${isOpen ? 'rotate-0' : '-rotate-90'}`}></i>
            </span>
          ) : (
            <span className="w-4 shrink-0"></span>
          )}

          <span className="shrink-0">{iconElement}</span>
          <span className={`truncate text-sm flex-1 ${node.excluded ? 'line-through' : ''}`}>{displayName}</span>

          {node.isDirectory && (
            <span className="text-[10px] text-light-subtle-text/60 dark:text-dark-subtle-text/60 shrink-0 ml-1 tabular-nums">
              {countFiles(node)}
            </span>
          )}

          {!node.isDirectory && node.status === 'processed' && (
            <div className={`flex items-center space-x-2 text-xs text-light-subtle-text dark:text-dark-subtle-text shrink-0 ml-2 transition-opacity ${showCharCount ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              {typeof node.chars === 'number' && <span title={`${node.chars} 个字符`}>{node.chars}</span>}
              {typeof node.lines === 'number' && (
                <span className="border-l border-light-border dark:border-dark-border pl-2" title={`${node.lines} 行`}>
                  {node.lines}
                </span>
              )}
            </div>
          )}
        </div>

        {!node.isDirectory && (
          <div className="hidden group-hover:flex items-center space-x-2 pl-9 mt-1.5 pb-0.5 animate-enter origin-top w-full overflow-x-auto no-scrollbar">
            <button
              onClick={(event) => { event.stopPropagation(); onCopyPath(node.path); }}
              className="flex items-center space-x-1.5 px-2 py-1 rounded text-xs bg-white dark:bg-dark-bg border border-light-border dark:border-dark-border shadow-sm text-light-subtle-text hover:text-primary hover:border-primary transition-colors shrink-0"
              title="复制完整路径"
            >
              <i className="fa-regular fa-copy"></i>
              <span>路径</span>
            </button>

            {node.status === 'processed' && (
              <button
                onClick={handleToggleExcludeClick}
                className="flex items-center space-x-1.5 px-2 py-1 rounded text-xs bg-white dark:bg-dark-bg border border-light-border dark:border-dark-border shadow-sm text-light-subtle-text hover:text-primary hover:border-primary transition-colors shrink-0"
                title={node.excluded ? '包含此文件' : '从分析中排除'}
              >
                <i className={`fa-solid ${node.excluded ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                <span>{node.excluded ? '包含' : '排除'}</span>
              </button>
            )}

            <button
              onClick={handleDelete}
              className="flex items-center space-x-1.5 px-2 py-1 rounded text-xs bg-white dark:bg-dark-bg border border-light-border dark:border-dark-border shadow-sm text-light-subtle-text hover:text-red-500 hover:border-red-500 transition-colors shrink-0"
              title="从列表中移除"
            >
              <i className="fa-solid fa-trash-can"></i>
              <span>删除</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

const FileTree: React.FC<FileTreeProps> = ({
  nodes,
  onFileSelect,
  onDeleteFile,
  onCopyPath,
  onToggleExclude,
  onDirDoubleClick,
  selectedFilePath,
  showCharCount,
}) => {
  const [expandedPaths, setExpandedPaths] = React.useState<Set<string>>(() => collectExpandedDirectoryPaths(nodes));
  const [focusedPath, setFocusedPath] = React.useState<string | null>(null);
  const [scrollParent, setScrollParent] = React.useState<HTMLElement | null>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const virtuosoRef = React.useRef<VirtuosoHandle>(null);

  React.useLayoutEffect(() => {
    setScrollParent(rootRef.current?.parentElement ?? null);
  }, []);

  const handleToggleExpand = React.useCallback((path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const visibleRows = React.useMemo(
    () => flattenVisibleTreeRows(nodes, expandedPaths, selectedFilePath, focusedPath),
    [nodes, expandedPaths, selectedFilePath, focusedPath]
  );

  const visiblePaths = React.useMemo(() => visibleRows.map(row => row.path), [visibleRows]);

  React.useEffect(() => {
    if (!focusedPath) {
      return;
    }

    const index = visiblePaths.indexOf(focusedPath);
    if (index >= 0) {
      virtuosoRef.current?.scrollToIndex({ index, align: 'center', behavior: 'auto' });
    }
  }, [focusedPath, visiblePaths]);

  const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    if (!visiblePaths.length) {
      return;
    }

    const currentIdx = focusedPath ? visiblePaths.indexOf(focusedPath) : -1;

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        const next = currentIdx < visiblePaths.length - 1 ? currentIdx + 1 : 0;
        setFocusedPath(visiblePaths[next]);
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        const prev = currentIdx > 0 ? currentIdx - 1 : visiblePaths.length - 1;
        setFocusedPath(visiblePaths[prev]);
        break;
      }
      case 'ArrowRight': {
        event.preventDefault();
        if (!focusedPath) {
          break;
        }

        const row = visibleRows.find(item => item.path === focusedPath);
        if (row?.node.isDirectory && !row.isOpen) {
          handleToggleExpand(focusedPath);
        }
        break;
      }
      case 'ArrowLeft': {
        event.preventDefault();
        if (!focusedPath) {
          break;
        }

        const row = visibleRows.find(item => item.path === focusedPath);
        if (row?.node.isDirectory && row.isOpen) {
          handleToggleExpand(focusedPath);
        }
        break;
      }
      case 'Enter': {
        event.preventDefault();
        if (!focusedPath) {
          break;
        }

        const row = visibleRows.find(item => item.path === focusedPath);
        if (!row) {
          break;
        }

        if (row.node.isDirectory) {
          handleToggleExpand(focusedPath);
        } else if (row.node.status === 'processed') {
          onFileSelect(focusedPath);
        }
        break;
      }
      case 'Escape':
        setFocusedPath(null);
        break;
    }
  }, [visiblePaths, visibleRows, focusedPath, handleToggleExpand, onFileSelect]);

  const collapseAll = React.useCallback(() => {
    setExpandedPaths(new Set());
  }, []);

  const expandAll = React.useCallback(() => {
    setExpandedPaths(collectExpandedDirectoryPaths(nodes));
  }, [nodes]);

  if (!nodes || nodes.length === 0) {
    return <div className="p-4 text-center text-sm text-light-subtle-text dark:text-dark-subtle-text">未加载文件。</div>;
  }

  return (
    <div ref={rootRef} className="p-2 h-full min-h-0" role="tree" aria-label="资源管理器" tabIndex={0} onKeyDown={handleKeyDown}>
      <div className="flex items-center justify-between px-2 mb-2">
        <h3 className="text-xs font-semibold text-light-subtle-text dark:text-dark-subtle-text uppercase tracking-wider">资源管理器</h3>
        <div className="flex items-center gap-1">
          <button onClick={expandAll} className="w-6 h-6 rounded flex items-center justify-center text-light-subtle-text hover:text-primary hover:bg-light-border dark:hover:bg-dark-border/50 transition-colors" title="全部展开">
            <i className="fa-solid fa-angles-down text-xs"></i>
          </button>
          <button onClick={collapseAll} className="w-6 h-6 rounded flex items-center justify-center text-light-subtle-text hover:text-primary hover:bg-light-border dark:hover:bg-dark-border/50 transition-colors" title="全部折叠">
            <i className="fa-solid fa-angles-up text-xs"></i>
          </button>
        </div>
      </div>
      <div className="h-[calc(100%-2.5rem)] min-h-0">
        <Virtuoso
          ref={virtuosoRef}
          style={{ height: '100%' }}
          data={visibleRows}
          computeItemKey={(_index, row) => row.path}
          increaseViewportBy={240}
          customScrollParent={scrollParent ?? undefined}
          itemContent={(_index, row) => (
            <FileTreeRow
              row={row}
              onFileSelect={onFileSelect}
              onDeleteFile={onDeleteFile}
              onCopyPath={onCopyPath}
              onToggleExclude={onToggleExclude}
              onDirDoubleClick={onDirDoubleClick}
              onToggleExpand={handleToggleExpand}
              showCharCount={showCharCount}
            />
          )}
        />
      </div>
    </div>
  );
};

export default React.memo(FileTree);
