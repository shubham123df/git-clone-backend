import { useState, useEffect } from 'react';
import api from '../lib/api';
import type { AuditLogEntry } from '../types';

export default function AuditLogs() {
  const [logs, setLogs] = useState<{ data: AuditLogEntry[]; total: number } | null>(null);
  const [page, setPage] = useState(1);
  const [entityType, setEntityType] = useState('');
  const [action, setAction] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', '50');
    if (entityType) params.set('entityType', entityType);
    if (action) params.set('action', action);
    api.get<{ data: AuditLogEntry[]; total: number }>(`/audit-logs?${params}`)
      .then((r) => setLogs(r.data))
      .catch(() => setLogs({ data: [], total: 0 }));
  }, [page, entityType, action]);

  if (!logs) return <div className="py-12 text-center text-slate-500">Loading...</div>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">Audit Logs</h1>
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Entity type"
          value={entityType}
          onChange={(e) => setEntityType(e.target.value)}
          className="input max-w-[140px]"
        />
        <input
          type="text"
          placeholder="Action"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="input max-w-[140px]"
        />
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Entity</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Metadata</th>
              </tr>
            </thead>
            <tbody>
              {logs.data.map((entry) => (
                <tr key={entry.id} className="border-b border-slate-100 dark:border-slate-700">
                  <td className="whitespace-nowrap px-4 py-2 text-slate-500 dark:text-slate-400">
                    {new Date(entry.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">{entry.entityType}/{entry.entityId.slice(0, 8)}</td>
                  <td className="px-4 py-2 font-medium">{entry.action}</td>
                  <td className="px-4 py-2">{entry.user?.email ?? '-'}</td>
                  <td className="max-w-[200px] truncate px-4 py-2 text-slate-500 dark:text-slate-400">
                    {entry.metadata ? JSON.stringify(entry.metadata) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {logs.total > 50 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-slate-700">
            <span className="text-sm text-slate-500">Total: {logs.total}</span>
            <div className="flex gap-2">
              <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm">
                Previous
              </button>
              <button type="button" onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(logs.total / 50)} className="btn-secondary text-sm">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
