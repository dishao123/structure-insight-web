
import React from 'react';
import { FileNode } from '../types';

interface FileTreeProps {
  nodes: FileNode[];
  onFileSelect: (path: string) => void;
  onDeleteFile: (path: string) => void;
  onCopyPath: (path: string) => void;
  onToggleExclude: (path: string) => void;
  selectedFilePath: string | null;
  showCharCount: boolean;
}

// Helper to determine icon and color based on file extension/name
const getFileIcon = (fileName: string): { icon: string; color: string } => {
    const lowerName = fileName.toLowerCase();
    const ext = lowerName.split('.').pop();
    
    // Special files
    if (lowerName === 'package.json') return { icon: 'fa-brands fa-npm', color: 'text-[#CB3837]' };
    if (lowerName === 'dockerfile') return { icon: 'fa-brands fa-docker', color: 'text-[#2496ED]' };
    if (lowerName === 'makefile') return { icon: 'fa-solid fa-gavel', color: 'text-gray-500' };
    if (lowerName === 'jenkinsfile') return { icon: 'fa-brands fa-jenkins', color: 'text-[#D24939]' };
    if (lowerName === 'readme.md') return { icon: 'fa-brands fa-markdown', color: 'text-gray-700 dark:text-gray-300' };
    if (lowerName === '.gitignore' || lowerName === '.gitattributes') return { icon: 'fa-brands fa-git-alt', color: 'text-[#F05032]' };
    if (lowerName.endsWith('.config.js') || lowerName.endsWith('.config.ts')) return { icon: 'fa-solid fa-gear', color: 'text-gray-500' };

    switch (ext) {
        // Web
        case 'html': 
        case 'htm': return { icon: 'fa-brands fa-html5', color: 'text-[#E34F26]' };
        case 'css': return { icon: 'fa-brands fa-css3-alt', color: 'text-[#1572B6]' };
        case 'scss': 
        case 'sass': return { icon: 'fa-brands fa-sass', color: 'text-[#CC6699]' };
        case 'less': return { icon: 'fa-brands fa-less', color: 'text-[#1D365D]' };
        case 'js': 
        case 'cjs':
        case 'mjs': return { icon: 'fa-brands fa-js', color: 'text-[#F7DF1E]' }; 
        case 'ts': return { icon: 'fa-brands fa-js', color: 'text-[#3178C6]' }; // JS icon with TS blue
        case 'jsx': 
        case 'tsx': return { icon: 'fa-brands fa-react', color: 'text-[#61DAFB]' };
        case 'vue': return { icon: 'fa-brands fa-vuejs', color: 'text-[#4FC08D]' };
        case 'svelte': return { icon: 'fa-solid fa-code', color: 'text-[#FF3E00]' };
        case 'php': return { icon: 'fa-brands fa-php', color: 'text-[#777BB4]' };
        
        // Backend / Systems
        case 'py': 
        case 'pyc': return { icon: 'fa-brands fa-python', color: 'text-[#3776AB]' };
        case 'java': 
        case 'class': 
        case 'jar': return { icon: 'fa-brands fa-java', color: 'text-[#007396]' };
        case 'rb': return { icon: 'fa-regular fa-gem', color: 'text-[#CC342D]' };
        case 'go': return { icon: 'fa-brands fa-golang', color: 'text-[#00ADD8]' };
        case 'rs': return { icon: 'fa-brands fa-rust', color: 'text-[#DEA584]' };
        case 'swift': return { icon: 'fa-brands fa-swift', color: 'text-[#F05138]' };
        case 'c':
        case 'h': return { icon: 'fa-solid fa-c', color: 'text-[#555555]' };
        case 'cpp':
        case 'hpp':
        case 'cc': return { icon: 'fa-solid fa-c', color: 'text-[#00599C]' };
        case 'cs': return { icon: 'fa-solid fa-code', color: 'text-[#239120]' }; 

        // Scripts
        case 'sh': 
        case 'bash':
        case 'zsh': return { icon: 'fa-solid fa-terminal', color: 'text-gray-500' };
        case 'ps1': 
        case 'bat': 
        case 'cmd': return { icon: 'fa-solid fa-terminal', color: 'text-gray-500' };

        // Data / Config
        case 'json': return { icon: 'fa-solid fa-code', color: 'text-yellow-600' };
        case 'xml': return { icon: 'fa-solid fa-code', color: 'text-orange-500' };
        case 'yaml': 
        case 'yml': return { icon: 'fa-solid fa-list', color: 'text-purple-500' };
        case 'toml': 
        case 'ini': 
        case 'env': return { icon: 'fa-solid fa-gear', color: 'text-gray-500' };
        case 'sql': 
        case 'db': 
        case 'sqlite': return { icon: 'fa-solid fa-database', color: 'text-blue-400' };
        
        // Documents
        case 'md': return { icon: 'fa-brands fa-markdown', color: 'text-gray-700 dark:text-gray-300' };
        case 'txt': return { icon: 'fa-regular fa-file-lines', color: 'text-gray-400' };
        case 'pdf': return { icon: 'fa-regular fa-file-pdf', color: 'text-red-500' };
        case 'doc': 
        case 'docx': return { icon: 'fa-regular fa-file-word', color: 'text-blue-700' };
        case 'xls': 
        case 'xlsx': 
        case 'csv': return { icon: 'fa-regular fa-file-excel', color: 'text-green-600' };
        case 'ppt': 
        case 'pptx': return { icon: 'fa-regular fa-file-powerpoint', color: 'text-orange-600' };
        
        // Media
        case 'png': 
        case 'jpg': 
        case 'jpeg': 
        case 'gif': 
        case 'svg': 
        case 'ico': 
        case 'webp': return { icon: 'fa-regular fa-file-image', color: 'text-purple-500' };
        case 'mp3': 
        case 'wav': 
        case 'ogg': return { icon: 'fa-regular fa-file-audio', color: 'text-yellow-600' };
        case 'mp4': 
        case 'mov': 
        case 'avi': 
        case 'webm': return { icon: 'fa-regular fa-file-video', color: 'text-pink-600' };
        
        // Archives
        case 'zip': 
        case 'rar': 
        case '7z': 
        case 'tar': 
        case 'gz': return { icon: 'fa-regular fa-file-zipper', color: 'text-amber-600' };
        
        // Fonts
        case 'ttf':
        case 'otf':
        case 'woff':
        case 'woff2': return { icon: 'fa-solid fa-font', color: 'text-gray-500' };

        default: return { icon: 'fa-regular fa-file', color: 'text-gray-400 dark:text-gray-500' };
    }
};

