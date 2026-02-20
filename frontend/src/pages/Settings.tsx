import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import api from '../lib/api';
import { getApiErrorMessage } from '../lib/errorMessage';
import { User, Key, Save, Trash2, Shield, Bell, Palette, Lock, Eye, EyeOff, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

type TokenRow = { id: string; provider: string; scopeHint: string | null; createdAt: string; updatedAt: string; hasToken: boolean };

export default function Settings() {
  const user = useAuthStore((s) => s.user);
  const { theme, toggle } = useThemeStore();
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'tokens' | 'preferences'>('profile');

  const [tokens, setTokens] = useState<TokenRow[]>([]);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [tokenMessage, setTokenMessage] = useState('');
  const [provider, setProvider] = useState<'GITHUB' | 'GITLAB'>('GITHUB');
  const [tokenValue, setTokenValue] = useState('');
  const [savingToken, setSavingToken] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [prNotifications, setPrNotifications] = useState(true);
  const [reviewNotifications, setReviewNotifications] = useState(true);

  useEffect(() => {
    if (user?.name != null) setName(user.name);
  }, [user?.name]);

  useEffect(() => {
    loadNotificationPreferences();
  }, []);

  const loadTokens = () => {
    setTokenLoading(true);
    api.get<TokenRow[]>('/repository-tokens').then((res) => setTokens(Array.isArray(res.data) ? res.data : [])).catch(() => setTokens([])).finally(() => setTokenLoading(false));
  };
  useEffect(() => { loadTokens(); }, []);

  const loadNotificationPreferences = () => {
    // Simulate loading notification preferences
    setEmailNotifications(true);
    setPushNotifications(true);
    setPrNotifications(true);
    setReviewNotifications(true);
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    api.patch('/users/me', { name: name || undefined }).then(() => {
      setMessage('Profile updated successfully!');
      useAuthStore.getState().fetchUser();
      setTimeout(() => setMessage(''), 3000);
    }).catch((err) => setError(getApiErrorMessage(err, 'Update failed'))).finally(() => setLoading(false));
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMessage('');
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    
    setPasswordLoading(true);
    api.patch('/users/change-password', { 
      currentPassword, 
      newPassword 
    }).then(() => {
      setPasswordMessage('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMessage(''), 3000);
    }).catch((err) => setPasswordError(getApiErrorMessage(err, 'Password change failed'))).finally(() => setPasswordLoading(false));
  };

  const handleSaveToken = (e: React.FormEvent) => {
    e.preventDefault();
    setTokenError('');
    setTokenMessage('');
    if (!tokenValue.trim()) { setTokenError('Enter a token'); return; }
    setSavingToken(true);
    api.post('/repository-tokens', { provider, token: tokenValue.trim() }).then(() => {
      setTokenMessage('Token saved successfully. It is stored encrypted and never returned.');
      setTokenValue('');
      loadTokens();
      setTimeout(() => setTokenMessage(''), 3000);
    }).catch((err) => setTokenError(getApiErrorMessage(err, 'Failed to save token'))).finally(() => setSavingToken(false));
  };

  const handleRevoke = (prov: string) => {
    setTokenError('');
    setRevoking(prov);
    api.delete(`/repository-tokens/${prov}`).then(() => { 
      setTokenMessage('Token revoked successfully'); 
      loadTokens(); 
      setTimeout(() => setTokenMessage(''), 3000);
    }).catch((err) => setTokenError(getApiErrorMessage(err, 'Revoke failed'))).finally(() => setRevoking(null));
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'tokens', label: 'Repository Tokens', icon: Key },
    { id: 'preferences', label: 'Preferences', icon: Bell },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
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

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Profile Information
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Update your personal information
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </div>
              </div>
            )}
            {message && (
              <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {message}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email Address
                </label>
                <input 
                  type="text" 
                  value={user?.email ?? ''} 
                  readOnly 
                  className="input bg-slate-50 dark:bg-slate-800/50" 
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Email cannot be changed
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Full Name
                </label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="input" 
                  placeholder="Your name" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Role
              </label>
              <input 
                type="text" 
                value={user?.role ?? ''} 
                readOnly 
                className="input bg-slate-50 dark:bg-slate-800/50 uppercase" 
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Your role in the system
              </p>
            </div>

            <button 
              type="submit" 
              className="btn-primary flex items-center gap-2" 
              disabled={loading}
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Lock className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Change Password
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Update your password to keep your account secure
                </p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              {passwordError && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {passwordError}
                  </div>
                </div>
              )}
              {passwordMessage && (
                <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {passwordMessage}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Current Password
                  </label>
                  <input 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input" 
                    placeholder="Enter current password"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    New Password
                  </label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input" 
                    placeholder="Enter new password"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Confirm New Password
                  </label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input" 
                    placeholder="Confirm new password"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary flex items-center gap-2" 
                disabled={passwordLoading}
              >
                <Lock className="w-4 h-4" />
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tokens Tab */}
      {activeTab === 'tokens' && (
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Key className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Repository Access Tokens
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Manage tokens for accessing private repositories
              </p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-100">Security Notice</h3>
                <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                  Tokens are encrypted at rest and never returned in API responses. Only store tokens from trusted sources.
                </p>
              </div>
            </div>
          </div>

          {tokenError && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 mb-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {tokenError}
              </div>
            </div>
          )}
          {tokenMessage && (
            <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {tokenMessage}
              </div>
            </div>
          )}

          <form onSubmit={handleSaveToken} className="space-y-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Provider
                </label>
                <select 
                  value={provider} 
                  onChange={(e) => setProvider(e.target.value as 'GITHUB' | 'GITLAB')} 
                  className="input"
                >
                  <option value="GITHUB">GitHub</option>
                  <option value="GITLAB">GitLab</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Personal Access Token
                </label>
                <div className="relative">
                  <input 
                    type={showToken ? "text" : "password"}
                    value={tokenValue} 
                    onChange={(e) => setTokenValue(e.target.value)} 
                    className="input pr-10" 
                    placeholder="Enter your token" 
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            <button 
              type="submit" 
              className="btn-primary flex items-center gap-2" 
              disabled={savingToken}
            >
              <Key className="w-4 h-4" />
              {savingToken ? 'Saving...' : 'Save Token'}
            </button>
          </form>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Configured Tokens
            </h3>
            {tokenLoading ? (
              <div className="flex items-center gap-2 text-slate-500">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Loading tokens...
              </div>
            ) : tokens.length > 0 ? (
              <div className="space-y-3">
                {tokens.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                        <Key className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{t.provider}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Last updated {new Date(t.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleRevoke(t.provider)} 
                      disabled={revoking === t.provider} 
                      className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {revoking === t.provider ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      {revoking === t.provider ? 'Revoking...' : 'Revoke'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <Key className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                <p>No tokens configured yet</p>
                <p className="text-sm">Add a token above to access private repositories</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Palette className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Appearance
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Customize your interface appearance
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">Theme</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Choose between light and dark mode
                  </p>
                </div>
                <button
                  onClick={toggle}
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 dark:bg-slate-700 transition-colors"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Current theme: <span className="font-medium">{theme === 'dark' ? 'Dark' : 'Light'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Notifications
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Manage your notification preferences
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">Email Notifications</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Receive notifications via email
                  </p>
                </div>
                <button
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 dark:bg-slate-700 transition-colors"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">Push Notifications</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Receive browser push notifications
                  </p>
                </div>
                <button
                  onClick={() => setPushNotifications(!pushNotifications)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 dark:bg-slate-700 transition-colors"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      pushNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">Pull Request Updates</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Get notified about PR status changes
                  </p>
                </div>
                <button
                  onClick={() => setPrNotifications(!prNotifications)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 dark:bg-slate-700 transition-colors"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      prNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">Review Requests</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Get notified when someone requests your review
                  </p>
                </div>
                <button
                  onClick={() => setReviewNotifications(!reviewNotifications)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 dark:bg-slate-700 transition-colors"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      reviewNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
