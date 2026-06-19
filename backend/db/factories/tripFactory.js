const VOYAGEUR_COUNT = Number(process.env.SEED_VOYAGEUR_COUNT) || 24;

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function randomJoinedAt(daysBack = 30) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date;
}

function assignMembers(tripTemplate, voyageurs, creator) {
  const maxMembers = Math.max(
    1,
    Math.min(tripTemplate.spots_total - 1, Math.floor(tripTemplate.spots_total * 0.75))
  );
  const minMembers = Math.min(2, maxMembers);
  const memberCount = minMembers + Math.floor(Math.random() * (maxMembers - minMembers + 1));

  const pool = shuffle(voyageurs);
  const selected = pool.slice(0, memberCount);

  return {
    ...tripTemplate,
    created_by: creator._id,
    members: selected.map((user) => ({ user: user._id, joined_at: randomJoinedAt() })),
    spots_left: tripTemplate.spots_total - memberCount,
  };
}

function buildTripTemplates(admin, alice, bob) {
  const creators = [admin, alice, bob];

  const templates = [
    {
      title: 'Randonnée dans les Alpes',
      description: 'Air pur, panoramas et compagnons de route. 5 jours de trek dans le massif du Mont-Blanc avec un guide professionnel.',
      destination: 'France',
      start_date: '2026-07-10',
      end_date: '2026-07-15',
      spots_total: 8,
      category: 'Rando & Treks',
      gradient: 'from-amber-500/40 via-rose-500/25 to-sky-500/20',
      accommodation: { type: 'commun', description: 'Chambres partagées en refuge, petits groupes de deux à quatre voyageurs.' },
    },
    {
      title: 'Croisière aux Philippines',
      description: 'Plages, îles, snorkeling et soirées partagées. Découvrez les 7000 îles en voilier avec des compagnons de voyage.',
      destination: 'Philippines',
      start_date: '2026-08-01',
      end_date: '2026-08-14',
      spots_total: 10,
      category: 'Découverte',
      gradient: 'from-sky-500/35 via-emerald-500/20 to-amber-500/20',
      accommodation: { type: 'commun', description: 'Cabines partagées à bord du voilier, espaces communs pour les repas.' },
    },
    {
      title: 'Temples & Gastronomie au Japon',
      description: 'Culture, temples, gastronomie et aventures urbaines. Tokyo, Kyoto, Osaka — 13 jours de découverte.',
      destination: 'Japon',
      start_date: '2026-09-05',
      end_date: '2026-09-18',
      spots_total: 6,
      category: 'Culture',
      gradient: 'from-emerald-500/30 via-sky-500/20 to-rose-500/25',
      accommodation: { type: 'personnel', description: 'Chambres individuelles en hôtels urbains, repas collectifs prévus certains soirs.' },
    },
    {
      title: 'Safari en Tanzanie',
      description: 'Les Big Five, la savane et le Kilimandjaro. Une aventure africaine inoubliable au cœur du Serengeti.',
      destination: 'Tanzanie',
      start_date: '2026-10-15',
      end_date: '2026-10-26',
      spots_total: 8,
      category: 'Aventure',
      gradient: 'from-amber-600/40 via-rose-400/25 to-amber-400/20',
      accommodation: { type: 'commun', description: 'Lodges et tentes confortables partagés selon les étapes du safari.' },
    },
    {
      title: 'Road Trip en Islande',
      description: 'Aurores boréales, geysers et paysages lunaires. La Ring Road en van aménagé, 10 jours de liberté.',
      destination: 'Islande',
      start_date: '2026-11-01',
      end_date: '2026-11-10',
      spots_total: 4,
      category: 'Rando & Treks',
      gradient: 'from-sky-400/40 via-indigo-500/25 to-emerald-400/20',
      accommodation: { type: 'commun', description: 'Vans aménagés partagés, nuits en camping équipé quand la météo le permet.' },
    },
    {
      title: 'Retraite Yoga à Bali',
      description: "Méditation, yoga et cuisine balinaise. Reconnectez-vous à l'essentiel dans un cadre paradisiaque.",
      destination: 'Indonésie',
      start_date: '2026-12-01',
      end_date: '2026-12-10',
      spots_total: 12,
      category: 'Bien-être',
      gradient: 'from-rose-400/35 via-amber-400/25 to-emerald-400/20',
      accommodation: { type: 'personnel', description: 'Bungalows individuels dans un écolodge avec espaces de pratique communs.' },
    },
  ];

  return templates.map((template, index) => {
    const creator = creators[index % creators.length];
    return { template, creator };
  });
}

function buildTripsWithMembers(voyageurs, admin, alice, bob) {
  return buildTripTemplates(admin, alice, bob).map(({ template, creator }) =>
    assignMembers(template, voyageurs, creator)
  );
}

module.exports = {
  VOYAGEUR_COUNT,
  assignMembers,
  buildTripsWithMembers,
};
