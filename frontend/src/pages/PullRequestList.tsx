import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import type { PullRequest, PrStatus } from '../types';
import { GitPullRequest, Plus } from 'lucide-react';
import clsx from 'clsx';

const statusColors: Record<PrStatus, string> = {
  OPEN: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  IN_REVIEW: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  CHANGES_REQUESTED: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  APPROVED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  READY_FOR_DEPLOYMENT: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
  DEPLOYED: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
};

export default function PullRequestList() {
  const [list, setList] = useState<{ data: PullRequest[]; total: number } | null>(null);
  const [status, setStatus] = useState<PrStatus | ''>('');
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    params.set('page', String(page));
    params.set('limit', String(limit));
    api.get<{ data: PullRequest[]; total: number }>(`/pull-requests?${params}`).then((r) => setList(r.data));
  }, [status, page]);

  if (!list) return <div className="flex justify-center py-12"><span className="text-slate-500">Loading...</span></div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Pull Requests</h1>
        <Link to="/pull-requests/new" className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New PR
        </Link>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStatus('')}
          className={clsx('rounded-lg px-3 py-1.5 text-sm font-medium', !status ? 'btn-primary' : 'btn-ghost')}
        >
          All
        </button>
        {(Object.keys(statusColors) as PrStatus[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={clsx('rounded-lg px-3 py-1.5 text-sm font-medium', status === s ? 'btn-primary' : 'btn-ghost')}
          >
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {list.data.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-16 text-center">
            <GitPullRequest className="mb-4 h-12 w-12 text-slate-400" />
            <p className="text-slate-600 dark:text-slate-400">No pull requests yet.</p>
            <Link to="/pull-requests/new" className="btn-primary mt-4">
              Create your first PR
            </Link>
          </div>
        ) : (
          list.data.map((pr) => (
            <Link
              key={pr.id}
              to={`/pull-requests/${pr.id}`}
              className="card flex items-center justify-between gap-4 p-4 transition-shadow hover:shadow-md"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-900 dark:text-slate-100">{pr.title}</p>
                <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">
                  {pr.author?.name || pr.author?.email} · {pr.sourceBranch} → {pr.targetBranch}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {pr._count && (
                  <span className="text-sm text-slate-500">{pr._count.reviews} review(s)</span>
                )}
                <span className={clsx('rounded-full px-2.5 py-0.5 text-xs font-medium', statusColors[pr.status])}>
                  {pr.status.replace(/_/g, ' ')}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
      {list.total > limit && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary"
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
            className="btn-secondary"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
