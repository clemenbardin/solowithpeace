'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

type AuthUser = {
  role: string;
  created_at?: string;
  name?: string;
  avatar_initials?: string;
};

type Trip = {
  _id: string;
  title: string;
  destination: string;
  description: string;
  start_date: string;
  end_date: string;
  spots_total: number;
  spots_left: number;
  category: string;
};

type TripForm = {
  title: string;
  destination: string;
  description: string;
  start_date: string;
  end_date: string;
  spots_total: number;
  category: string;
};

type AuthContext = {
  user: AuthUser | null;
  loading: boolean;
} | null;

export default function AdminTripsPage() {
  const auth = useAuth() as AuthContext;
  const user = auth?.user;
  const loading = auth?.loading;
  const router = useRouter();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Trip | null>(null);
  const [form, setForm] = useState<TripForm>({ title: '', destination: '', description: '', start_date: '', end_date: '', spots_total: 8, category: '' });

  useEffect(() => {
    if (!loading && !user) { router.replace('/login'); return; }
    if (!loading && user && user.role !== 'Admin') { router.replace('/dashboard'); }
  }, [loading, user, router]);

  useEffect(() => {
    if (!loading && user) { fetchTrips(); }
  }, [loading, user]);

  const fetchTrips = async () => {
    setError(null);
    try {
      const res = await fetch('/api/trips');
      const data = await res.json();
      if (Array.isArray(data)) setTrips(data);
    } catch { setError('Impossible de charger les voyages'); }
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const token = localStorage.getItem('token');
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `/api/trips/${editing._id}` : '/api/trips';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Échec');
      const saved = await res.json();
      if (editing) {
        setTrips((cur) => cur.map((t) => (t._id === saved._id ? saved : t)));
        setEditing(null);
      } else {
        setTrips((cur) => [saved, ...cur]);
      }
      setForm({ title: '', destination: '', description: '', start_date: '', end_date: '', spots_total: 8, category: '' });
    } catch {
      setError('Erreur lors de l\'enregistrement');
    } finally { setSaving(false); }
  };

  const edit = (t: Trip) => { setEditing(t); setForm({ title: t.title, destination: t.destination, description: t.description || '', start_date: t.start_date || '', end_date: t.end_date || '', spots_total: t.spots_total || 8, category: t.category || '' }); };

  const remove = async (id: string) => {
    if (!confirm('Supprimer ce voyage ?')) return;
    setSaving(true); setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/trips/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Échec');
      setTrips((cur) => cur.filter((t) => t._id !== id));
    } catch { setError('Erreur lors de la suppression'); } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-[#F6F1E6] text-zinc-900 font-sans">
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-600">Administration</p>
            <h1 className="text-3xl font-extrabold tracking-tight">Gestion des Voyages</h1>
          </div>
          <a href="/dashboard" className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white/90 px-4 py-2 text-sm font-semibold hover:bg-white transition-colors">Retour au dashboard</a>
        </div>

        {error && <div className="mb-4 rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700">{error}</div>}

        <form onSubmit={submit} className="mb-6 grid gap-3 sm:grid-cols-2">
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Titre" className="p-3 rounded-lg border" />
          <input required value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder="Destination" className="p-3 rounded-lg border" />
          <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Catégorie" className="p-3 rounded-lg border" />
          <input type="number" value={form.spots_total} onChange={(e) => setForm({ ...form, spots_total: Number(e.target.value) })} placeholder="Places totales" className="p-3 rounded-lg border" />
          <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} placeholder="Date de début" className="p-3 rounded-lg border" />
          <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} placeholder="Date de fin" className="p-3 rounded-lg border" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="p-3 rounded-lg border col-span-2" />
          <div className="col-span-2 flex gap-2">
            <button disabled={saving} type="submit" className="rounded-full bg-emerald-600 px-4 py-2 text-white">{editing ? 'Mettre à jour' : 'Ajouter'}</button>
            {editing && <button type="button" onClick={() => { setEditing(null); setForm({ title: '', destination: '', description: '', start_date: '', end_date: '', spots_total: 8, category: '' }); }} className="rounded-full border px-4 py-2">Annuler</button>}
          </div>
        </form>

        <div className="grid gap-4 sm:grid-cols-2">
          {trips.map((t) => (
            <div key={t._id} className="rounded-3xl border border-zinc-200 bg-white/90 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-zinc-700">{t.title} — {t.destination}</p>
                  <p className="mt-2 text-sm text-zinc-600">{t.description}</p>
                  <p className="mt-2 text-xs text-zinc-500">Places: {t.spots_left}/{t.spots_total} • Catégorie: {t.category}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => edit(t)} className="rounded-full border px-3 py-1 text-sm">Modifier</button>
                  <button onClick={() => remove(t._id)} className="rounded-full border px-3 py-1 text-sm text-rose-600">Supprimer</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
