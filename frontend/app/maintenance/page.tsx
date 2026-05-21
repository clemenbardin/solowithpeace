'use client';

import Link from 'next/link';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-500/15 via-sky-500/10 to-emerald-500/15 text-zinc-900 font-sans flex flex-col">
      {/* Header minimal */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/40 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-white text-xs font-black">
              SW
            </div>
            <span className="text-sm font-semibold tracking-tight">SoloWithPeace</span>
          </Link>
        </div>
      </header>

      {/* Contenu */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          {/* Card */}
          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white/80 shadow-sm backdrop-blur">
            {/* Icône maintenance */}
            <div className="flex items-center justify-center pt-10 pb-4">
              <div className="relative h-20 w-20">
                <svg className="h-20 w-20 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0m-5.802 4.033a.75.75 0 00-1.396 0 5.25 5.25 0 01-10.864 0 .75.75 0 00-1.396 0A6.75 6.75 0 0012 20.25a6.75 6.75 0 006.663-7.312z"
                  />
                </svg>
              </div>
            </div>

            <div className="px-8 pb-10">
              <h1 className="text-2xl font-extrabold tracking-tight">Nous serons de retour très bientôt</h1>
              <p className="mt-3 text-sm text-zinc-600 leading-relaxed">
                SoloWithPeace est actuellement en maintenance. Nous travaillons dur pour améliorer votre expérience. Veuillez réessayer dans quelques instants.
              </p>

              <div className="mt-8 flex flex-col gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-zinc-900 text-white px-6 py-3 text-sm font-semibold hover:bg-zinc-800 transition-colors"
                >
                  ↻ Rafraîchir la page
                </button>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white/70 px-6 py-3 text-sm font-semibold hover:bg-white transition-colors"
                >
                  Retour à l'accueil
                </Link>
              </div>

              {/* Info */}
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-500">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Estimé : quelques heures
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
