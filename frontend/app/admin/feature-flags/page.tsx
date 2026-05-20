'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

type FeatureFlag = {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
};

export default function FeatureFlagsPage() {
  const auth = useAuth() as { user?: any; loading?: boolean } | null;
  const user = auth?.user;
  const loading = auth?.loading;
  const router = useRouter();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
      return;
    }
    if (!loading && user && user.role !== 'Admin') {
      router.replace('/dashboard');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!loading && user) {
      fetch('/api/flags')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setFlags(data);
          }
        })
        .catch(() => setError('Impossible de charger les feature flags'));
    }
  }, [loading, user]);

  const toggleFlag = async (key: string, enabled: boolean) => {
    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/flags/${key}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enabled }),
      });
      if (!res.ok) {
        throw new Error('Échec de mise à jour');
      }
      const updated = await res.json();
      setFlags((current) => current.map((flag) => (flag.key === updated.key ? { ...flag, enabled: updated.enabled } : flag)));
    } catch (err) {
      setError('Erreur lors de la modification du flag');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F1E6] text-zinc-900 font-sans">
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-600">Administration</p>
            <h1 className="text-3xl font-extrabold tracking-tight">Gestion des feature flags</h1>
          </div>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white/90 px-4 py-2 text-sm font-semibold hover:bg-white transition-colors"
          >
            Retour au dashboard
          </a>
        </div>

        {error && (
          <div className="mb-4 rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {flags.map((flag) => (
            <div key={flag.key} className="rounded-3xl border border-zinc-200 bg-white/90 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-zinc-700">{flag.name}</p>
                  <p className="mt-2 text-sm text-zinc-600">{flag.description}</p>
                </div>
                <button
                  disabled={saving}
                  onClick={() => toggleFlag(flag.key, !flag.enabled)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${flag.enabled ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'}`}
                >
                  {flag.enabled ? 'Activé' : 'Désactivé'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
