const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Trip = require('./models/Trip');
const Activity = require('./models/Activity');
const Testimonial = require('./models/Testimonial');
const FeatureFlag = require('./models/FeatureFlag');

jest.setTimeout(600000);

let mongoServer;

async function seedTestData() {
  const passwordHash = await bcrypt.hash('admin', 10);

  const admin = await User.create({
    email: 'admin@admin.com',
    password: passwordHash,
    name: 'Admin SoloWithPeace',
    role: 'Admin',
    avatar_initials: 'AS',
    bio: 'Organisateur de voyages test.',
    country: 'France',
    languages: ['Français', 'Anglais'],
    interests: ['Culture', 'Randonnée'],
  });

  const testUser = await User.create({
    email: 'user@user.com',
    password: await bcrypt.hash('user123', 10),
    name: 'Utilisateur Test',
    role: 'Voyageur',
    avatar_initials: 'UT',
    bio: 'Voyageur test prêt à rejoindre un groupe.',
    country: 'Belgique',
    languages: ['Français'],
    interests: ['Rencontres', 'Gastronomie'],
  });

  await Trip.create([
    {
      title: 'Temples & Gastronomie au Japon',
      description: 'Culture, temples, gastronomie et aventures urbaines.',
      destination: 'Japon',
      start_date: '2026-09-05',
      end_date: '2026-09-18',
      spots_total: 6,
      spots_left: 2,
      category: 'Culture',
      gradient: 'from-emerald-500/30 via-sky-500/20 to-rose-500/25',
      created_by: admin._id,
      members: [{ user: testUser._id }],
      accommodation: {
        type: 'personnel',
        description: 'Chambres individuelles proches des transports.',
      },
    },
    {
      title: 'Safari en Tanzanie',
      description: 'Les Big Five, la savane et une aventure africaine inoubliable.',
      destination: 'Tanzanie',
      start_date: '2026-10-15',
      end_date: '2026-10-26',
      spots_total: 8,
      spots_left: 4,
      category: 'Aventure',
      gradient: 'from-amber-600/40 via-rose-400/25 to-amber-400/20',
      created_by: admin._id,
      members: [],
      accommodation: {
        type: 'commun',
        description: 'Lodges partagés pendant les étapes du safari.',
      },
    },
  ]);

  await Activity.create([
    {
      title: 'Randonnée dans les montagnes',
      description: 'Trek au cœur de paysages sauvages et rencontres inspirantes.',
      category: 'Aventure',
      icon_type: 'mountain',
      color: 'emerald',
      participant_count: 142,
    },
    {
      title: 'Ateliers culturels',
      description: 'Découverte des traditions locales et expériences créatives.',
      category: 'Culture',
      icon_type: 'culture',
      color: 'amber',
      participant_count: 76,
    },
  ]);

  await Testimonial.create([
    {
      author_name: 'Alex Fontaine',
      author_initials: 'AF',
      author_color: 'emerald',
      quote_title: 'Une expérience fantastique',
      quote_body: "Je me suis senti totalement accompagné du début à la fin.",
      subtitle: 'Alex • Japon culturel',
    },
    {
      author_name: 'Maya Koulibaly',
      author_initials: 'MK',
      author_color: 'sky',
      quote_title: 'Rencontres inoubliables',
      quote_body: "Le voyage était super bien organisé et j'ai fait de nouveaux amis.",
      subtitle: 'Maya • Safari en Tanzanie',
    },
  ]);

  await FeatureFlag.create([
    {
      key: 'show_exclusive_trips',
      name: 'Offres exclusives',
      description: 'Présente une section de voyages exclusifs sur l’accueil et le dashboard.',
      enabled: false,
    },
    {
      key: 'enable_testimonials_banner',
      name: 'Bannière témoignages',
      description: 'Affiche une bannière spéciale quand les témoignages sont actifs.',
      enabled: true,
    },    {
      key: 'maintenance_mode',
      name: 'Maintenance Mode',
      description: 'Enable maintenance mode to restrict access',
      enabled: false,
    },  ]);
}

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
  process.env.NODE_ENV = 'test';
  await mongoose.connect(process.env.MONGO_URI);
  await seedTestData();
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  await seedTestData();
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});
