/**
 * Get a user-friendly message from an API error.
 * Handles NestJS format { message: string | string[] }, network errors, and status-based fallbacks.
 */
export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (!err || typeof err !== 'object') return fallback;

  const ax = err as { response?: { data?: { message?: string | string[] }; status?: number }; message?: string };
  const data = ax.response?.data;
  const status = ax.response?.status;

  if (data?.message !== undefined) {
    const m = data.message;
    return Array.isArray(m) ? (m[0] || fallback) : (m || fallback);
  }

  // No response = request never reached server (network, CORS, wrong URL)
  if (!ax.response) {
    return ax.message?.includes('Network Error')
      ? 'Unable to reach server. Check your connection and that the app is running.'
      : 'Unable to reach server. Please try again.';
  }

  // Status-based fallbacks when backend doesn't send a message
  switch (status) {
    case 409:
      return 'This email is already registered. Try signing in or use a different email.';
    case 400:
      return 'Invalid input. Check your email and password (min 8 characters).';
    case 401:
      return 'Invalid email or password.';
    case 500:
      return 'Server error. Please try again later.';
    default:
      return fallback;
  }
}
