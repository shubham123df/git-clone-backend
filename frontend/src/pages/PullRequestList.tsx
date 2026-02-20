import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import type { PullRequest, PrStatus } from '../types';
import { GitPullRequest, Plus, Search, Clock, User, GitBranch, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

const statusColors: Record<PrStatus, string> = {
  OPEN: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  IN_REVIEW: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  CHANGES_REQUESTED: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  APPROVED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  READY_FOR_DEPLOYMENT: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
  DEPLOYED: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
};

const statusIcons: Record<PrStatus, any> = {
  OPEN: GitPullRequest,
  IN_REVIEW: Clock,
  CHANGES_REQUESTED: AlertCircle,
  APPROVED: CheckCircle,
  READY_FOR_DEPLOYMENT: CheckCircle,
  DEPLOYED: CheckCircle,
};

export default function PullRequestList() {
  const [list, setList] = useState<{ data: PullRequest[]; total: number } | null>(null);
  const [status, setStatus] = useState<PrStatus | ''>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'recent' | 'older'>('recent');
  const limit = 20;

  useEffect(() => {
    // Real API call
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    params.set('page', String(page));
    params.set('limit', String(limit));
    params.set('sort', sortBy);
    
    api.get<{ data: PullRequest[]; total: number }>(`/pull-requests?${params}`)
      .then((r) => setList(r.data))
      .catch((err) => {
        console.error('Error fetching PRs:', err);
        // Set empty list on error
        setList({ data: [], total: 0 });
      });
  }, [status, search, page, sortBy]);

  if (!list) return (
    <div className="flex justify-center py-12">
      <div className="flex items-center gap-2 text-slate-500">
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        Loading...
      </div>
    </div>
  );

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return past.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Pull Requests
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage and review code changes
          </p>
        </div>
        <Link to="/pull-requests/new" className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New PR
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#161b22] p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <GitPullRequest className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Open</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {list.data.filter(pr => pr.status === 'OPEN').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#161b22] p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">In Review</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {list.data.filter(pr => pr.status === 'IN_REVIEW').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#161b22] p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Approved</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {list.data.filter(pr => pr.status === 'APPROVED').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#161b22] p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <GitPullRequest className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {list.total}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-[#161b22] p-4 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search pull requests..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'recent' | 'older')}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="recent">Most Recent</option>
            <option value="older">Oldest First</option>
          </select>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            type="button"
            onClick={() => setStatus('')}
            className={clsx('rounded-lg px-3 py-1.5 text-sm font-medium transition-colors', 
              !status ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            )}
          >
            All ({list.total})
          </button>
          {(Object.keys(statusColors) as PrStatus[]).map((s) => {
            const count = list.data.filter(pr => pr.status === s).length;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={clsx('rounded-lg px-3 py-1.5 text-sm font-medium transition-colors flex items-center gap-2', 
                  status === s ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                )}
              >
                {(() => {
                  const Icon = statusIcons[s];
                  return <Icon className="w-3 h-3" />;
                })()}
                {s.replace(/_/g, ' ')} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Pull Requests List */}
      <div className="space-y-3">
        {list.data.length === 0 ? (
          <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center py-16 text-center">
            <GitPullRequest className="mb-4 h-12 w-12 text-slate-400" />
            <p className="text-slate-600 dark:text-slate-400 mb-2">No pull requests found.</p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mb-4">
              {status ? `No PRs with status "${status.replace(/_/g, ' ')}"` : 'Create your first pull request to get started'}
            </p>
            <Link to="/pull-requests/new" className="btn-primary">
              Create Pull Request
            </Link>
          </div>
        ) : (
          list.data.map((pr) => (
            <Link
              key={pr.id}
              to={`/pull-requests/${pr.id}`}
              className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-slate-700 p-6 transition-all hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="truncate font-semibold text-slate-900 dark:text-slate-100 text-lg">
                      {pr.title}
                    </h3>
                    <span className={clsx('rounded-full px-2.5 py-0.5 text-xs font-medium', statusColors[pr.status])}>
                      {pr.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-3">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{pr.author?.name || pr.author?.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GitBranch className="w-4 h-4" />
                      <span>{pr.sourceBranch} → {pr.targetBranch}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{pr.createdAt ? getTimeAgo(pr.createdAt) : 'Unknown time'}</span>
                    </div>
                  </div>
                  
                  {pr.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                      {pr.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
                    {pr._count?.reviews !== undefined && (
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{pr._count.reviews} review{pr._count.reviews !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {pr.comments && pr.comments.length > 0 && (
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{pr.comments.length} comment{pr.comments.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Pagination */}
      {list.total > limit && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, list.total)} of {list.total} results
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="flex items-center px-4 text-sm text-slate-600 dark:text-slate-400">
              Page {page} of {Math.ceil(list.total / limit)}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(list.total / limit)}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
