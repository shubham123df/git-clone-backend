import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { getApiErrorMessage } from '../lib/errorMessage';
import { User, Key, Save, Trash2 } from 'lucide-react';

type TokenRow = { id: string; provider: string; scopeHint: string | null; createdAt: string; updatedAt: string; hasToken: boolean };

export default function Settings() {
  const user = useAuthStore((s) => s.user);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [tokens, setTokens] = useState<TokenRow[]>([]);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [tokenMessage, setTokenMessage] = useState('');
  const [provider, setProvider] = useState<'GITHUB' | 'GITLAB'>('GITHUB');
  const [tokenValue, setTokenValue] = useState('');
  const [savingToken, setSavingToken] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    if (user?.name != null) setName(user.name);
  }, [user?.name]);

  const loadTokens = () => {
    setTokenLoading(true);
    api.get<TokenRow[]>('/repository-tokens').then((res) => setTokens(Array.isArray(res.data) ? res.data : [])).catch(() => setTokens([])).finally(() => setTokenLoading(false));
  };
  useEffect(() => { loadTokens(); }, []);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    api.patch('/users/me', { name: name || undefined }).then(() => {
      setMessage('Profile updated.');
      useAuthStore.getState().fetchUser();
    }).catch((err) => setError(getApiErrorMessage(err, 'Update failed'))).finally(() => setLoading(false));
  };

  const handleSaveToken = (e: React.FormEvent) => {
    e.preventDefault();
    setTokenError('');
    setTokenMessage('');
    if (!tokenValue.trim()) { setTokenError('Enter a token'); return; }
    setSavingToken(true);
    api.post('/repository-tokens', { provider, token: tokenValue.trim() }).then(() => {
      setTokenMessage('Token saved. It is stored encrypted and never returned.');
      setTokenValue('');
      loadTokens();
    }).catch((err) => setTokenError(getApiErrorMessage(err, 'Failed to save token'))).finally(() => setSavingToken(false));
  };

  const handleRevoke = (prov: string) => {
    setTokenError('');
    setRevoking(prov);
    api.delete(`/repository-tokens/${prov}`).then(() => { setTokenMessage('Token revoked'); loadTokens(); }).catch((err) => setTokenError(getApiErrorMessage(err, 'Revoke failed'))).finally(() => setRevoking(null));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Manage your profile and repository tokens.</p>

      {/* Profile */}
      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-[#161b22]">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
          <User className="h-5 w-5" />
          Profile
        </h2>
        <form onSubmit={handleProfileSubmit} className="mt-4 max-w-md space-y-4">
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">{error}</div>}
          {message && <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">{message}</div>}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
            <input type="text" value={user?.email ?? ''} readOnly className="input bg-slate-50 dark:bg-slate-800/50" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Your name" />
          </div>
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : 'Save'}
          </button>
        </form>
      </section>

      {/* Repository tokens */}
      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-[#161b22]">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
          <Key className="h-5 w-5" />
          Repository access (private repos)
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Add a GitHub or GitLab personal access token to link private repositories and fetch branches. Tokens are encrypted at rest and never returned in API responses.
        </p>
        {tokenError && <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">{tokenError}</div>}
        {tokenMessage && <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">{tokenMessage}</div>}

        <form onSubmit={handleSaveToken} className="mt-4 max-w-md space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Provider</label>
            <select value={provider} onChange={(e) => setProvider(e.target.value as 'GITHUB' | 'GITLAB')} className="input">
              <option value="GITHUB">GitHub</option>
              <option value="GITLAB">GitLab</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Personal access token</label>
            <input type="password" value={tokenValue} onChange={(e) => setTokenValue(e.target.value)} className="input" placeholder="Token (stored encrypted)" autoComplete="off" />
          </div>
          <button type="submit" className="btn-primary" disabled={savingToken}>{savingToken ? 'Saving...' : 'Save token'}</button>
        </form>

        {tokenLoading ? <p className="mt-4 text-sm text-slate-500">Loading...</p> : tokens.length > 0 && (
          <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Configured tokens</h3>
            <ul className="mt-2 space-y-2">
              {tokens.map((t) => (
                <li key={t.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/50">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{t.provider}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Updated {new Date(t.updatedAt).toLocaleDateString()}</span>
                  <button type="button" onClick={() => handleRevoke(t.provider)} disabled={revoking === t.provider} className="rounded p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
