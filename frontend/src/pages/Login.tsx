import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { getApiErrorMessage } from '../lib/errorMessage';
import { GitPullRequest } from 'lucide-react';

export default function Login() {

  const navigate = useNavigate();

  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    setError('');

    setLoading(true);

    try {

      // Real API call to backend
      const { data } = await api.post('/auth/login', {
        email,
        password,
      });

      // Save auth with real tokens
      setAuth(data.user, data.accessToken, data.refreshToken);

      // Redirect to pull requests
      navigate('/pull-requests', { replace: true });

    } catch (err) {

      setError(getApiErrorMessage(err, 'Sign in failed'));

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-slate-900">

      <div className="w-full max-w-md">

        <div className="card p-8">


          {/* Logo */}
          <div className="mb-6 flex items-center justify-center gap-2">

            <GitPullRequest className="h-10 w-10 text-blue-600" />

            <span className="text-xl font-bold">

              PR Review

            </span>

          </div>


          {/* Title */}

          <h1 className="mb-2 text-center text-lg font-semibold">

            Sign in

          </h1>


          <p className="mb-6 text-center text-sm text-slate-500">

            Enter your credentials

          </p>



          {/* Form */}

          <form onSubmit={handleSubmit} className="space-y-4">


            {/* Error */}

            {error && (

              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">

                {error}

              </div>

            )}


            {/* Email */}

            <div>

              <label className="mb-1 block text-sm font-medium">

                Email

              </label>


              <input

                type="email"

                value={email}

                onChange={(e) => setEmail(e.target.value)}

                className="input"

                placeholder="you@example.com"

                required

              />

            </div>



            {/* Password */}

            <div>

              <label className="mb-1 block text-sm font-medium">

                Password

              </label>


              <input

                type="password"

                value={password}

                onChange={(e) => setPassword(e.target.value)}

                className="input"

                placeholder="••••••••"

                required

              />

            </div>



            {/* Button */}

            <button

              type="submit"

              className="btn-primary w-full"

              disabled={loading}

            >

              {loading ? 'Signing in...' : 'Sign in'}

            </button>


          </form>



          {/* Register */}

          <p className="mt-4 text-center text-sm text-slate-500">

            Don't have an account?{' '}

            <Link

              to="/register"

              className="text-blue-600 hover:underline"

            >

              Register

            </Link>

          </p>


        </div>

      </div>

    </div>

  );

}