'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

type PublicUser = {
  _id: string;
  id?: string;
  name: string;
  role: string;
  avatar_initials?: string;
  bio?: string;
  country?: string;
  languages?: string[];
  interests?: string[];
  createdAt?: string;
};

type TripMember = {
  user: PublicUser;
  joined_at?: string;
};

type Trip = {
  _id: string;
  id?: string;
  title: string;
  description: string;
  destination: string;
  start_date: string;
  end_date: string;
  spots_total: number;
  spots_left: number;
  category: string;
  gradient: string;
  created_by?: PublicUser;
  members: TripMember[];
  accommodation?: {
    type?: 'commun' | 'personnel';
    description?: string;
  };
};

type ScheduleItem = {
  day: string;
  time: string;
  title: string;
  description: string;
  color: 'emerald' | 'sky' | 'amber' | 'rose' | 'indigo';
};

const ICON_COLORS: Record<string, string> = {
  emerald: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/20',
  sky: 'bg-sky-500/15 text-sky-700 border-sky-500/20',
  amber: 'bg-amber-500/15 text-amber-700 border-amber-500/20',
  rose: 'bg-rose-500/15 text-rose-700 border-rose-500/20',
  indigo: 'bg-indigo-500/15 text-indigo-700 border-indigo-500/20',
};

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getSchedule(category: string): ScheduleItem[] {
  const schedules: Record<string, ScheduleItem[]> = {
    'Rando & Treks': [
      { day: 'J1', time: '16:00', title: 'Accueil du groupe', description: 'Briefing, vérification du matériel et premier dîner partagé.', color: 'amber' },
      { day: 'J2', time: '08:30', title: 'Départ randonnée', description: 'Première étape panoramique avec pauses photo et pique-nique.', color: 'emerald' },
      { day: 'J3', time: '18:00', title: 'Soirée refuge', description: 'Moment convivial autour du programme du lendemain.', color: 'sky' },
    ],
    Culture: [
      { day: 'J1', time: '10:00', title: 'Visite guidée', description: 'Découverte des quartiers historiques et repères pratiques.', color: 'emerald' },
      { day: 'J2', time: '14:00', title: 'Atelier local', description: 'Immersion culturelle avec un intervenant sur place.', color: 'amber' },
      { day: 'J3', time: '20:00', title: 'Dîner de groupe', description: 'Table réservée pour partager les spécialités locales.', color: 'rose' },
    ],
    'Bien-être': [
      { day: 'J1', time: '08:00', title: 'Yoga doux', description: 'Session de réveil corporel et présentation du groupe.', color: 'emerald' },
      { day: 'J2', time: '11:00', title: 'Atelier cuisine', description: 'Préparation d’un repas local puis déjeuner commun.', color: 'amber' },
      { day: 'J3', time: '17:30', title: 'Temps libre guidé', description: 'Balade, repos ou activité optionnelle selon l’énergie du groupe.', color: 'sky' },
    ],
  };

  return schedules[category] || [
    { day: 'J1', time: '15:00', title: 'Arrivée & installation', description: 'Accueil des voyageurs et découverte du lieu de départ.', color: 'sky' },
    { day: 'J2', time: '10:00', title: 'Activité collective', description: 'Première expérience partagée pour créer le lien dans le groupe.', color: 'emerald' },
    { day: 'J3', time: '19:30', title: 'Soirée conviviale', description: 'Dîner informel pour échanger sur les envies de chacun.', color: 'rose' },
  ];
}

