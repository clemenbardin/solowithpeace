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

type Testimonial = {
  _id: string;
  author_name: string;
  author_initials: string;
  author_color: string;
  quote_title: string;
  quote_body: string;
  subtitle?: string;
};

type TestimonialForm = {
  author_name: string;
  author_initials: string;
  author_color: string;
  quote_title: string;
  quote_body: string;
  subtitle: string;
};

type AuthContext = {
  user: AuthUser | null;
  loading: boolean;
} | null;

export default function AdminTestimonialsPage() {
  const auth = useAuth() as AuthContext;
  const user = auth?.user;
  const loading = auth?.loading;
  const router = useRouter();

  const [items, setItems] = useState<Testimonial[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState<TestimonialForm>({ author_name: '', author_initials: '', author_color: 'emerald', quote_title: '', quote_body: '', subtitle: '' });

  useEffect(() => {
    if (!loading && !user) { router.replace('/login'); return; }
    if (!loading && user && user.role !== 'Admin') { router.replace('/dashboard'); }
  }, [loading, user, router]);

  useEffect(() => { if (!loading && user) fetchItems(); }, [loading, user]);

  const fetchItems = async () => {
    setError(null);
    try {
      const res = await fetch('/api/testimonials');
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch { setError('Impossible de charger les témoignages'); }
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const token = localStorage.getItem('token');
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `/api/testimonials/${editing._id}` : '/api/testimonials';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Échec');
      const saved = await res.json();
      if (editing) {
        setItems((cur) => cur.map((t) => (t._id === saved._id ? saved : t)));
        setEditing(null);
      } else {
        setItems((cur) => [saved, ...cur]);
      }
      setForm({ author_name: '', author_initials: '', author_color: 'emerald', quote_title: '', quote_body: '', subtitle: '' });
    } catch { setError('Erreur lors de l\'enregistrement'); } finally { setSaving(false); }
  };

  const edit = (t: Testimonial) => { setEditing(t); setForm({ author_name: t.author_name, author_initials: t.author_initials, author_color: t.author_color || 'emerald', quote_title: t.quote_title, quote_body: t.quote_body, subtitle: t.subtitle || '' }); };

  const remove = async (id: string) => {
    if (!confirm('Supprimer ce témoignage ?')) return;
    setSaving(true); setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/testimonials/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Échec');
      setItems((cur) => cur.filter((t) => t._id !== id));
    } catch { setError('Erreur lors de la suppression'); } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-[#F6F1E6] text-zinc-900 font-sans">
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-600">Administration</p>
            <h1 className="text-3xl font-extrabold tracking-tight">Gestion des Témoignages</h1>
          </div>
          <a href="/dashboard" className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white/90 px-4 py-2 text-sm font-semibold hover:bg-white transition-colors">Retour au dashboard</a>
        </div>

        {error && <div className="mb-4 rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700">{error}</div>}

        <form onSubmit={submit} className="mb-6 grid gap-3 sm:grid-cols-2">
          <input required value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} placeholder="Nom de l'auteur" className="p-3 rounded-lg border" />
          <input required value={form.author_initials} onChange={(e) => setForm({ ...form, author_initials: e.target.value })} placeholder="Initiales" className="p-3 rounded-lg border" />
          <select value={form.author_color} onChange={(e) => setForm({ ...form, author_color: e.target.value })} className="p-3 rounded-lg border">
            <option value="emerald">Émeraude</option>
            <option value="blue">Bleu</option>
            <option value="purple">Violet</option>
            <option value="rose">Rose</option>
            <option value="amber">Ambre</option>
          </select>
          <input required value={form.quote_title} onChange={(e) => setForm({ ...form, quote_title: e.target.value })} placeholder="Titre du quote" className="p-3 rounded-lg border" />
          <textarea required value={form.quote_body} onChange={(e) => setForm({ ...form, quote_body: e.target.value })} placeholder="Texte" className="p-3 rounded-lg border col-span-2" />
          <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Sous-titre" className="p-3 rounded-lg border" />
          <div className="col-span-2 flex gap-2">
            <button disabled={saving} type="submit" className="rounded-full bg-emerald-600 px-4 py-2 text-white">{editing ? 'Mettre à jour' : 'Ajouter'}</button>
            {editing && <button type="button" onClick={() => { setEditing(null); setForm({ author_name: '', author_initials: '', author_color: 'emerald', quote_title: '', quote_body: '', subtitle: '' }); }} className="rounded-full border px-4 py-2">Annuler</button>}
          </div>
        </form>

        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((t) => (
            <div key={t._id} className="rounded-3xl border border-zinc-200 bg-white/90 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-zinc-700">{t.quote_title} — {t.author_name}</p>
                  <p className="mt-2 text-sm text-zinc-600">{t.quote_body}</p>
                  {t.subtitle && <p className="mt-2 text-xs text-zinc-500">{t.subtitle}</p>}
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
