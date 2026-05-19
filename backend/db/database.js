const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'solowithpeace.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Voyageur',
    avatar_initials TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS trips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    destination TEXT NOT NULL,
    start_date TEXT,
    end_date TEXT,
    spots_total INTEGER DEFAULT 8,
    spots_left INTEGER DEFAULT 8,
    category TEXT,
    gradient TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    icon_type TEXT,
    color TEXT DEFAULT 'emerald',
    participant_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_name TEXT NOT NULL,
    author_initials TEXT NOT NULL,
    author_color TEXT DEFAULT 'emerald',
    quote_title TEXT NOT NULL,
    quote_body TEXT NOT NULL,
    subtitle TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

function seed() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count === 0) {
    const insertUser = db.prepare(
      'INSERT INTO users (email, password, name, role, avatar_initials) VALUES (?, ?, ?, ?, ?)'
    );
    insertUser.run('admin@admin.com', bcrypt.hashSync('admin', 10), 'Admin SWP', 'Admin', 'AS');
    insertUser.run('alice@example.com', bcrypt.hashSync('alice123', 10), 'Alice Martin', 'Voyageur', 'AM');
    insertUser.run('bob@example.com', bcrypt.hashSync('bob123', 10), 'Bob Dupont', 'Voyageur', 'BD');
    insertUser.run('user@user.com', bcrypt.hashSync('user', 10), 'User Test', 'Voyageur', 'UT');
    console.log('[DB] Utilisateurs seed insérés');
  }

  const tripCount = db.prepare('SELECT COUNT(*) as count FROM trips').get();
  if (tripCount.count === 0) {
    const insertTrip = db.prepare(`
      INSERT INTO trips (title, description, destination, start_date, end_date, spots_total, spots_left, category, gradient, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertTrip.run('Randonnée dans les Alpes', 'Air pur, panoramas et compagnons de route. 5 jours de trek dans le massif du Mont-Blanc avec un guide professionnel.', 'France', '2026-07-10', '2026-07-15', 8, 3, 'Rando & Treks', 'from-amber-500/40 via-rose-500/25 to-sky-500/20', 1);
    insertTrip.run('Croisière aux Philippines', 'Plages, îles, snorkeling et soirées partagées. Découvrez les 7000 îles en voilier avec des compagnons de voyage.', 'Philippines', '2026-08-01', '2026-08-14', 10, 5, 'Découverte', 'from-sky-500/35 via-emerald-500/20 to-amber-500/20', 2);
    insertTrip.run('Temples & Gastronomie au Japon', 'Culture, temples, gastronomie et aventures urbaines. Tokyo, Kyoto, Osaka — 13 jours de découverte.', 'Japon', '2026-09-05', '2026-09-18', 6, 2, 'Culture', 'from-emerald-500/30 via-sky-500/20 to-rose-500/25', 1);
    insertTrip.run('Safari en Tanzanie', 'Les Big Five, la savane et le Kilimandjaro. Une aventure africaine inoubliable au cœur du Serengeti.', 'Tanzanie', '2026-10-15', '2026-10-26', 8, 4, 'Aventure', 'from-amber-600/40 via-rose-400/25 to-amber-400/20', 3);
    insertTrip.run('Road Trip en Islande', 'Aurores boréales, geysers et paysages lunaires. La Ring Road en van aménagé, 10 jours de liberté.', 'Islande', '2026-11-01', '2026-11-10', 4, 1, 'Rando & Treks', 'from-sky-400/40 via-indigo-500/25 to-emerald-400/20', 2);
    insertTrip.run('Retraite Yoga à Bali', 'Méditation, yoga et cuisine balinaise. Reconnectez-vous à l\'essentiel dans un cadre paradisiaque.', 'Indonésie', '2026-12-01', '2026-12-10', 12, 7, 'Bien-être', 'from-rose-400/35 via-amber-400/25 to-emerald-400/20', 3);
    console.log('[DB] Voyages seed insérés');
  }

  const activityCount = db.prepare('SELECT COUNT(*) as count FROM activities').get();
  if (activityCount.count === 0) {
    const insertActivity = db.prepare(`
      INSERT INTO activities (title, description, category, icon_type, color, participant_count)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertActivity.run('Rand & Treks', 'Rando, nature et défis. Rejoignez des groupes de marcheurs passionnés dans les plus beaux paysages.', 'outdoor', 'mountain', 'emerald', 142);
    insertActivity.run('Sorties & Soirées', 'Rencontres et moments. Bars, restaurants, soirées thématiques avec d\'autres voyageurs solos.', 'social', 'party', 'sky', 98);
    insertActivity.run('Ateliers & Culture', 'Ateliers, visites, découvertes. Musées, cours de cuisine, arts locaux et immersion culturelle.', 'culture', 'culture', 'amber', 76);
    insertActivity.run('Gastronomie & Marchés', 'Saveurs, marchés et fun. Food tours, cours de cuisine locale et dégustation de spécialités.', 'food', 'food', 'rose', 113);
    console.log('[DB] Activités seed insérées');
  }

  const testimonialCount = db.prepare('SELECT COUNT(*) as count FROM testimonials').get();
  if (testimonialCount.count === 0) {
    const insertTestimonial = db.prepare(`
      INSERT INTO testimonials (author_name, author_initials, author_color, quote_title, quote_body, subtitle)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertTestimonial.run('Alex Fontaine', 'AF', 'emerald', 'Super expérience !', "J'ai rencontré des personnes incroyables. Le programme était clair et l'ambiance au top.", 'Alex • Voyage en solo');
    insertTestimonial.run('Maya Koulibaly', 'MK', 'sky', 'On a créé des souvenirs.', 'De la rando aux soirées, tout était pensé pour faciliter les rencontres. Je recommande vraiment !', 'Maya • Croisière & culture');
    insertTestimonial.run('Thomas Renard', 'TR', 'amber', 'Une découverte totale.', "Le Japon était sur ma liste depuis des années, mais je n'aurais jamais osé y aller seul. Merci SoloWithPeace !", 'Thomas • Japon culturel');
    insertTestimonial.run('Sara Petit', 'SP', 'rose', "Je reviens l'année prochaine !", "L'organisation était parfaite, le groupe sympa. Bali était magique. Une retraite dont j'avais besoin.", 'Sara • Retraite à Bali');
    console.log('[DB] Témoignages seed insérés');
  }
}

seed();

module.exports = db;