export default function TripDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const auth = useAuth() as { user?: any; loading?: boolean } | null;
  const user = auth?.user;
  const authLoading = auth?.loading;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [tripLoading, setTripLoading] = useState(true);
  const [error, setError] = useState('');
  const [joinStatus, setJoinStatus] = useState('');
  const [joining, setJoining] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<PublicUser | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    fetch(`/api/trips/${params.id}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Voyage introuvable');
        setTrip(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setTripLoading(false));
  }, [params?.id]);

  useEffect(() => {
    if (!selectedUserId) return;
    setProfileLoading(true);
    fetch(`/api/users/${selectedUserId}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Profil introuvable');
        setSelectedUser(data);
      })
      .catch(() => setSelectedUser(null))
      .finally(() => setProfileLoading(false));
  }, [selectedUserId]);

  useEffect(() => {
    if (!selectedUserId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeProfile();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedUserId]);

  const closeProfile = () => {
    setSelectedUserId(null);
    setSelectedUser(null);
  };

  const handleJoin = async () => {
    if (!trip) return;
    if (!user) {
      router.push('/login');
      return;
    }

    setJoining(true);
    setJoinStatus('');
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/trips/${trip._id || trip.id}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setJoining(false);

    if (!res.ok) {
      setJoinStatus(data.error || 'Impossible de rejoindre ce voyage');
      return;
    }

    setTrip(data.trip);
    setJoinStatus(data.message || 'Inscription confirmée');
  };

  if (tripLoading || authLoading) {
    return (
      <div className="min-h-screen bg-[#F6F1E6] flex items-center justify-center text-zinc-600">
        Chargement du voyage…
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-[#F6F1E6] text-zinc-900 font-sans">
        <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-4 text-center">
          <h1 className="text-2xl font-extrabold">Voyage indisponible</h1>
          <p className="mt-2 text-sm text-zinc-600">{error || 'Ce voyage est introuvable.'}</p>
          <Link href="/" className="mt-6 rounded-full bg-zinc-900 px-5 py-3 text-sm font-bold text-white hover:bg-zinc-800">
            Retour à l’accueil
          </Link>
        </main>
      </div>
    );
  }

  const schedule = getSchedule(trip.category);
  const isMember = Boolean(user && trip.members?.some((member) => (member.user._id || member.user.id) === (user._id || user.id)));
  const accommodationType = trip.accommodation?.type === 'personnel' ? 'Logement personnel' : 'Logement commun';

  return (
    <div className="min-h-screen bg-[#F6F1E6] text-zinc-900 font-sans">
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-[#F6F1E6]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white text-xs font-black select-none">
              SW
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight">SoloWithPeace</p>
              <p className="text-xs text-zinc-600">Détail du voyage</p>
            </div>
          </Link>
          {user ? (
            <span className="hidden rounded-full border border-zinc-200 bg-white/70 px-4 py-2 text-sm font-semibold sm:inline-flex">
              {user.name}
            </span>
          ) : (
            <Link href="/login" className="rounded-full border border-zinc-200 bg-white/70 px-4 py-2 text-sm font-semibold hover:bg-white">
              Se connecter
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 pb-28">
        <section className={`relative overflow-hidden rounded-3xl border border-zinc-200 bg-linear-to-br ${trip.gradient || 'from-amber-500/20 to-sky-500/20'} shadow-sm`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,.72),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,.42),transparent_50%)]" />
          <div className="relative p-6 sm:p-10">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-white/70 border border-white/60 px-3 py-1 text-xs font-semibold backdrop-blur">
                {trip.category}
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${trip.spots_left <= 2 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {trip.spots_left === 0 ? 'Complet' : `${trip.spots_left} place${trip.spots_left !== 1 ? 's' : ''} disponible${trip.spots_left !== 1 ? 's' : ''}`}
              </span>
            </div>
            <h1 className="mt-5 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">{trip.title}</h1>
            <p className="mt-3 text-sm font-semibold text-zinc-600">📍 {trip.destination}</p>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-700">{trip.description}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <span className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3 font-semibold shadow-sm">
                {formatDate(trip.start_date)} → {formatDate(trip.end_date)}
              </span>
              <span className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3 font-semibold shadow-sm">
                {trip.members?.length || 0} participant{trip.members?.length !== 1 ? 's' : ''} inscrit{trip.members?.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_.8fr]">
          <div className="rounded-3xl border border-zinc-200 bg-white/70 p-6 shadow-sm sm:p-8">
            <p className="text-sm font-semibold text-zinc-600">Planning</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight">Les premiers temps forts</h2>
            <div className="mt-6 flex flex-col gap-4">
              {schedule.map((item) => (
                <article key={`${item.day}-${item.title}`} className="flex gap-4 rounded-2xl border border-zinc-200 bg-white/80 p-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-xs font-extrabold ${ICON_COLORS[item.color]}`}>
                    {item.day}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-500">{item.time}</p>
                    <h3 className="font-extrabold">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-700">{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <section className="rounded-3xl border border-zinc-200 bg-white/70 p-6 shadow-sm">
              <p className="text-sm font-semibold text-zinc-600">Logement</p>
              <h2 className="mt-1 text-xl font-extrabold">{accommodationType}</h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-700">
                {trip.accommodation?.description || 'Les détails du logement seront confirmés par l’organisateur.'}
              </p>
            </section>

            <section className="rounded-3xl border border-zinc-200 bg-white/70 p-6 shadow-sm">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-zinc-600">Participants</p>
                  <h2 className="mt-1 text-xl font-extrabold">Le groupe</h2>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-500">
                  {trip.members?.length || 0}/{trip.spots_total}
                </span>
              </div>
              <div className="mt-5 flex flex-col gap-3">
                {trip.members?.length ? trip.members.map((member) => (
                  <button
                    key={member.user._id || member.user.id}
                    onClick={() => setSelectedUserId(member.user._id || member.user.id || '')}
                    className="flex w-full items-center gap-3 rounded-2xl border border-zinc-200 bg-white/80 p-3 text-left transition hover:bg-white"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-black text-white">
                      {member.user.avatar_initials || member.user.name?.[0]?.toUpperCase()}
                    </span>
                    <span>
                      <span className="block text-sm font-extrabold">{member.user.name}</span>
                      <span className="text-xs font-semibold text-zinc-500">{member.user.role}</span>
                    </span>
                  </button>
                )) : (
                  <p className="text-sm text-zinc-600">Aucun participant inscrit pour le moment.</p>
                )}
              </div>
            </section>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-[#F6F1E6]/90 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-extrabold">{trip.title}</p>
            <p className="text-xs text-zinc-600">{joinStatus || `${trip.spots_left} place${trip.spots_left !== 1 ? 's' : ''} restante${trip.spots_left !== 1 ? 's' : ''}`}</p>
          </div>
          <button
            onClick={handleJoin}
            disabled={joining || trip.spots_left === 0 || isMember}
            className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-bold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isMember ? 'Déjà inscrit' : trip.spots_left === 0 ? 'Complet' : joining ? 'Inscription…' : 'Rejoindre ce voyage'}
          </button>
        </div>
      </div>

      {selectedUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={closeProfile}>
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-[#F6F1E6] p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm font-semibold text-zinc-600">Profil voyageur</p>
              <button onClick={closeProfile} className="rounded-full border border-zinc-200 bg-white/70 px-3 py-1 text-xs font-bold hover:bg-white">
                Fermer
              </button>
            </div>
            {profileLoading ? (
              <p className="mt-6 text-sm text-zinc-600">Chargement du profil…</p>
            ) : selectedUser ? (
              <div className="mt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-lg font-black text-white">
                    {selectedUser.avatar_initials || selectedUser.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold">{selectedUser.name}</h2>
                    <p className="text-sm font-semibold text-zinc-500">{selectedUser.role}</p>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-relaxed text-zinc-700">
                  {selectedUser.bio || 'Ce voyageur n’a pas encore renseigné sa bio.'}
                </p>
                <div className="mt-5 grid gap-3 text-sm">
                  {selectedUser.country && <p><span className="font-bold">Pays :</span> {selectedUser.country}</p>}
                  {!!selectedUser.languages?.length && <p><span className="font-bold">Langues :</span> {selectedUser.languages.join(', ')}</p>}
                  {!!selectedUser.interests?.length && <p><span className="font-bold">Centres d’intérêt :</span> {selectedUser.interests.join(', ')}</p>}
                </div>
              </div>
            ) : (
              <p className="mt-6 text-sm text-zinc-600">Profil indisponible.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
