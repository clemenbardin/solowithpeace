import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F6F1E6] text-zinc-900 font-sans">
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-[#F6F1E6]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="SoloWithPeace"
              width={48}
              height={48}
              priority
              className="h-12 w-12 select-none"
            />
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight sm:text-base">
                SoloWithPeace
              </p>
              <p className="text-xs text-zinc-600 sm:text-sm">
                Explorez le Monde en Solo
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-medium sm:flex">
            <a className="hover:text-zinc-700" href="#activites">
              Activités
            </a>
            <a className="hover:text-zinc-700" href="#temoignages">
              Témoignages
            </a>
            <a className="hover:text-zinc-700" href="#cartes">
              Découvrir
            </a>
          </nav>

          <a
            className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white/70 px-4 py-2 text-sm font-semibold hover:bg-white"
            href="#temoignages"
          >
            Rejoindre
          </a>
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
                  <span className="h-2 w-2 rounded-full bg-emerald-600" />
                  TravebiBIMS
                </div>

                <h1 className="mt-5 text-3xl font-extrabold leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl">
                  Explorez le Monde en Solo,
                  <br />
                  Connectez-vous aux Autres
                </h1>

                <p className="mt-4 max-w-prose text-base leading-relaxed text-zinc-700 sm:text-lg">
                  Trouvez des compagnons d&apos;aventure et planifiez des
                  expériences uniques.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <a
                    className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-bold text-white hover:bg-zinc-800"
                    href="#cartes"
                  >
                    Trouver mon prochain voyage
                  </a>
                  <a
                    className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-200 bg-white/70 px-6 text-sm font-bold text-zinc-900 hover:bg-white"
                    href="#activites"
                  >
                    Voir les activités
                  </a>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-br from-amber-600/25 via-sky-500/20 to-emerald-500/25 shadow-sm">
                  <div className="h-full w-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,.55),transparent_50%),linear-gradient(135deg,rgba(255,255,255,.18),transparent_60%)]" />
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

        {/* 3 Cartes */}
        <section id="cartes" className="mx-auto w-full max-w-6xl px-4">
          <div className="grid gap-5 md:grid-cols-3">
            <article className="overflow-hidden rounded-3xl border border-zinc-200 bg-white/70 shadow-sm">
              <div className="h-36 bg-gradient-to-br from-amber-500/40 via-rose-500/25 to-sky-500/20" />
              <div className="p-5">
                <h3 className="text-base font-extrabold">Randonnée dans les Alpes</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-700">
                  Air pur, panoramas et compagnons de route.
                </p>
              </div>
            </article>

            <article className="overflow-hidden rounded-3xl border border-zinc-200 bg-white/70 shadow-sm">
              <div className="h-36 bg-gradient-to-br from-sky-500/35 via-emerald-500/20 to-amber-500/20" />
              <div className="p-5">
                <h3 className="text-base font-extrabold">
                  Croisière aux Philippines
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-700">
                  Plages, îles, snorkeling et soirées partagées.
                </p>
              </div>
            </article>

            <article className="overflow-hidden rounded-3xl border border-zinc-200 bg-white/70 shadow-sm">
              <div className="h-36 bg-gradient-to-br from-emerald-500/30 via-sky-500/20 to-rose-500/25" />
              <div className="p-5">
                <h3 className="text-base font-extrabold">Découvrir la Japon</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-700">
                  Culture, temples, gastronomie et aventures urbaines.
                </p>
              </div>
            </article>
          </div>
        </section>

        {/* Rencontres & Activités */}
        <section id="activites" className="mx-auto w-full max-w-6xl px-4">
          <div className="rounded-3xl border border-zinc-200 bg-white/70 px-6 py-8 shadow-sm sm:px-10">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-600">Rencontres & Activités</p>
                <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  Choisissez votre vibe
                </h2>
              </div>
              <a
                className="text-sm font-semibold text-zinc-900 hover:text-zinc-700"
                href="#temoignages"
              >
                Inspirez-vous
              </a>
            </div>

            <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 border border-emerald-500/20">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M6 20l6-16 6 16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-extrabold">Rand & Treks</h3>
                  <p className="mt-1 text-sm text-zinc-700">Rando, nature et défis.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/15 text-sky-700 border border-sky-500/20">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M7 21V9a5 5 0 0110 0v12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                    <path d="M9 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-extrabold">Sorties & Soirées</h3>
                  <p className="mt-1 text-sm text-zinc-700">Rencontres et moments.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15 text-amber-700 border border-amber-500/20">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 2v20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M17 7l5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M7 7l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M7 17l-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M17 17l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-extrabold">Atelles & Culture</h3>
                  <p className="mt-1 text-sm text-zinc-700">Ateliers, visites, découvertes.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/15 text-rose-700 border border-rose-500/20">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 2c2.5 2.5 4 5.1 4 8a4 4 0 01-8 0c0-2.9 1.5-5.5 4-8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                    <path d="M6 22h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-extrabold">Découverte & Mango</h3>
                  <p className="mt-1 text-sm text-zinc-700">Saveurs, marchés et fun.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Témoignages */}
        <section id="temoignages" className="mx-auto w-full max-w-6xl px-4">
          <div className="rounded-3xl border border-zinc-200 bg-white/70 px-6 py-8 shadow-sm sm:px-10">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-600">Témoignages de Voyageurs</p>
                <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  Ce qu&apos;ils en disent
                </h2>
              </div>
              <span className="text-sm text-zinc-600">
                Des aventures qui font du bien.
              </span>
            </div>

            <div className="mt-7 grid gap-6 md:grid-cols-2">
              <article className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 border border-emerald-500/20 font-extrabold">
                    JF
                  </div>
                  <div className="min-w-0">
                    <p className="font-extrabold">
                      &quot;Super expérience !&quot;
                    </p>
                    <p className="mt-1 text-sm text-zinc-700">
                      &quot;J&apos;ai rencontré des personnes incroyables.
                      Le programme était clair et l&apos;ambiance au top.&quot;
                    </p>
                    <div className="mt-3 text-xs font-semibold text-zinc-600">
                      Alex • Voyage en solo
                    </div>
                  </div>
                </div>
              </article>

              <article className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/15 text-sky-700 border border-sky-500/20 font-extrabold">
                    KM
                  </div>
                  <div className="min-w-0">
                    <p className="font-extrabold">
                      &quot;On a créé des souvenirs.&quot;
                    </p>
                    <p className="mt-1 text-sm text-zinc-700">
                      &quot;De la rando aux soirées, tout était pensé pour
                      faciliter les rencontres. Je recommande !&quot;
                    </p>
                    <div className="mt-3 text-xs font-semibold text-zinc-600">
                      Maya • Croisière & culture
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 bg-[#F6F1E6] py-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="SoloWithPeace"
              width={34}
              height={34}
              className="h-9 w-9"
            />
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
