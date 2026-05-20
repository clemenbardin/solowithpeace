'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

type Trip = {
  id: number;
  title: string;
  description: string;
  destination: string;
  start_date: string;
  end_date: string;
  spots_total: number;
  spots_left: number;
  category: string;
  gradient: string;
};

type FeatureFlag = {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
};

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function DashboardPage() {
  const auth = useAuth() as { user?: any; logout?: () => Promise<void>; loading?: boolean } | null;
  const user = auth?.user;
  const logout = auth?.logout;
  const loading = auth?.loading;
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({});
  const [tripsLoading, setTripsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetch('/api/flags')
        .then((r) => r.json())
        .then((flags) => {
          if (Array.isArray(flags)) {
            setFeatureFlags(Object.fromEntries(flags.map((flag: FeatureFlag) => [flag.key, flag.enabled])));
          }
        })
        .catch(console.error);

      fetch('/api/trips')
        .then((r) => r.json())
        .then((data) => setTrips(Array.isArray(data) ? data : []))
        .catch(console.error)
        .finally(() => setTripsLoading(false));
    }
  }, [user]);

  const handleLogout = async () => {
    await logout?.();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F1E6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-8 w-8 animate-spin text-zinc-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <p className="text-sm text-zinc-500">Chargement…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : 'récemment';

  return (
    <div className="min-h-screen bg-[#F6F1E6] text-zinc-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-[#F6F1E6]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white text-xs font-black select-none">
              SW
            </div>
            <div className="leading-tight hidden sm:block">
              <p className="text-sm font-semibold tracking-tight">SoloWithPeace</p>
              <p className="text-xs text-zinc-600">Mon espace</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {user.role === 'Admin' && (
              <a
                href="/admin/feature-flags"
                className="hidden sm:inline-flex items-center gap-2 rounded-full border border-emerald-500 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                Administration
              </a>
            )}
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-3 py-1.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-white text-xs font-bold">
                {user.avatar_initials || user.name?.[0]?.toUpperCase()}
              </span>
              <span className="text-sm font-semibold">{user.name}</span>
              <span className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs font-semibold">{user.role}</span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white/70 px-4 py-2 text-sm font-semibold hover:bg-white transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 flex flex-col gap-8">
        {featureFlags.show_exclusive_trips && (
          <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
            <div className="text-emerald-900">
              <p className="text-sm font-semibold uppercase tracking-[0.2em]">Offre exclusive</p>
              <h2 className="mt-3 text-2xl font-extrabold">Voyages exclusifs activés</h2>
              <p className="mt-2 text-sm leading-6">
                Ce contenu est contrôlé par un feature flag. Les voyages affichés sont désormais présentés en priorité.
              </p>
            </div>
          </section>
        )}

        {/* Profil hero */}
        <section>
          <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-linear-to-br from-amber-500/15 via-sky-500/10 to-emerald-500/15 shadow-sm">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,.7),transparent_50%)]" />
            <div className="relative flex flex-col sm:flex-row sm:items-center gap-6 p-6 sm:p-10">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white text-2xl font-black shadow-sm">
                {user.avatar_initials || user.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-extrabold tracking-tight">{user.name}</h1>
                  <span className="rounded-full bg-white/70 border border-white/60 px-3 py-1 text-xs font-semibold backdrop-blur">
                    {user.role}
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-600">{user.email}</p>
                <p className="mt-1 text-xs text-zinc-500">Membre depuis {memberSince}</p>
              </div>
              <div className="flex flex-col gap-2 sm:items-end">
                <div className="flex gap-4 text-center">
                  <div>
                    <p className="text-2xl font-extrabold">{trips.length}</p>
                    <p className="text-xs text-zinc-600">Voyages dispo</p>
                  </div>
                  <div className="w-px bg-zinc-200" />
                  <div>
                    <p className="text-2xl font-extrabold">0</p>
                    <p className="text-xs text-zinc-600">Mes voyages</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Voyages disponibles */}
        <section>
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-600">Tous les voyages</p>
              <h2 className="text-xl font-extrabold tracking-tight">Prochaines aventures disponibles</h2>
            </div>
            <span className="text-xs text-zinc-500 font-mono bg-white/60 border border-zinc-200 rounded-full px-3 py-1">
              {tripsLoading ? '…' : `${trips.length} voyage${trips.length !== 1 ? 's' : ''}`}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tripsLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="overflow-hidden rounded-3xl border border-zinc-200 bg-white/70 shadow-sm animate-pulse">
                    <div className="h-28 bg-zinc-200/60" />
                    <div className="p-4 flex flex-col gap-2">
                      <div className="h-4 bg-zinc-200/60 rounded w-3/4" />
                      <div className="h-3 bg-zinc-200/40 rounded w-full" />
                    </div>
                  </div>
                ))
              : trips.map((trip) => (
                  <article key={trip.id} className="overflow-hidden rounded-3xl border border-zinc-200 bg-white/70 shadow-sm hover:shadow-md transition-all group">
                    <div className={`h-28 bg-linear-to-br ${trip.gradient || 'from-amber-500/30 to-sky-500/20'} relative`}>
                      <div className="absolute top-3 left-3">
                        <span className="rounded-full bg-white/70 border border-white/60 px-2.5 py-1 text-xs font-semibold backdrop-blur">
                          {trip.category}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${trip.spots_left === 0 ? 'bg-zinc-100 text-zinc-500' : trip.spots_left <= 2 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {trip.spots_left === 0 ? 'Complet' : `${trip.spots_left} place${trip.spots_left !== 1 ? 's' : ''}`}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-extrabold group-hover:text-zinc-700 transition-colors">{trip.title}</h3>
                      <p className="mt-0.5 text-xs font-semibold text-zinc-500">📍 {trip.destination}</p>
                      <p className="mt-2 text-sm text-zinc-700 line-clamp-2 leading-relaxed">{trip.description}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-zinc-500">
                          {formatDate(trip.start_date)}
                        </span>
                        <button
                          disabled={trip.spots_left === 0}
                          className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-bold text-white hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {trip.spots_left === 0 ? 'Complet' : 'Rejoindre'}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 bg-[#F6F1E6] py-6 mt-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-white text-xs font-black">SW</div>
            <p className="text-sm font-semibold">SoloWithPeace</p>
          </div>
          <p className="text-xs text-zinc-600">© {new Date().getFullYear()} • Explorez le Monde en Solo.</p>
        </div>
      </footer>
    </div>
  );
}
