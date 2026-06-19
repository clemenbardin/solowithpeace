require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
 
const User = require('../models/User');
const Trip = require('../models/Trip');
const Activity = require('../models/Activity');
const Testimonial = require('../models/Testimonial');
 
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
    users = await User.insertMany([
      { email: 'admin@admin.com', password: await bcrypt.hash('admin', 10), name: 'Admin SWP', role: 'Admin', avatar_initials: 'AS', bio: 'Organisateur SoloWithPeace, adepte des itinéraires fluides et des groupes bienveillants.', country: 'France', languages: ['Français', 'Anglais'], interests: ['Organisation', 'Culture', 'Randonnée'] },
      { email: 'alice@example.com', password: await bcrypt.hash('alice123', 10), name: 'Alice Martin', role: 'Voyageur', avatar_initials: 'AM', bio: 'Voyageuse curieuse, toujours partante pour découvrir une ville à pied.', country: 'Belgique', languages: ['Français', 'Anglais', 'Espagnol'], interests: ['Photo', 'Cuisine locale', 'Musées'] },
      { email: 'bob@example.com', password: await bcrypt.hash('bob123', 10), name: 'Bob Dupont', role: 'Voyageur', avatar_initials: 'BD', bio: 'Fan de nature et de grands espaces, plutôt trek au lever du soleil.', country: 'Suisse', languages: ['Français', 'Allemand'], interests: ['Trek', 'Safari', 'Vanlife'] },
      { email: 'user@user.com', password: await bcrypt.hash('user', 10), name: 'User Test', role: 'Voyageur', avatar_initials: 'UT', bio: 'Nouveau membre, prêt à tester ses premières aventures en groupe.', country: 'France', languages: ['Français'], interests: ['Rencontres', 'Découverte'] },
    ]);
    console.log('[Seed] Utilisateurs insérés');
  } else {
    users = await User.find().limit(3);
  }
 
  const [admin, alice, bob] = users;
 
  const tripCount = await Trip.countDocuments();
  if (tripCount === 0) {
    await Trip.insertMany([
      { title: 'Randonnée dans les Alpes', description: 'Air pur, panoramas et compagnons de route. 5 jours de trek dans le massif du Mont-Blanc avec un guide professionnel.', destination: 'France', start_date: '2026-07-10', end_date: '2026-07-15', spots_total: 8, spots_left: 3, category: 'Rando & Treks', gradient: 'from-amber-500/40 via-rose-500/25 to-sky-500/20', created_by: admin._id, members: [{ user: alice._id }, { user: bob._id }], accommodation: { type: 'commun', description: 'Chambres partagées en refuge, petits groupes de deux à quatre voyageurs.' } },
      { title: 'Croisière aux Philippines', description: 'Plages, îles, snorkeling et soirées partagées. Découvrez les 7000 îles en voilier avec des compagnons de voyage.', destination: 'Philippines', start_date: '2026-08-01', end_date: '2026-08-14', spots_total: 10, spots_left: 5, category: 'Découverte', gradient: 'from-sky-500/35 via-emerald-500/20 to-amber-500/20', created_by: alice._id, members: [{ user: bob._id }], accommodation: { type: 'commun', description: 'Cabines partagées à bord du voilier, espaces communs pour les repas.' } },
      { title: 'Temples & Gastronomie au Japon', description: 'Culture, temples, gastronomie et aventures urbaines. Tokyo, Kyoto, Osaka — 13 jours de découverte.', destination: 'Japon', start_date: '2026-09-05', end_date: '2026-09-18', spots_total: 6, spots_left: 2, category: 'Culture', gradient: 'from-emerald-500/30 via-sky-500/20 to-rose-500/25', created_by: admin._id, members: [{ user: alice._id }], accommodation: { type: 'personnel', description: 'Chambres individuelles en hôtels urbains, repas collectifs prévus certains soirs.' } },
      { title: 'Safari en Tanzanie', description: 'Les Big Five, la savane et le Kilimandjaro. Une aventure africaine inoubliable au cœur du Serengeti.', destination: 'Tanzanie', start_date: '2026-10-15', end_date: '2026-10-26', spots_total: 8, spots_left: 4, category: 'Aventure', gradient: 'from-amber-600/40 via-rose-400/25 to-amber-400/20', created_by: bob._id, members: [{ user: alice._id }], accommodation: { type: 'commun', description: 'Lodges et tentes confortables partagés selon les étapes du safari.' } },
      { title: 'Road Trip en Islande', description: 'Aurores boréales, geysers et paysages lunaires. La Ring Road en van aménagé, 10 jours de liberté.', destination: 'Islande', start_date: '2026-11-01', end_date: '2026-11-10', spots_total: 4, spots_left: 1, category: 'Rando & Treks', gradient: 'from-sky-400/40 via-indigo-500/25 to-emerald-400/20', created_by: alice._id, members: [{ user: bob._id }], accommodation: { type: 'commun', description: 'Vans aménagés partagés, nuits en camping équipé quand la météo le permet.' } },
      { title: 'Retraite Yoga à Bali', description: "Méditation, yoga et cuisine balinaise. Reconnectez-vous à l'essentiel dans un cadre paradisiaque.", destination: 'Indonésie', start_date: '2026-12-01', end_date: '2026-12-10', spots_total: 12, spots_left: 7, category: 'Bien-être', gradient: 'from-rose-400/35 via-amber-400/25 to-emerald-400/20', created_by: bob._id, members: [{ user: alice._id }], accommodation: { type: 'personnel', description: 'Bungalows individuels dans un écolodge avec espaces de pratique communs.' } },
    ]);
    console.log('[Seed] Voyages insérés');
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
 
seed().catch(err => {
  console.error('[Seed] Erreur:', err);
  process.exit(1);
});