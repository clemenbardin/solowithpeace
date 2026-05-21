'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      router.push('/dashboard');
    } else {
      if (result.statusCode === 503) {
        router.push('/maintenance');
      } else {
        setError(result.error || 'Une erreur est survenue');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F1E6] text-zinc-900 font-sans flex flex-col">
      {/* Header minimal */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-[#F6F1E6]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-white text-xs font-black">
              SW
            </div>
            <span className="text-sm font-semibold tracking-tight">SoloWithPeace</span>
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white/70 px-4 py-2 text-sm font-semibold hover:bg-white transition-colors"
          >
            Créer un compte
          </Link>
        </div>
      </header>

      {/* Contenu */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white/80 shadow-sm backdrop-blur">
            {/* Bandeau déco */}
            <div className="h-2 bg-gradient-to-r from-amber-500/60 via-sky-500/50 to-emerald-500/60" />

            <div className="p-8">
              <div className="mb-8">
                <h1 className="text-2xl font-extrabold tracking-tight">Bon retour !</h1>
                <p className="mt-1 text-sm text-zinc-600">
                  Connectez-vous pour rejoindre vos prochains voyages.
                </p>
              </div>

              {error && (
                <div className="mb-5 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="vous@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-[#F6F1E6]/60 px-4 py-3 text-sm placeholder-zinc-400 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password" className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">
                    Mot de passe
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-[#F6F1E6]/60 px-4 py-3 text-sm placeholder-zinc-400 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
                    required
                    autoComplete="current-password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white transition hover:bg-zinc-800 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Connexion…
                    </span>
                  ) : (
                    'Se connecter'
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-zinc-600">
                Pas encore de compte ?{' '}
                <Link href="/register" className="font-semibold text-zinc-900 underline underline-offset-2 hover:text-zinc-700">
                  Créer un compte
                </Link>
              </p>

              {/* Comptes de démo */}
              <div className="mt-6 rounded-2xl border border-zinc-200 bg-[#F6F1E6]/50 p-4">
                <p className="mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Comptes de démo</p>
                <div className="flex flex-col gap-1 text-xs text-zinc-600 font-mono">
                  <span>admin@admin.com · admin</span>
                  <span>user@user.com · user</span>
                  <span>alice@example.com · alice123</span>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-zinc-500">
            <Link href="/" className="hover:text-zinc-700">← Retour à l&apos;accueil</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
