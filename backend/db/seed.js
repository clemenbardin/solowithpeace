require('dotenv').config();
const mongoose = require('mongoose');

const User = require('../models/User');
const Trip = require('../models/Trip');
const Activity = require('../models/Activity');
const Testimonial = require('../models/Testimonial');
const { buildCoreUsers, buildVoyageurs } = require('./factories/userFactory');
const { VOYAGEUR_COUNT, buildTripsWithMembers } = require('./factories/tripFactory');

async function seed() {
  const reset = process.argv.includes('--reset');
  const uri = process.env.MONGO_URI;
  await mongoose.connect(uri);
  console.log('[Seed] Connecté à MongoDB');

  if (reset) {
    await User.deleteMany({});
    await Trip.deleteMany({});
    await Activity.deleteMany({});
    await Testimonial.deleteMany({});
    console.log('[Seed] Collections vidées');
  }

  let users;
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    const coreUsers = await buildCoreUsers();
    const factoryUsers = await buildVoyageurs(VOYAGEUR_COUNT);
    users = await User.insertMany([...coreUsers, ...factoryUsers]);
    console.log(`[Seed] ${users.length} utilisateurs insérés (${coreUsers.length} comptes fixes + ${factoryUsers.length} voyageurs générés)`);
  } else {
    users = await User.find();
    console.log(`[Seed] ${users.length} utilisateurs déjà présents — skip utilisateurs`);
  }

  const voyageurs = users.filter((u) => u.role === 'Voyageur');
  const admin = users.find((u) => u.email === 'admin@admin.com') || users.find((u) => u.role === 'Admin');
  const alice = users.find((u) => u.email === 'alice@example.com') || voyageurs[0];
  const bob = users.find((u) => u.email === 'bob@example.com') || voyageurs[1];

  const tripCount = await Trip.countDocuments();
  if (tripCount === 0) {
    const trips = buildTripsWithMembers(voyageurs, admin, alice, bob);
    await Trip.insertMany(trips);
    const totalMembers = trips.reduce((sum, trip) => sum + trip.members.length, 0);
    console.log(`[Seed] ${trips.length} voyages insérés avec ${totalMembers} inscriptions au total`);
  }

  const activityCount = await Activity.countDocuments();
  if (activityCount === 0) {
    await Activity.insertMany([
      { title: 'Rand & Treks', description: 'Rando, nature et défis. Rejoignez des groupes de marcheurs passionnés dans les plus beaux paysages.', category: 'outdoor', icon_type: 'mountain', color: 'emerald', participant_count: 142 },
      { title: 'Sorties & Soirées', description: "Rencontres et moments. Bars, restaurants, soirées thématiques avec d'autres voyageurs solos.", category: 'social', icon_type: 'party', color: 'sky', participant_count: 98 },
      { title: 'Ateliers & Culture', description: 'Ateliers, visites, découvertes. Musées, cours de cuisine, arts locaux et immersion culturelle.', category: 'culture', icon_type: 'culture', color: 'amber', participant_count: 76 },
      { title: 'Gastronomie & Marchés', description: 'Saveurs, marchés et fun. Food tours, cours de cuisine locale et dégustation de spécialités.', category: 'food', icon_type: 'food', color: 'rose', participant_count: 113 },
    ]);
    console.log('[Seed] Activités insérées');
  }

  const testimonialCount = await Testimonial.countDocuments();
  if (testimonialCount === 0) {
    await Testimonial.insertMany([
      { author_name: 'Alex Fontaine', author_initials: 'AF', author_color: 'emerald', quote_title: 'Super expérience !', quote_body: "J'ai rencontré des personnes incroyables. Le programme était clair et l'ambiance au top.", subtitle: 'Alex • Voyage en solo' },
      { author_name: 'Maya Koulibaly', author_initials: 'MK', author_color: 'sky', quote_title: 'On a créé des souvenirs.', quote_body: 'De la rando aux soirées, tout était pensé pour faciliter les rencontres. Je recommande vraiment !', subtitle: 'Maya • Croisière & culture' },
      { author_name: 'Thomas Renard', author_initials: 'TR', author_color: 'amber', quote_title: 'Une découverte totale.', quote_body: "Le Japon était sur ma liste depuis des années, mais je n'aurais jamais osé y aller seul. Merci SoloWithPeace !", subtitle: 'Thomas • Japon culturel' },
      { author_name: 'Sara Petit', author_initials: 'SP', author_color: 'rose', quote_title: "Je reviens l'année prochaine !", quote_body: "L'organisation était parfaite, le groupe sympa. Bali était magique. Une retraite dont j'avais besoin.", subtitle: 'Sara • Retraite à Bali' },
    ]);
    console.log('[Seed] Témoignages insérés');
  }

  await mongoose.disconnect();
  console.log('[Seed] Terminé avec succès');
  process.exit(0);
}

seed().catch((err) => {
  console.error('[Seed] Erreur:', err);
  process.exit(1);
});
