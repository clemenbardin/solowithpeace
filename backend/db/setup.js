'use strict';
const bcrypt = require('bcryptjs');
const User        = require('../models/User');
const Trip        = require('../models/Trip');
const Activity    = require('../models/Activity');
const Testimonial = require('../models/Testimonial');

const USERS = [
  { email: 'admin@admin.com',     password: 'admin',    name: 'Admin',         role: 'Admin',    avatar_initials: 'AD' },
  { email: 'alice@example.com',   password: 'alice123', name: 'Alice Martin',  role: 'Voyageur', avatar_initials: 'AM' },
  { email: 'bob@example.com',     password: 'bob123',   name: 'Bob Dupont',    role: 'Voyageur', avatar_initials: 'BD' },
  { email: 'user@user.com',       password: 'user',     name: 'User Test',     role: 'Voyageur', avatar_initials: 'UT' },
];

const TRIPS = [
  {
    title: 'Découverte de Kyoto',
    description: 'Plongez au cœur du Japon traditionnel entre temples shintoïstes, jardins zen et cerisiers en fleurs.',
    destination: 'Kyoto, Japon',
    start_date: '2025-04-10',
    end_date: '2025-04-22',
    spots_total: 8,
    spots_left: 3,
    category: 'culture',
    gradient: 'from-pink-400 to-red-500',
  },
  {
    title: 'Trekking en Patagonie',
    description: 'Une aventure sauvage au bout du monde, entre glaciers, lacs turquoise et condors en vol.',
    destination: 'Patagonie, Argentine',
    start_date: '2025-11-05',
    end_date: '2025-11-19',
    spots_total: 6,
    spots_left: 2,
    category: 'nature',
    gradient: 'from-blue-400 to-cyan-500',
  },
  {
    title: 'Week-end à Barcelone',
    description: 'Architecture moderniste, tapas, plages et vie nocturne dans la capitale catalane.',
    destination: 'Barcelone, Espagne',
    start_date: '2025-06-14',
    end_date: '2025-06-18',
    spots_total: 10,
    spots_left: 6,
    category: 'urban',
    gradient: 'from-yellow-400 to-orange-500',
  },
  {
    title: 'Escapade à Marrakech',
    description: 'Perdez-vous dans les souks colorés, savourez le tajine et admirez les riads majestueux.',
    destination: 'Marrakech, Maroc',
    start_date: '2025-09-20',
    end_date: '2025-09-27',
    spots_total: 8,
    spots_left: 5,
    category: 'culture',
    gradient: 'from-orange-400 to-red-400',
  },
  {
    title: 'Aurores boréales en Islande',
    description: 'Géysers, cascades et nuits illuminées par les aurores boréales dans un paysage lunaire.',
    destination: 'Islande',
    start_date: '2026-01-15',
    end_date: '2026-01-22',
    spots_total: 4,
    spots_left: 1,
    category: 'nature',
    gradient: 'from-green-400 to-teal-500',
  },
  {
    title: 'Plages de Thaïlande',
    description: 'Eaux cristallines, temples bouddhistes et street food délicieuse dans le sourire de l\'Asie.',
    destination: 'Thaïlande',
    start_date: '2025-12-26',
    end_date: '2026-01-08',
    spots_total: 12,
    spots_left: 7,
    category: 'plage',
    gradient: 'from-emerald-400 to-blue-500',
  },
];

const ACTIVITIES = [
  {
    title: 'Randonnée en montagne',
    description: 'Explorez des sentiers alpins avec un guide expérimenté.',
    category: 'outdoor',
    icon_type: 'mountain',
    color: 'emerald',
    participant_count: 142,
  },
  {
    title: 'Soirée culturelle',
    description: 'Rencontres et échanges autour des traditions locales.',
    category: 'social',
    icon_type: 'party',
    color: 'purple',
    participant_count: 98,
  },
  {
    title: 'Visite de musées',
    description: 'Découverte des collections d\'art et d\'histoire des grandes villes.',
    category: 'culture',
    icon_type: 'culture',
    color: 'blue',
    participant_count: 215,
  },
  {
    title: 'Atelier gastronomique',
    description: 'Apprenez à cuisiner les spécialités locales avec des chefs.',
    category: 'food',
    icon_type: 'food',
    color: 'amber',
    participant_count: 176,
  },
];

const TESTIMONIALS = [
  {
    author_name: 'Sophie Laurent',
    author_initials: 'SL',
    author_color: 'emerald',
    quote_title: 'Une expérience inoubliable au Japon',
    quote_body: 'Le voyage à Kyoto organisé par SoloWithPeace était parfait. J\'ai rencontré des personnes formidables et découvert une culture fascinante. Je recommande vivement !',
    subtitle: 'Voyage à Kyoto · Avril 2024',
  },
  {
    author_name: 'Marc Dubois',
    author_initials: 'MD',
    author_color: 'blue',
    quote_title: 'La Patagonie, un rêve devenu réalité',
    quote_body: 'Partir seul en Patagonie semblait intimidant, mais avec ce groupe j\'ai vécu les plus belles aventures de ma vie. Le trek dans les Torres del Paine restera gravé dans ma mémoire.',
    subtitle: 'Trek en Patagonie · Novembre 2024',
  },
  {
    author_name: 'Emma Petit',
    author_initials: 'EP',
    author_color: 'pink',
    quote_title: 'Barcelone, une ville pleine de vie',
    quote_body: 'Week-end parfaitement organisé, ambiance détendue et bienveillante. On a tout vu, tout mangé, tout dansé. Déjà inscrite pour le prochain !',
    subtitle: 'Week-end Barcelone · Juin 2024',
  },
  {
    author_name: 'Thomas Bernard',
    author_initials: 'TB',
    author_color: 'orange',
    quote_title: 'Marrakech m\'a conquis',
    quote_body: 'Les souks, les épices, la médina... Marrakech est une explosion de couleurs et de saveurs. Le groupe était super, je garde des amis de ce voyage.',
    subtitle: 'Escapade Marrakech · Septembre 2024',
  },
];

async function seedInitialData() {
  const existingUsers = await User.countDocuments();
  if (existingUsers > 0) {
    console.log('[Seed] Données déjà présentes, insertion ignorée (utilisez --reset pour forcer)');
    return;
  }

  // Users
  const hashedUsers = await Promise.all(
    USERS.map(async (u) => ({ ...u, password: await bcrypt.hash(u.password, 10) }))
  );
  const createdUsers = await User.insertMany(hashedUsers);
  console.log(`[Seed] ${createdUsers.length} utilisateurs insérés`);

  // Trips (attribués au premier user = admin)
  const tripsWithOwner = TRIPS.map((t) => ({ ...t, created_by: createdUsers[0]._id }));
  const createdTrips = await Trip.insertMany(tripsWithOwner);
  console.log(`[Seed] ${createdTrips.length} voyages insérés`);

  // Activities
  const createdActivities = await Activity.insertMany(ACTIVITIES);
  console.log(`[Seed] ${createdActivities.length} activités insérées`);

  // Testimonials
  const createdTestimonials = await Testimonial.insertMany(TESTIMONIALS);
  console.log(`[Seed] ${createdTestimonials.length} témoignages insérés`);
}

async function resetDatabase() {
  await Promise.all([
    User.deleteMany({}),
    Trip.deleteMany({}),
    Activity.deleteMany({}),
    Testimonial.deleteMany({}),
  ]);
}

module.exports = { seedInitialData, resetDatabase };
