# Motus

Jeu de devinettes de mots dans le navigateur, sur le modèle de *Motus* / *Wordle*.
L'utilisateur a six essais (cinq en difficulté « Difficile ») pour deviner un mot
français. Après chaque tentative, les lettres sont colorées :

- **carré rouge** : lettre bien placée
- **cercle jaune** : lettre présente mais mal placée
- **fond bleu** : lettre absente du mot

La première lettre du mot est révélée au début de la partie.

## Stack

| Couche   | Technologie                                       |
|----------|---------------------------------------------------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind 4 |
| Backend  | Laravel 13, PHP 8.3, Sanctum (mode SPA)           |
| BDD      | MySQL (MAMP)                                      |

L'authentification passe par des cookies de session HttpOnly + un token CSRF,
via **Laravel Sanctum en mode SPA** (voir `documents/DESIGN.md` pour le détail).

## Prérequis

- PHP 8.3+, Composer
- Node.js 20+, npm
- MySQL (MAMP fait l'affaire)
- Deux terminaux ouverts

## Installation

### 1. Base de données

Créer une base `motus` dans MySQL.

### 2. Backend

```bash
cd backend
cp .env.example .env
php artisan key:generate
# éditer .env : DB_DATABASE, DB_USERNAME, DB_PASSWORD, etc.
php artisan migrate --seed
```

Le seeder remplit la table `words` avec une liste de mots français répartis
par longueur (5 / 7 / 10 lettres) selon la difficulté.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # si le fichier n'existe pas
```

Le `.env.local` doit contenir l'URL du backend :

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Lancer le projet

Dans deux terminaux séparés :

```bash
# terminal 1 — backend
cd backend
php artisan serve
# → http://localhost:8000
```

```bash
# terminal 2 — frontend
cd frontend
npm run dev
# → http://localhost:3000
```

Ouvrir `http://localhost:3000` dans le navigateur, créer un compte, et jouer.

## Structure du projet

```
Motus/
├── backend/                 Laravel 13 (API uniquement)
│   ├── app/Http/Controllers
│   ├── app/Models
│   ├── app/Services
│   ├── database/migrations
│   ├── database/seeders
│   └── routes/api.php
│
├── frontend/                Next.js 16 (SPA)
│   ├── app/                 pages et composants
│   ├── lib/                 clients axios + types
│   └── ...
│
└── documents/
    ├── DESIGN.md            choix techniques détaillés
    └── DATABASE_MIGRATIONS.md
```

## API

Toutes les routes sont sous `/api`. Le seul endpoint hors `/api` est
`/sanctum/csrf-cookie`, appelé automatiquement par le frontend avant chaque
requête de modification.

| Méthode | Chemin                          | Auth | Description                       |
|---------|---------------------------------|------|-----------------------------------|
| POST    | `/api/register`                 | —    | Créer un compte                   |
| POST    | `/api/login`                    | —    | Se connecter                      |
| POST    | `/api/logout`                   | ✓    | Se déconnecter                    |
| GET     | `/api/user`                     | ✓    | Utilisateur courant               |
| GET     | `/api/games`                    | ✓    | Liste des parties de l'utilisateur |
| POST    | `/api/games`                    | ✓    | Démarrer une nouvelle partie      |
| GET     | `/api/games/{id}`               | ✓    | Détail d'une partie               |
| POST    | `/api/games/{id}/attempts`      | ✓    | Soumettre un essai                |
| GET     | `/api/leaderboard`              | ✓    | Classement                        |

## Tests

```bash
# backend
cd backend
php artisan test

# frontend
cd frontend
npm run lint
```

## Choix techniques

Voir `documents/DESIGN.md` pour le détail sur :

- le choix de Sanctum en mode SPA plutôt que des bearer tokens
- le modèle de données (cascades, contraintes d'unicité, index)
- l'algorithme de scoring en deux passes (gestion des doublons)
- la requête d'agrégation du classement
- la provenance des mots (seeder + API Taknok en secours)
