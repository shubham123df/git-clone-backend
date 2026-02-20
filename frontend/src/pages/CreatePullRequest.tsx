import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { getApiErrorMessage } from '../lib/errorMessage';
import type { ChecklistItem } from '../types';

export default function CreatePullRequest() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [repositoryLink, setRepositoryLink] = useState('');
  const [sourceBranch, setSourceBranch] = useState('');
  const [targetBranch, setTargetBranch] = useState('main');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [checklistInput, setChecklistInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const addChecklistItem = () => {
    const label = checklistInput.trim();
    if (!label) return;
    setChecklist((c) => [...c, { label, done: false }]);
    setChecklistInput('');
  };

  const removeChecklistItem = (i: number) => {
    setChecklist((c) => c.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post<{ id: string }>('/pull-requests', {
        title,
        description: description || undefined,
        repositoryLink,
        sourceBranch,
        targetBranch,
        checklist: checklist.length ? checklist : undefined,
      });
      navigate(`/pull-requests/${data.id}`, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create PR'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">New Pull Request</h1>
      <form onSubmit={handleSubmit} className="card max-w-2xl space-y-4 p-6">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            placeholder="PR title"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input min-h-[100px]"
            placeholder="Describe your changes"
            rows={4}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Repository link *</label>
          <input
            type="url"
            value={repositoryLink}
            onChange={(e) => setRepositoryLink(e.target.value)}
            className="input"
            placeholder="https://github.com/org/repo"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Source branch *</label>
            <input
              type="text"
              value={sourceBranch}
              onChange={(e) => setSourceBranch(e.target.value)}
              className="input"
              placeholder="feature/xyz"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Target branch *</label>
            <input
              type="text"
              value={targetBranch}
              onChange={(e) => setTargetBranch(e.target.value)}
              className="input"
              placeholder="main"
              required
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Checklist</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={checklistInput}
              onChange={(e) => setChecklistInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())}
              className="input"
              placeholder="Add item and press Enter"
            />
            <button type="button" onClick={addChecklistItem} className="btn-secondary">
              Add
            </button>
          </div>
          <ul className="mt-2 space-y-1">
            {checklist.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
                <button type="button" onClick={() => removeChecklistItem(i)} className="text-red-600 hover:underline">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create PR'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
