'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

type AuthUser = {
  role: string;
  created_at?: string;
  name?: string;
  avatar_initials?: string;
};

type AuthContext = {
  user: AuthUser | null;
  loading: boolean;
} | null;

export default function AdminPage() {
  const auth = useAuth() as AuthContext;
  const user = auth?.user;
  const loading = auth?.loading;
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
      return;
    }
    if (!loading && user && user.role !== 'Admin') {
      router.replace('/dashboard');
    }
  }, [loading, user, router]);

  if (loading || !user) return null;

  const adminSections = [
    {
      title: 'Gestion des Voyages',
      description: 'Créer, modifier ou supprimer des voyages',
      href: '/admin/trips',
      icon: '✈️',
      color: 'from-blue-500/20 to-blue-600/10',
    },
    {
      title: 'Gestion des Témoignages',
      description: 'Gérer les avis et témoignages des clients',
      href: '/admin/testimonials',
      icon: '⭐',
      color: 'from-amber-500/20 to-amber-600/10',
    },
    {
      title: 'Feature Flags',
      description: 'Contrôler les fonctionnalités activées',
      href: '/admin/feature-flags',
      icon: '🚩',
      color: 'from-emerald-500/20 to-emerald-600/10',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6F1E6] text-zinc-900 font-sans">
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-600">Dashboard</p>
            <h1 className="text-3xl font-extrabold tracking-tight">Administration</h1>
          </div>
          <a href="/dashboard" className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white/90 px-4 py-2 text-sm font-semibold hover:bg-white transition-colors">Retour au dashboard</a>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {adminSections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className={`rounded-3xl border border-zinc-200 bg-gradient-to-br ${section.color} p-6 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all group`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-3xl mb-3">{section.icon}</p>
                  <h3 className="text-lg font-semibold text-zinc-900 group-hover:text-zinc-700">{section.title}</h3>
                  <p className="mt-2 text-sm text-zinc-600">{section.description}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-zinc-700 group-hover:text-zinc-900">
                Accéder
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
