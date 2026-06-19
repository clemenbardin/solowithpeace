const bcrypt = require('bcryptjs');

const FIRST_NAMES = [
  'Léa', 'Hugo', 'Chloé', 'Lucas', 'Emma', 'Nathan', 'Camille', 'Louis',
  'Manon', 'Arthur', 'Julie', 'Raphaël', 'Sarah', 'Tom', 'Inès', 'Maxime',
  'Clara', 'Antoine', 'Zoé', 'Paul', 'Margot', 'Gabriel', 'Élise', 'Théo',
  'Anaïs', 'Julien', 'Lina', 'Noah', 'Océane', 'Victor',
];

const LAST_NAMES = [
  'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit',
  'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel',
  'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier', 'Girard',
  'Bonnet', 'Dupont', 'Lambert', 'Fontaine', 'Renard', 'Koulibaly', 'Petit',
];

const COUNTRIES = [
  'France', 'Belgique', 'Suisse', 'Canada', 'Espagne', 'Italie', 'Portugal',
  'Allemagne', 'Maroc', 'Sénégal', 'Japon', 'Brésil',
];

const LANGUAGE_POOL = [
  'Français', 'Anglais', 'Espagnol', 'Allemand', 'Italien', 'Portugais', 'Arabe', 'Japonais',
];

const INTEREST_POOL = [
  'Randonnée', 'Photo', 'Cuisine locale', 'Musées', 'Plongée', 'Yoga',
  'Vanlife', 'Culture', 'Gastronomie', 'Rencontres', 'Nature', 'Safari',
  'Surf', 'Architecture', 'Festivals', 'Trek', 'Vélo', 'Danse',
];

const BIOS = [
  'Voyageuse solo depuis 3 ans, j’aime les groupes calmes et bien organisés.',
  'Toujours partant pour une rando matinale et un bon resto le soir.',
  'Je voyage pour rencontrer des gens et découvrir des cultures différentes.',
  'Fan de grands espaces et de couchers de soleil en montagne.',
  'Curieux de tout, surtout les marchés locaux et la street food.',
  'Première expérience en groupe, motivé et ponctuel.',
  'Photographe amateur, je documente chaque escale.',
  'Plutôt chill le jour, festif le soir — l’équilibre parfait.',
  'Passionné de randonnée et de cartes IGN.',
  'En quête de voyages qui mélangent nature et rencontres.',
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickMany(arr, count) {
  const copy = [...arr];
  const result = [];
  const n = Math.min(count, copy.length);
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
}

function buildInitials(name) {
  return name.trim().split(/\s+/).map((part) => part[0]).join('').toUpperCase().slice(0, 2);
}

function buildUser({ index, passwordHash, overrides = {} }) {
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  const name = `${first} ${last}`;

  return {
    email: `voyageur${index}@swp.test`,
    password: passwordHash,
    name,
    role: 'Voyageur',
    avatar_initials: buildInitials(name),
    country: pick(COUNTRIES),
    languages: pickMany(LANGUAGE_POOL, 1 + Math.floor(Math.random() * 2)),
    interests: pickMany(INTEREST_POOL, 2 + Math.floor(Math.random() * 2)),
    bio: pick(BIOS),
    ...overrides,
  };
}

async function buildCoreUsers() {
  const hash = (pwd) => bcrypt.hash(pwd, 10);
  return [
    {
      email: 'admin@admin.com',
      password: await hash('admin'),
      name: 'Admin SWP',
      role: 'Admin',
      avatar_initials: 'AS',
      bio: 'Organisateur SoloWithPeace, adepte des itinéraires fluides et des groupes bienveillants.',
      country: 'France',
      languages: ['Français', 'Anglais'],
      interests: ['Organisation', 'Culture', 'Randonnée'],
    },
    {
      email: 'alice@example.com',
      password: await hash('alice123'),
      name: 'Alice Martin',
      role: 'Voyageur',
      avatar_initials: 'AM',
      bio: 'Voyageuse curieuse, toujours partante pour découvrir une ville à pied.',
      country: 'Belgique',
      languages: ['Français', 'Anglais', 'Espagnol'],
      interests: ['Photo', 'Cuisine locale', 'Musées'],
    },
    {
      email: 'bob@example.com',
      password: await hash('bob123'),
      name: 'Bob Dupont',
      role: 'Voyageur',
      avatar_initials: 'BD',
      bio: 'Fan de nature et de grands espaces, plutôt trek au lever du soleil.',
      country: 'Suisse',
      languages: ['Français', 'Allemand'],
      interests: ['Trek', 'Safari', 'Vanlife'],
    },
    {
      email: 'user@user.com',
      password: await hash('user'),
      name: 'User Test',
      role: 'Voyageur',
      avatar_initials: 'UT',
      bio: 'Nouveau membre, prêt à tester ses premières aventures en groupe.',
      country: 'France',
      languages: ['Français'],
      interests: ['Rencontres', 'Découverte'],
    },
  ];
}

async function buildVoyageurs(count) {
  const passwordHash = await bcrypt.hash('password123', 10);
  return Array.from({ length: count }, (_, i) => buildUser({ index: i + 1, passwordHash }));
}

module.exports = {
  buildCoreUsers,
  buildVoyageurs,
  buildInitials,
};
