# SoloWithPeace

**SoloWithPeace** est une plateforme sociale destinée aux voyageurs solos souhaitant créer des connexions temporaires, contextualisées et sécurisées.  
Le projet est composé d’un frontend **Next.js** et d’un backend **Node.js (Express)**.

---

## 📁 Structure du projet
SoloWithPeace/
├── backend/ # API Express
│ ├── Dockerfile
│ ├── index.js
│ ├── package.json
│ └── ...
├── frontend/ # Application Next.js
│ ├── Dockerfile
│ ├── next.config.js
│ ├── package.json
│ └── ...
├── docker-compose.yml
└── README.md

text

---

## 🚀 Installation et démarrage

### Prérequis
- **Node.js** (version 18 ou supérieure)
- **npm** ou **yarn**
- **Docker** et **Docker Compose** (optionnel)

### Option 1 : Lancement local (sans Docker)

#### Backend
```bash
cd backend
npm install
npm run dev
Le serveur tourne sur http://localhost:5000.

Frontend
bash
cd frontend
npm install
npm run dev
L’application est accessible sur http://localhost:3000.

Le fichier frontend/next.config.js configure un proxy pour rediriger les appels /api/* vers le backend (http://localhost:5000/api/*).

Option 2 : Lancement avec Docker
À la racine du projet, exécutez :

bash
docker-compose up --build
Frontend : http://localhost:3000

Backend : http://localhost:5000

Pour arrêter les conteneurs :

bash
docker-compose down
🐳 Configuration Docker
docker-compose.yml
yaml
version: '3.8'

services:
  backend:
    build: ./backend
    container_name: solo-backend
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - NODE_ENV=development
    volumes:
      - ./backend:/app
      - /app/node_modules
    networks:
      - solo-network

  frontend:
    build: ./frontend
    container_name: solo-frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:5000/api
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend
    networks:
      - solo-network

networks:
  solo-network:
    driver: bridge
Dockerfile – Backend (backend/Dockerfile)
dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]
Dockerfile – Frontend (frontend/Dockerfile)
dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
🔧 Variables d’environnement
Backend
PORT : port d’écoute (par défaut 5000)

Frontend
NEXT_PUBLIC_API_URL : URL de l’API backend (ex: http://localhost:5000/api ou http://backend:5000/api en Docker)

🛠️ Technologies utilisées
Frontend : Next.js, React, TypeScript (optionnel), fetch / Axios

Backend : Node.js, Express, CORS, dotenv

Conteneurisation : Docker, Docker Compose

📄 Licence
Projet développé dans le cadre d’un projet académique.

👥 Auteurs
Jordan Jimenez

Branis Kaci

Clément Bardin