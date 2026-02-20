import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getApiErrorMessage } from '../lib/errorMessage';
import api from '../lib/api';
import {
  GitPullRequest,
  GitBranch,
  MessageSquare,
  CheckCircle2,
  XCircle,
  FileText,
  Eye,
  Edit,
  MoreHorizontal,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import FileDiffViewer from '../components/FileDiffViewer';
import LiveCodeReview from '../components/LiveCodeReview';
import { CommentSection } from '../components/CommentSection';
import { PermissionGate, ActionButton } from '../components/RoleBasedUI';

interface PRDetail {
  id: string;
  title: string;
  description: string;
  author: {
    name: string;
    email: string;
    avatar?: string;
  };
  status: 'open' | 'closed' | 'merged' | 'draft';
  sourceBranch: string;
  targetBranch: string;
  createdAt: string;
  updatedAt: string;
  reviewers: Array<{
    name: string;
    email: string;
    status: 'approved' | 'changes_requested' | 'pending';
  }>;
  assignees: Array<{
    name: string;
    email: string;
  }>;
  labels: Array<{
    name: string;
    color: string;
  }>;
  additions: number;
  deletions: number;
  changedFiles: number;
  comments: number;
  approvals: number;
  changesRequested: number;
  mergeable?: boolean;
  conflicts?: boolean;
}

interface FileDiff {
  fileName: string;
  filePath: string;
  changeType: 'added' | 'removed' | 'modified' | 'renamed';
  additions: number;
  deletions: number;
  lines: Array<{
    lineNumber: number;
    type: 'added' | 'removed' | 'unchanged' | 'context';
    content: string;
    oldLineNumber?: number;
    newLineNumber?: number;
  }>;
}

export default function PRDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  
  const [pr, setPR] = useState<PRDetail | null>(null);
  const [fileDiffs, setFileDiffs] = useState<FileDiff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'commits' | 'review'>('overview');
  const [showLiveReview, setShowLiveReview] = useState(false);

  useEffect(() => {
    if (id) {
      loadPRDetail(id);
      loadFileDiffs();
    }
  }, [id]);

  const loadPRDetail = async (prId: string) => {
    try {
      setLoading(true);
      
      // Real API call to backend
      const { data } = await api.get(`/pull-requests/${prId}`);
      setPR(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load PR details'));
    } finally {
      setLoading(false);
    }
  };

  const loadFileDiffs = async () => {
    try {
      // Simulate file diffs
      const mockDiffs: FileDiff[] = [
        {
          fileName: 'auth.service.ts',
          filePath: 'src/services/auth.service.ts',
          changeType: 'added',
          additions: 85,
          deletions: 0,
          lines: [
            { lineNumber: 1, type: 'added', content: 'import jwt from \'jsonwebtoken\';', newLineNumber: 1 },
            { lineNumber: 2, type: 'added', content: 'import bcrypt from \'bcrypt\';', newLineNumber: 2 },
            { lineNumber: 3, type: 'added', content: 'import { User } from \'../models/user.model\';', newLineNumber: 3 },
            { lineNumber: 4, type: 'added', content: '', newLineNumber: 4 },
            { lineNumber: 5, type: 'added', content: 'export class AuthService {', newLineNumber: 5 },
            { lineNumber: 6, type: 'added', content: '  async login(email: string, password: string): Promise<string> {', newLineNumber: 6 },
            { lineNumber: 7, type: 'added', content: '    const user = await User.findOne({ email });', newLineNumber: 7 },
            { lineNumber: 8, type: 'added', content: '    if (!user || !await bcrypt.compare(password, user.password)) {', newLineNumber: 8 },
            { lineNumber: 9, type: 'added', content: '      throw new Error(\'Invalid credentials\');', newLineNumber: 9 },
            { lineNumber: 10, type: 'added', content: '    }', newLineNumber: 10 },
          ]
        },
        {
          fileName: 'auth.middleware.ts',
          filePath: 'src/middleware/auth.middleware.ts',
          changeType: 'added',
          additions: 45,
          deletions: 0,
          lines: [
            { lineNumber: 1, type: 'added', content: 'import { Request, Response, NextFunction } from \'express\';', newLineNumber: 1 },
            { lineNumber: 2, type: 'added', content: 'import jwt from \'jsonwebtoken\';', newLineNumber: 2 },
            { lineNumber: 3, type: 'added', content: '', newLineNumber: 3 },
            { lineNumber: 4, type: 'added', content: 'export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {', newLineNumber: 4 },
            { lineNumber: 5, type: 'added', content: '  const authHeader = req.headers[\'authorization\'];', newLineNumber: 5 },
            { lineNumber: 6, type: 'added', content: '  const token = authHeader && authHeader.split(\' \')[1];', newLineNumber: 6 },
          ]
        }
      ];
      
      setFileDiffs(mockDiffs);
    } catch (err) {
      console.error('Failed to load file diffs:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <GitPullRequest className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'merged':
        return <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'closed':
        return <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case 'draft':
        return <Edit className="w-4 h-4 text-slate-600 dark:text-slate-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-600 dark:text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'merged':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'closed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'draft':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300';
    }
  };

  const getReviewerStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'changes_requested':
        return <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          Loading PR details...
        </div>
      </div>
    );
  }

  if (error || !pr) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {error || 'Pull request not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            {getStatusIcon(pr.status)}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {pr.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pr.status)}`}>
                  {pr.status.toUpperCase()}
                </span>
                <span>#{pr.id}</span>
                <span>by {pr.author.name}</span>
                <span>opened {new Date(pr.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <PermissionGate permission="merge:pr">
              <ActionButton 
                permission="merge:pr"
                className="bg-green-600 hover:bg-green-700"
                disabled={pr.status !== 'open' || pr.approvals === 0}
              >
                Merge PR
              </ActionButton>
            </PermissionGate>
            <button className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Branch Info */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-slate-500" />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {pr.sourceBranch}
            </span>
          </div>
          <span className="text-slate-400">→</span>
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-slate-500" />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {pr.targetBranch}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {pr.changedFiles} files
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400">+{pr.additions}</span>
              <span className="text-red-600 dark:text-red-400">-{pr.deletions}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {pr.comments} comments
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {pr.approvals} approvals
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {pr.mergeable && (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Mergeable</span>
              </div>
            )}
            {pr.conflicts && (
              <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">Conflicts</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'files', label: 'Files Changed', icon: FileText },
            { id: 'commits', label: 'Commits', icon: GitBranch },
            { id: 'review', label: 'Live Review', icon: MessageSquare }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Description
                  </h2>
                  <PermissionGate permission="write:code">
                    <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                      <Edit className="w-4 h-4" />
                    </button>
                  </PermissionGate>
                </div>
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                    {pr.description}
                  </pre>
                </div>
              </div>

              {/* Reviewers */}
              <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Reviewers
                </h2>
                <div className="space-y-3">
                  {pr.reviewers.map((reviewer, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-sm font-medium">
                          {reviewer.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-slate-100">
                            {reviewer.name}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {reviewer.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getReviewerStatusIcon(reviewer.status)}
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {reviewer.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Labels */}
              <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Labels
                </h3>
                <div className="flex flex-wrap gap-2">
                  {pr.labels.map((label, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: label.color + '20', color: label.color }}
                    >
                      {label.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Assignees */}
              <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Assignees
                </h3>
                <div className="space-y-2">
                  {pr.assignees.map((assignee, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-xs font-medium">
                        {assignee.name.charAt(0)}
                      </div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {assignee.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'files' && (
          <FileDiffViewer 
            diffs={fileDiffs} showStats enableSearch />
        )}

        {activeTab === 'commits' && (
          <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Commits
            </h2>
            <div className="space-y-4">
              {/* Mock commits */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-sm font-medium">
                    J
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      feat: add authentication service
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      John Doe committed 2 hours ago
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'review' && (
          <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="border-b border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Live Code Review
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowLiveReview(!showLiveReview)}
                    className={`flex items-center gap-2 px-3 py-1 text-sm rounded-lg ${
                      showLiveReview 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <Zap className="w-3 h-3" />
                    {showLiveReview ? 'Live Mode On' : 'Live Mode Off'}
                  </button>
                </div>
              </div>
            </div>
            
            <LiveCodeReview
              fileName="auth.service.ts"
              code={fileDiffs[0]?.lines.map(l => l.content).join('\n') || ''}
              language="typescript"
              enableAI={true}
              enableCollaboration={true}
              currentUser={{
                name: user?.name || 'Current User',
                role: user?.role?.toLowerCase() as any || 'developer'
              }}
            />
          </div>
        )}

        {/* Comments Section */}
        {activeTab === 'overview' && (
          <CommentSection pullRequestId={id!} />
        )}
      </div>
    </div>
  );
}
