import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { getApiErrorMessage } from '../lib/errorMessage';
import { useAuthStore } from '../store/authStore';
import type { PullRequest, DeploymentReadiness, Review, ReviewDecision, PrStatus } from '../types';
import {
  GitPullRequest,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  MessageSquare,
  AlertCircle,
  Ship,
  UserPlus,
} from 'lucide-react';
import clsx from 'clsx';

const statusColors: Record<PrStatus, string> = {
  OPEN: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  IN_REVIEW: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  CHANGES_REQUESTED: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  APPROVED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  READY_FOR_DEPLOYMENT: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
  DEPLOYED: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
};

const decisionColors: Record<ReviewDecision, string> = {
  APPROVED: 'text-emerald-600 dark:text-emerald-400',
  CHANGES_REQUESTED: 'text-amber-600 dark:text-amber-400',
  REJECTED: 'text-red-600 dark:text-red-400',
};

export default function PullRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const [pr, setPr] = useState<PullRequest | null>(null);
  const [readiness, setReadiness] = useState<DeploymentReadiness | null>(null);
  const [reviewersUserIds, setReviewersUserIds] = useState<string[]>([]);
  const [users, setUsers] = useState<{ id: string; email: string; name: string | null; role: string }[]>([]);
  const [commentBody, setCommentBody] = useState('');
  const [reviewDecision, setReviewDecision] = useState<ReviewDecision>('APPROVED');
  const [reviewBody, setReviewBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [checklistSaving, setChecklistSaving] = useState(false);
  const [statusError, setStatusError] = useState('');

  useEffect(() => {
    if (!id) return;
    api.get<PullRequest>(`/pull-requests/${id}`).then((r) => setPr(r.data));
    api.get<DeploymentReadiness>(`/pull-requests/${id}/deployment`).then((r) => setReadiness(r.data));
    api.get<{ data: { id: string; email: string; name: string | null; role: string }[] }>('/users?limit=100').then((r) => setUsers(r.data?.data ?? [])).catch(() => setUsers([]));
  }, [id]);

  const assignReviewers = () => {
    if (!id || reviewersUserIds.length === 0) return;
    setLoading(true);
    api.post(`/pull-requests/${id}/reviewers`, { userIds: reviewersUserIds })
      .then((r) => setPr(r.data))
      .finally(() => setLoading(false));
  };

  const submitReview = () => {
    if (!id) return;
    setLoading(true);
    api.post(`/pull-requests/${id}/reviews`, { decision: reviewDecision, body: reviewBody || undefined })
      .then(() => {
        api.get<PullRequest>(`/pull-requests/${id}`).then((r) => setPr(r.data));
        api.get<DeploymentReadiness>(`/pull-requests/${id}/deployment`).then((r) => setReadiness(r.data));
      })
      .finally(() => setLoading(false));
  };

  const submitComment = () => {
    if (!id || !commentBody.trim()) return;
    setLoading(true);
    api.post(`/pull-requests/${id}/comments`, { body: commentBody })
      .then(() => api.get<PullRequest>(`/pull-requests/${id}`).then((r) => setPr(r.data)))
      .finally(() => { setCommentBody(''); setLoading(false); });
  };

  const markReady = () => {
    if (!id) return;
    api.post(`/pull-requests/${id}/deployment/ready`).then(() => {
      api.get<DeploymentReadiness>(`/pull-requests/${id}/deployment`).then((r) => setReadiness(r.data));
      api.get<PullRequest>(`/pull-requests/${id}`).then((r) => setPr(r.data));
    });
  };

  const markDeployed = () => {
    if (!id) return;
    api.post(`/pull-requests/${id}/deployment/deploy`).then(() => {
      api.get<DeploymentReadiness>(`/pull-requests/${id}/deployment`).then((r) => setReadiness(r.data));
      api.get<PullRequest>(`/pull-requests/${id}`).then((r) => setPr(r.data));
    });
  };

  const changeStatus = (newStatus: PrStatus) => {
    if (!id || newStatus === pr?.status) return;
    setStatusError('');
    setStatusLoading(true);
    api.patch(`/pull-requests/${id}/status`, { status: newStatus })
      .then((r) => {
        setPr(r.data);
        api.get<DeploymentReadiness>(`/pull-requests/${id}/deployment`).then((res) => setReadiness(res.data));
      })
      .catch((err) => setStatusError(getApiErrorMessage(err, 'Failed to update status')))
      .finally(() => setStatusLoading(false));
  };

  const toggleChecklistItem = (index: number) => {
    if (!id || !pr || !canEditChecklist) return;
    const next = checklist.map((item, i) => (i === index ? { ...item, done: !item.done } : item));
    setChecklistSaving(true);
    api.patch(`/pull-requests/${id}`, { checklist: next, version: pr.version })
      .then((r) => {
        setPr(r.data);
        api.get<DeploymentReadiness>(`/pull-requests/${id}/deployment`).then((res) => setReadiness(res.data));
      })
      .finally(() => setChecklistSaving(false));
  };

  if (!pr) return <div className="py-12 text-center text-slate-500">Loading...</div>;

  const checklist = (pr.checklist as { label: string; done?: boolean }[]) ?? [];
  const isAuthor = pr.authorId === user?.id;
  const isReviewer = pr.reviewers?.some((r) => r.user.id === user?.id);
  const hasReviewed = pr.reviews?.some((r) => r.userId === user?.id);
  const canSubmitReview = isReviewer && !hasReviewed;
  const canChangeStatus = Boolean(user?.id && (isAuthor || isReviewer || user?.role === 'ADMIN' || user?.role === 'RELEASE_MANAGER'));
  const canEditChecklist = isAuthor || user?.role === 'ADMIN';
  const allStatuses: PrStatus[] = ['OPEN', 'IN_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'READY_FOR_DEPLOYMENT', 'DEPLOYED'];

  return (
    <div className="space-y-6">
      <Link to="/pull-requests" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400">
        <ChevronLeft className="h-4 w-4" />
        Back to list
      </Link>
      <div className="card overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{pr.title}</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {pr.author?.name || pr.author?.email} · {pr.sourceBranch} → {pr.targetBranch}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={clsx('rounded-full px-3 py-1 text-sm font-medium', statusColors[pr.status])}>
                {pr.status.replace(/_/g, ' ')}
              </span>
              {canChangeStatus && pr.status !== 'DEPLOYED' && (
                <select
                  value={pr.status}
                  onChange={(e) => changeStatus(e.target.value as PrStatus)}
                  disabled={statusLoading}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                >
                  {allStatuses.map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
          {statusError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{statusError}</p>}
          {pr.description && (
            <p className="mt-4 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-400">{pr.description}</p>
          )}
          <a
            href={pr.repositoryLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-sm text-brand-600 hover:underline dark:text-brand-400"
          >
            <GitPullRequest className="h-4 w-4" />
            {pr.repositoryLink}
          </a>
        </div>

        {/* Deployment Readiness */}
        {readiness && (
          <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
            <h2 className="mb-3 flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
              <Ship className="h-5 w-5" />
              Deployment Readiness
            </h2>
            <div className="flex flex-wrap gap-4">
              <span className={clsx('flex items-center gap-1.5 text-sm', readiness.checklistComplete ? 'text-emerald-600' : 'text-slate-500')}>
                {readiness.checklistComplete ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                Checklist {readiness.checklistComplete ? 'complete' : `${readiness.checklistTotal} items`}
              </span>
              <span className={clsx('flex items-center gap-1.5 text-sm', readiness.approvalStatus === 'approved' ? 'text-emerald-600' : readiness.approvalStatus === 'rejected' ? 'text-red-600' : 'text-slate-500')}>
                {readiness.approvalStatus === 'approved' ? <CheckCircle2 className="h-4 w-4" /> : readiness.approvalStatus === 'rejected' ? <XCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                Approval: {readiness.approvalStatus}
              </span>
              {readiness.ciPassed !== null && (
                <span className={clsx('text-sm', readiness.ciPassed ? 'text-emerald-600' : 'text-amber-600')}>
                  CI: {readiness.ciPassed ? 'Passed' : 'Failed'}
                </span>
              )}
            </div>
            {readiness.blockers.length > 0 && (
              <ul className="mt-2 list-inside list-disc text-sm text-red-600 dark:text-red-400">
                {readiness.blockers.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            )}
            {readiness.warnings.length > 0 && (
              <ul className="mt-1 list-inside list-disc text-sm text-amber-600 dark:text-amber-400">
                {readiness.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            )}
            <div className="mt-3 flex items-center gap-2">
              <span className={clsx('rounded-lg px-3 py-1.5 text-sm font-medium', readiness.ready ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400')}>
                {readiness.ready ? 'Ready for deployment' : 'Not ready'}
              </span>
              {(user?.role === 'ADMIN' || user?.role === 'RELEASE_MANAGER') && (
                <>
                  {readiness.ready && pr.status !== 'DEPLOYED' && (
                    <button type="button" onClick={markReady} className="btn-secondary text-sm">
                      Refresh readiness
                    </button>
                  )}
                  {readiness.ready && pr.status !== 'DEPLOYED' && (
                    <button type="button" onClick={markDeployed} className="btn-primary text-sm">
                      Mark deployed
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Reviewers */}
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <h2 className="mb-3 flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
            <UserPlus className="h-5 w-5" />
            Reviewers
          </h2>
          <div className="flex flex-wrap gap-2">
            {pr.reviewers?.map((r) => (
              <span key={r.id} className="rounded-full bg-slate-200 px-2.5 py-0.5 text-sm dark:bg-slate-700">
                {r.user.name || r.user.email}
              </span>
            ))}
          </div>
          {(isAuthor || user?.role === 'ADMIN' || user?.role === 'RELEASE_MANAGER') && users.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <select
                multiple
                value={reviewersUserIds}
                onChange={(e) => setReviewersUserIds(Array.from(e.target.selectedOptions, (o) => o.value))}
                className="input max-h-24 min-w-[200px]"
              >
                {users.filter((u) => !pr.reviewers?.some((r) => r.user.id === u.id)).map((u) => (
                  <option key={u.id} value={u.id}>{u.name || u.email}</option>
                ))}
              </select>
              <button type="button" onClick={assignReviewers} className="btn-primary" disabled={loading || reviewersUserIds.length === 0}>
                Assign
              </button>
            </div>
          )}
        </div>

        {/* Reviews */}
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <h2 className="mb-3 font-semibold text-slate-800 dark:text-slate-200">Reviews</h2>
          {pr.reviews?.length ? (
            <ul className="space-y-3">
              {(pr.reviews as Review[]).map((r) => (
                <li key={r.id} className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{r.user?.name || r.user?.email}</span>
                    <span className={clsx('text-sm font-medium', decisionColors[r.decision])}>{r.decision.replace(/_/g, ' ')}</span>
                  </div>
                  {r.body && <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{r.body}</p>}
                  <p className="mt-1 text-xs text-slate-500">{new Date(r.createdAt).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No reviews yet.</p>
          )}
          {canSubmitReview && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <p className="mb-2 text-sm font-medium">Submit your review</p>
              {isAuthor && (
                <p className="mb-2 text-xs text-amber-600 dark:text-amber-400">You are the PR author; you can request changes or reject, but you cannot approve your own PR.</p>
              )}
              <select value={reviewDecision} onChange={(e) => setReviewDecision(e.target.value as ReviewDecision)} className="input mb-2 max-w-xs">
                <option value="APPROVED">Approve</option>
                <option value="CHANGES_REQUESTED">Request changes</option>
                <option value="REJECTED">Reject</option>
              </select>
              <textarea value={reviewBody} onChange={(e) => setReviewBody(e.target.value)} className="input mb-2 min-h-[80px] w-full" placeholder="Comment (optional)" />
              <button type="button" onClick={submitReview} className="btn-primary" disabled={loading}>
                Submit review
              </button>
            </div>
          )}
        </div>

        {/* Checklist */}
        {checklist.length > 0 && (
          <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
            <h2 className="mb-3 font-semibold text-slate-800 dark:text-slate-200">Checklist</h2>
            <ul className="space-y-2">
              {checklist.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  {canEditChecklist ? (
                    <button
                      type="button"
                      onClick={() => toggleChecklistItem(i)}
                      disabled={checklistSaving}
                      className="flex items-center gap-2 rounded p-0.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
                      aria-label={item.done ? 'Mark unchecked' : 'Mark complete'}
                    >
                      {item.done ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" /> : <span className="h-5 w-5 shrink-0 rounded-full border-2 border-slate-400 dark:border-slate-500" />}
                      <span className={item.done ? 'text-slate-500 line-through dark:text-slate-400' : ''}>{item.label}</span>
                    </button>
                  ) : (
                    <>
                      {item.done ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> : <span className="h-4 w-4 shrink-0 rounded-full border-2 border-slate-300 dark:border-slate-600" />}
                      <span className={item.done ? 'text-slate-500 dark:text-slate-400' : ''}>{item.label}</span>
                    </>
                  )}
                </li>
              ))}
            </ul>
            {canEditChecklist && checklistSaving && <p className="mt-1 text-xs text-slate-500">Saving...</p>}
          </div>
        )}

        {/* Comments */}
        <div className="px-6 py-4">
          <h2 className="mb-3 flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
            <MessageSquare className="h-5 w-5" />
            Comments ({pr.comments?.length ?? 0})
          </h2>
          <div className="space-y-3">
            {pr.comments?.map((c) => (
              <div key={c.id} className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{c.user?.name || c.user?.email}</span>
                  <span className="text-slate-500">{new Date(c.createdAt).toLocaleString()}</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-400">{c.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <textarea value={commentBody} onChange={(e) => setCommentBody(e.target.value)} className="input min-h-[80px]" placeholder="Add a comment..." />
            <button type="button" onClick={submitComment} className="btn-primary mt-2" disabled={loading || !commentBody.trim()}>
              Post comment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
