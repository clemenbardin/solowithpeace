'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

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

type Activity = {
  id: number;
  title: string;
  description: string;
  icon_type: string;
  color: string;
  participant_count: number;
};

type Testimonial = {
  id: number;
  author_name: string;
  author_initials: string;
  author_color: string;
  quote_title: string;
  quote_body: string;
  subtitle: string;
};

const ICON_COLORS: Record<string, string> = {
  emerald: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/20',
  sky: 'bg-sky-500/15 text-sky-700 border-sky-500/20',
  amber: 'bg-amber-500/15 text-amber-700 border-amber-500/20',
  rose: 'bg-rose-500/15 text-rose-700 border-rose-500/20',
  indigo: 'bg-indigo-500/15 text-indigo-700 border-indigo-500/20',
};

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  mountain: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 20l6-16 6 16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  ),
  party: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 21V9a5 5 0 0110 0v12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  culture: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 21h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 21V7l7-4 7 4v14" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <rect x="9" y="13" width="6" height="8" rx="1" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  food: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2c2.5 2.5 4 5.1 4 8a4 4 0 01-8 0c0-2.9 1.5-5.5 4-8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M6 22h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Home() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/trips?limit=3').then((r) => r.json()),
      fetch('/api/activities').then((r) => r.json()),
      fetch('/api/testimonials').then((r) => r.json()),
    ])
      .then(([t, a, tm]) => {
        setTrips(Array.isArray(t) ? t.slice(0, 3) : []);
        setActivities(Array.isArray(a) ? a : []);
        setTestimonials(Array.isArray(tm) ? tm.slice(0, 4) : []);
      })
      .catch(console.error)
      .finally(() => setDataLoading(false));
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#F6F1E6] text-zinc-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-[#F6F1E6]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white text-xs font-black select-none">
              SW
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight">SoloWithPeace</p>
              <p className="text-xs text-zinc-600">Explorez le Monde en Solo</p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-medium sm:flex">
            <a className="hover:text-zinc-700 transition-colors" href="#voyages">Voyages</a>
            <a className="hover:text-zinc-700 transition-colors" href="#activites">Activités</a>
            <a className="hover:text-zinc-700 transition-colors" href="#temoignages">Témoignages</a>
          </nav>

          {!loading && (
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="hidden sm:inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-4 py-2 text-sm font-semibold hover:bg-white transition-colors"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-white text-xs font-bold">
                      {user.avatar_initials || user.name?.[0]?.toUpperCase() || '?'}
                    </span>
                    {user.name?.split(' ')[0]}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white/70 px-4 py-2 text-sm font-semibold hover:bg-white transition-colors"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white/70 px-4 py-2 text-sm font-semibold hover:bg-white transition-colors"
                  >
                    Se connecter
                  </Link>
                  <Link
                    href="/register"
                    className="hidden sm:inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-bold text-white hover:bg-zinc-800 transition-colors"
                  >
                    S&apos;inscrire
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="flex flex-col gap-10 pb-16">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pt-6">
          <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-amber-500/15 via-sky-500/10 to-emerald-500/15 shadow-sm">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,.75),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,.45),transparent_50%)]" />
            <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-2 lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/60 px-4 py-2 text-sm font-semibold shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Plateforme de voyages solos
                </div>
                <h1 className="mt-5 text-3xl font-extrabold leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl">
                  Explorez le Monde en Solo,
                  <br />
                  Connectez-vous aux Autres
                </h1>
                <p className="mt-4 max-w-prose text-base leading-relaxed text-zinc-700 sm:text-lg">
                  Trouvez des compagnons d&apos;aventure et planifiez des expériences uniques à travers le monde.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                  {user ? (
                    <Link
                      href="/dashboard"
                      className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-bold text-white hover:bg-zinc-800 transition-colors"
                    >
                      Mon espace voyageur
                    </Link>
                  ) : (
                    <Link
                      href="/register"
                      className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-bold text-white hover:bg-zinc-800 transition-colors"
                    >
                      Rejoindre la communauté
                    </Link>
                  )}
                  <a
                    className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-200 bg-white/70 px-6 text-sm font-bold text-zinc-900 hover:bg-white transition-colors"
                    href="#voyages"
                  >
                    Voir les voyages
                  </a>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-br from-amber-600/25 via-sky-500/20 to-emerald-500/25 shadow-sm">
                  <div className="h-full w-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,.55),transparent_50%),linear-gradient(135deg,rgba(255,255,255,.18),transparent_60%)] flex items-center justify-center">
                    <div className="text-center select-none">
                      <div className="text-5xl font-black text-zinc-900/10">SWP</div>
                    </div>
                  </div>
                </div>
                <div className="pointer-events-none absolute -bottom-3 left-6 right-6 hidden sm:block">
                  <div className="rounded-2xl bg-white/70 px-4 py-3 text-sm shadow-sm backdrop-blur">
                    Rencontres & moments partagés
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Voyages */}
        <section id="voyages" className="mx-auto w-full max-w-6xl px-4">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-600">Voyages disponibles</p>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Prochaines aventures</h2>
            </div>
            <span className="text-xs text-zinc-500 font-mono bg-white/60 border border-zinc-200 rounded-full px-3 py-1">
              {dataLoading ? '…' : `${trips.length} voyages`}
            </span>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {dataLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="overflow-hidden rounded-3xl border border-zinc-200 bg-white/70 shadow-sm animate-pulse">
                    <div className="h-36 bg-zinc-200/60" />
                    <div className="p-5 flex flex-col gap-2">
                      <div className="h-4 bg-zinc-200/60 rounded w-3/4" />
                      <div className="h-3 bg-zinc-200/40 rounded w-full" />
                      <div className="h-3 bg-zinc-200/40 rounded w-1/2" />
                    </div>
                  </div>
                ))
              : trips.map((trip) => (
                  <article key={trip.id} className="overflow-hidden rounded-3xl border border-zinc-200 bg-white/70 shadow-sm hover:shadow-md transition-shadow group">
                    <div className={`h-36 bg-gradient-to-br ${trip.gradient || 'from-amber-500/30 to-sky-500/20'} relative`}>
                      <div className="absolute top-3 left-3">
                        <span className="rounded-full bg-white/70 border border-white/60 px-2.5 py-1 text-xs font-semibold backdrop-blur">
                          {trip.category}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${trip.spots_left <= 2 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {trip.spots_left} place{trip.spots_left !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-base font-extrabold group-hover:text-zinc-700 transition-colors">{trip.title}</h3>
                      <p className="mt-1 text-xs font-semibold text-zinc-500">📍 {trip.destination}</p>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-700 line-clamp-2">{trip.description}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-zinc-500">
                          {formatDate(trip.start_date)} → {formatDate(trip.end_date)}
                        </span>
                        {user ? (
                          <button className="text-xs font-semibold text-zinc-900 hover:text-zinc-600 transition-colors">
                            Rejoindre →
                          </button>
                        ) : (
                          <Link href="/register" className="text-xs font-semibold text-zinc-900 hover:text-zinc-600 transition-colors">
                            S&apos;inscrire →
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
          </div>
        </section>

        {/* Activités */}
        <section id="activites" className="mx-auto w-full max-w-6xl px-4">
          <div className="rounded-3xl border border-zinc-200 bg-white/70 px-6 py-8 shadow-sm sm:px-10">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-7">
              <div>
                <p className="text-sm font-semibold text-zinc-600">Rencontres & Activités</p>
                <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Choisissez votre vibe</h2>
              </div>
              <a className="text-sm font-semibold text-zinc-900 hover:text-zinc-700 transition-colors" href="#temoignages">
                Inspirez-vous →
              </a>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {dataLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-4 animate-pulse">
                      <div className="h-12 w-12 rounded-full bg-zinc-200/60 shrink-0" />
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="h-4 bg-zinc-200/60 rounded w-3/4" />
                        <div className="h-3 bg-zinc-200/40 rounded w-full" />
                      </div>
                    </div>
                  ))
                : activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border ${ICON_COLORS[activity.color] || ICON_COLORS.emerald}`}>
                        {ACTIVITY_ICONS[activity.icon_type] || ACTIVITY_ICONS.mountain}
                      </div>
                      <div>
                        <h3 className="font-extrabold">{activity.title}</h3>
                        <p className="mt-1 text-sm text-zinc-700 line-clamp-2">{activity.description}</p>
                        <p className="mt-1 text-xs text-zinc-500 font-semibold">{activity.participant_count} participants</p>
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </section>

        {/* Témoignages */}
        <section id="temoignages" className="mx-auto w-full max-w-6xl px-4">
          <div className="rounded-3xl border border-zinc-200 bg-white/70 px-6 py-8 shadow-sm sm:px-10">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-7">
              <div>
                <p className="text-sm font-semibold text-zinc-600">Témoignages de Voyageurs</p>
                <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Ce qu&apos;ils en disent</h2>
              </div>
              <span className="text-sm text-zinc-600">Des aventures qui font du bien.</span>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {dataLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-sm animate-pulse">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-full bg-zinc-200/60 shrink-0" />
                        <div className="flex-1 flex flex-col gap-2">
                          <div className="h-4 bg-zinc-200/60 rounded w-3/4" />
                          <div className="h-3 bg-zinc-200/40 rounded w-full" />
                          <div className="h-3 bg-zinc-200/40 rounded w-2/3" />
                        </div>
                      </div>
                    </div>
                  ))
                : testimonials.map((t) => (
                    <article key={t.id} className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border font-extrabold text-sm ${ICON_COLORS[t.author_color] || ICON_COLORS.emerald}`}>
                          {t.author_initials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold">&quot;{t.quote_title}&quot;</p>
                          <p className="mt-1 text-sm text-zinc-700">&quot;{t.quote_body}&quot;</p>
                          <div className="mt-3 text-xs font-semibold text-zinc-600">{t.subtitle}</div>
                        </div>
                      </div>
                    </article>
                  ))}
            </div>
          </div>
        </section>

        {/* CTA inscription */}
        {!user && !loading && (
          <section className="mx-auto w-full max-w-6xl px-4">
            <div className="rounded-3xl border border-zinc-200 bg-gradient-to-br from-zinc-900 to-zinc-800 px-8 py-10 text-white shadow-sm text-center">
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Prêt(e) à voyager autrement ?</h2>
              <p className="mt-3 text-zinc-400 max-w-md mx-auto">Rejoignez des milliers de voyageurs solos et créez des souvenirs inoubliables.</p>
              <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/register" className="inline-flex h-12 items-center justify-center rounded-full bg-white text-zinc-900 px-8 text-sm font-bold hover:bg-zinc-100 transition-colors">
                  Créer mon compte gratuit
                </Link>
                <Link href="/login" className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 bg-white/10 px-8 text-sm font-semibold hover:bg-white/20 transition-colors">
                  Se connecter
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-zinc-200 bg-[#F6F1E6] py-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-white text-xs font-black">SW</div>
            <p className="text-sm font-semibold">SoloWithPeace</p>
          </div>
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} • Explorez le Monde en Solo.
          </p>
        </div>
      </footer>
    </div>
  );
}