const FileTreeNode: React.FC<{ 
    node: FileNode; 
    onFileSelect: (path: string) => void; 
    onDeleteFile: (path: string) => void; 
    onCopyPath: (path: string) => void; 
    onToggleExclude: (path: string) => void;
    level: number; 
    selectedFilePath: string | null; 
    showCharCount: boolean; 
}> = React.memo(({ node, onFileSelect, onDeleteFile, onCopyPath, onToggleExclude, level, selectedFilePath, showCharCount }) => {
  const [isOpen, setIsOpen] = React.useState(true);

  const handleToggle = () => {
    if (node.isDirectory) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = () => {
    if (!node.isDirectory && node.status === 'processed') {
      onFileSelect(node.path);
    } else if (node.isDirectory) {
      handleToggle();
    }
  };
  
  const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      onDeleteFile(node.path);
  }

  const handleToggleExcludeClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleExclude(node.path);
  }

  // Determine icon
  let iconElement;
  if (node.isDirectory) {
      iconElement = isOpen 
        ? <i className="fa-solid fa-folder-open w-5 text-center text-sky-500"></i> 
        : <i className="fa-solid fa-folder w-5 text-center text-sky-500"></i>;
  } else {
      const { icon, color } = getFileIcon(node.name);
      iconElement = <i className={`${icon} w-5 text-center ${color}`}></i>;
  }
  
  let statusClass = node.status === 'processed' || !node.status ? '' : 'cursor-default';
  let title = node.path;
  let displayName = node.name;
  const isSelected = !node.isDirectory && node.path === selectedFilePath;


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


  return (
    <li style={{ paddingLeft: `${level > 1 ? 1.25 : 0}rem` }} className="list-none">
      <div
        className={`group flex flex-col py-1 px-2 rounded-md cursor-pointer hover:bg-light-border dark:hover:bg-dark-border/50 transition-colors duration-150 ${statusClass} ${isSelected ? 'bg-primary/10 dark:bg-primary/20' : ''}`}
        onClick={handleSelect}
        title={title}
      >
        {/* Top Row: Icon, Name, Stats */}
        <div className="flex items-center space-x-2 w-full">
            {node.isDirectory && (
            <span className="w-4 text-center shrink-0" onClick={(e) => { e.stopPropagation(); handleToggle(); }}>
                <i className={`fa-solid fa-chevron-down text-xs transition-transform duration-200 text-light-subtle-text dark:text-dark-subtle-text ${isOpen ? 'rotate-0' : '-rotate-90'}`}></i>
            </span>
            )}
            {!node.isDirectory && <span className="w-4 shrink-0"></span>}
            
            <span className="shrink-0">{iconElement}</span>
            
            <span className={`truncate text-sm flex-1 ${node.excluded ? 'line-through' : ''}`}>{displayName}</span>
            
            {!node.isDirectory && node.status === 'processed' && (
                <div className={`flex items-center space-x-2 text-xs text-light-subtle-text dark:text-dark-subtle-text shrink-0 ml-2 transition-opacity ${showCharCount ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    {typeof node.chars === 'number' && (
                        <span title={`${node.chars} 个字符`}>{node.chars}</span>
                    )}
                    {typeof node.lines === 'number' && (
                        <span className="border-l border-light-border dark:border-dark-border pl-2" title={`${node.lines} 行`}>{node.lines}</span>
                    )}
                </div>
            )}
        </div>

        {/* Bottom Row: Action Buttons (Only for files, on Hover) */}
        {!node.isDirectory && (
            <div className="hidden group-hover:flex items-center space-x-2 pl-9 mt-1.5 pb-0.5 animate-enter origin-top w-full overflow-x-auto no-scrollbar">
                <button 
                    onClick={(e) => { e.stopPropagation(); onCopyPath(node.path); }}
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
                        title={node.excluded ? "包含此文件" : "从分析中排除"}
                    >
                        <i className={`fa-solid ${node.excluded ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                        <span>{node.excluded ? "包含" : "排除"}</span>
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
      {node.isDirectory && isOpen && (
        <ul className="pl-0">
          {node.children.map(child => (
            <FileTreeNode key={child.path} node={child} onFileSelect={onFileSelect} onDeleteFile={onDeleteFile} onCopyPath={onCopyPath} onToggleExclude={onToggleExclude} level={level + 1} selectedFilePath={selectedFilePath} showCharCount={showCharCount} />
          ))}
        </ul>
      )}
    </li>
  );
});

const FileTree: React.FC<FileTreeProps> = ({ nodes, onFileSelect, onDeleteFile, onCopyPath, onToggleExclude, selectedFilePath, showCharCount }) => {
  if (!nodes || nodes.length === 0) {
    return <div className="p-4 text-center text-sm text-light-subtle-text dark:text-dark-subtle-text">未加载文件。</div>;
  }
  return (
    <div className="p-2">
      <h3 className="text-xs font-semibold px-2 mb-2 text-light-subtle-text dark:text-dark-subtle-text uppercase tracking-wider">资源管理器</h3>
      <ul className="pl-0">
        {nodes.map(node => (
          <FileTreeNode key={node.path} node={node} onFileSelect={onFileSelect} onDeleteFile={onDeleteFile} onCopyPath={onCopyPath} onToggleExclude={onToggleExclude} level={1} selectedFilePath={selectedFilePath} showCharCount={showCharCount} />
        ))}
      </ul>
    </div>
  );
};

export default React.memo(FileTree);
