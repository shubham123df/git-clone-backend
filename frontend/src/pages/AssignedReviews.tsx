import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import type { PullRequest, PrStatus } from '../types';
import { GitPullRequest, Clock, CheckCircle2, MessageSquare } from 'lucide-react';
import clsx from 'clsx';

const statusColors: Record<PrStatus, string> = {
  OPEN: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  IN_REVIEW: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  CHANGES_REQUESTED: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  APPROVED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  READY_FOR_DEPLOYMENT: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
  DEPLOYED: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
};

type Filter = 'pending' | 'changes_requested' | 'approved' | '';

function formatTimeAgo(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const sec = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (sec < 60) return 'just now';
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

export default function AssignedReviews() {
  const user = useAuthStore((s) => s.user);
  const [prs, setPrs] = useState<PullRequest[]>([]);
  const [filter, setFilter] = useState<Filter>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return setLoading(false);
    api.get<{ data: PullRequest[] }>(`/pull-requests?reviewerId=${user.id}&limit=100`).then((r) => {
      setPrs(r.data.data || []);
    }).catch(() => setPrs([])).finally(() => setLoading(false));
  }, [user?.id]);

  const assigned = prs.filter((pr) => pr.reviewers?.some((r) => r.user.id === user?.id));
  const withReview = (pr: PullRequest) => pr.reviews?.find((r) => r.userId === user?.id);
  const filtered =
    filter === 'pending'
      ? assigned.filter((pr) => !withReview(pr))
      : filter === 'changes_requested'
        ? assigned.filter((pr) => withReview(pr)?.decision === 'CHANGES_REQUESTED')
        : filter === 'approved'
          ? assigned.filter((pr) => withReview(pr)?.decision === 'APPROVED')
          : assigned;

  if (loading) return <div className="py-12 text-center text-slate-500">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Assigned reviews</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        PRs assigned to you. Review or add comments.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {(['', 'pending', 'changes_requested', 'approved'] as const).map((f) => (
          <button
            key={f || 'all'}
            type="button"
            onClick={() => setFilter(f)}
            className={clsx(
              'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
              filter === f
                ? 'border-[#238636] bg-[#238636]/10 text-[#238636] dark:border-[#3fb950] dark:bg-[#3fb950]/20 dark:text-[#3fb950]'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            )}
          >
            {f === '' ? 'All' : f === 'pending' ? 'Pending' : f === 'changes_requested' ? 'Changes requested' : 'Approved'}
          </button>
        ))}
      </div>
      <div className="mt-6 space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white py-16 text-center dark:border-slate-700 dark:bg-[#161b22]">
            <ClipboardList className="mx-auto h-12 w-12 text-slate-400" />
            <p className="mt-4 text-slate-600 dark:text-slate-400">No assigned reviews</p>
            <Link to="/pull-requests" className="mt-2 inline-block text-sm text-[#238636] hover:underline dark:text-[#3fb950]">
              Browse pull requests
            </Link>
          </div>
        ) : (
          filtered.map((pr) => {
            const review = withReview(pr);
            const assignedAt = pr.reviewers?.find((r) => r.user.id === user?.id);
            return (
              <Link
                key={pr.id}
                to={`/pull-requests/${pr.id}`}
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow dark:border-slate-700 dark:bg-[#161b22]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700">
                  <GitPullRequest className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900 dark:text-slate-100">{pr.title}</p>
                  <p className="mt-0.5 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>{pr.author?.name || pr.author?.email}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {assignedAt ? formatTimeAgo((assignedAt as { assignedAt?: string }).assignedAt || pr.createdAt) : formatTimeAgo(pr.createdAt)}
                    </span>
                    {pr._count?.reviews != null && (
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {pr._count.reviews} review(s)
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {review ? (
                    <span className={clsx('flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium', statusColors[pr.status])}>
                      <CheckCircle2 className="h-3 w-3" />
                      {review.decision.replace('_', ' ')}
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                      Pending
                    </span>
                  )}
                  <span className={clsx('rounded-full px-2.5 py-0.5 text-xs font-medium', statusColors[pr.status])}>
                    {pr.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

