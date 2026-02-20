import { useState } from 'react';
import { 
  Plus, 
  Minus, 
  FileText, 
  ChevronDown, 
  ChevronRight,
  Copy,
  Check,
  Eye,
  EyeOff,
  Search,
  Filter,
  File as FileIcon
} from 'lucide-react';

interface DiffLine {
  lineNumber: number;
  type: 'added' | 'removed' | 'unchanged' | 'context';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

interface FileDiff {
  fileName: string;
  filePath: string;
  changeType: 'added' | 'removed' | 'modified' | 'renamed';
  additions: number;
  deletions: number;
  lines: DiffLine[];
  oldContent?: string;
  newContent?: string;
}

interface FileDiffViewerProps {
  diffs: FileDiff[];
  showStats?: boolean;
  enableSearch?: boolean;
}

export default function FileDiffViewer({ 
  diffs, 
  showStats = true, 
  enableSearch = true
}: FileDiffViewerProps) {
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const [copiedContent, setCopiedContent] = useState<string>('');
  const [showWhitespace, setShowWhitespace] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'added' | 'removed' | 'modified'>('all');

  const totalAdditions = diffs.reduce((sum, diff) => sum + diff.additions, 0);
  const totalDeletions = diffs.reduce((sum, diff) => sum + diff.deletions, 0);

  const toggleFileExpansion = (filePath: string) => {
    setExpandedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(filePath)) {
        newSet.delete(filePath);
      } else {
        newSet.add(filePath);
      }
      return newSet;
    });
  };

  const copyToClipboard = async (content: string, label: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedContent(label);
      setTimeout(() => setCopiedContent(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getLineClassName = (line: DiffLine) => {
    const baseClass = 'px-4 text-sm font-mono whitespace-pre';
    switch (line.type) {
      case 'added':
        return `${baseClass} bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-300`;
      case 'removed':
        return `${baseClass} bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-300`;
      case 'context':
        return `${baseClass} bg-slate-50 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300`;
      default:
        return `${baseClass} text-slate-800 dark:text-slate-200`;
    }
  };

  const getLinePrefix = (line: DiffLine) => {
    switch (line.type) {
      case 'added':
        return '+';
      case 'removed':
        return '-';
      case 'context':
        return ' ';
      default:
        return ' ';
    }
  };

  const getFileIcon = (changeType: string) => {
    switch (changeType) {
      case 'added':
        return <Plus className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'removed':
        return <Minus className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case 'modified':
        return <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'renamed':
        return <FileIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      default:
        return <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />;
    }
  };

  const filteredDiffs = diffs.filter(diff => {
    if (filterType === 'all') return true;
    return diff.changeType === filterType;
  }).filter(diff => 
    searchQuery === '' || 
    diff.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    diff.filePath.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const expandAll = () => {
    setExpandedFiles(new Set(diffs.map(d => d.filePath)));
  };

  const collapseAll = () => {
    setExpandedFiles(new Set());
  };

  return (
    <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-300 dark:text-slate-600" />
            File Changes
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Expand All
            </button>
            <span className="text-slate-400 dark:text-slate-500">•</span>
            <button
              onClick={collapseAll}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Stats */}
        {showStats && (
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {totalAdditions} additions
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {totalDeletions} deletions
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {diffs.length} files changed
              </span>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap gap-2">
          {enableSearch && (
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="all">All Changes</option>
              <option value="added">Added</option>
              <option value="removed">Removed</option>
              <option value="modified">Modified</option>
            </select>
          </div>

          <button
            onClick={() => setShowWhitespace(!showWhitespace)}
            className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {showWhitespace ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            Whitespace
          </button>
        </div>
      </div>

      {/* File List */}
      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {filteredDiffs.map((diff) => {
          const isExpanded = expandedFiles.has(diff.filePath);
          
          return (
            <div key={diff.filePath} className="border-b border-slate-200 dark:border-slate-700 last:border-b-0">
              {/* File Header */}
              <div
                className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                onClick={() => toggleFileExpansion(diff.filePath)}
              >
                <div className="flex items-center gap-3">
                  <button className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  {getFileIcon(diff.changeType)}
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {diff.fileName}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {diff.filePath}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 text-sm">
                    {diff.additions > 0 && (
                      <span className="text-green-600 dark:text-green-400">
                        +{diff.additions}
                      </span>
                    )}
                    {diff.deletions > 0 && (
                      <span className="text-red-600 dark:text-red-400">
                        -{diff.deletions}
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(diff.newContent || diff.lines.map(l => l.content).join('\n'), diff.filePath);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                  >
                    {copiedContent === diff.filePath ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Diff Content */}
              {isExpanded && (
                <div className="border-t border-slate-200 dark:border-slate-700">
                  <div className="overflow-x-auto">
                    <div className="text-xs font-mono">
                      {diff.lines.map((line, index) => (
                        <div key={index} className={getLineClassName(line)}>
                          <div className="flex gap-4">
                            <span className="text-slate-400 dark:text-slate-500 select-none w-8 text-right">
                              {line.newLineNumber || ''}
                            </span>
                            <span className="text-slate-400 dark:text-slate-500 select-none w-8 text-right">
                              {line.oldLineNumber || ''}
                            </span>
                            <span className="flex-1">
                              {showWhitespace ? (
                                <span className="text-slate-300 dark:text-slate-600">
                                  {getLinePrefix(line)}
                                </span>
                              ) : null}
                              {line.content}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        {filteredDiffs.length === 0 && (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <p>No files match your current filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
