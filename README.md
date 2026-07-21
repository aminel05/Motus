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
| API docs | darkaonline/l5-swagger, OpenAPI 3.0              |
| BDD      | MySQL 8 (Docker) ou MySQL/MAMP (manuel)           |

L'authentification passe par des cookies de session HttpOnly + un token CSRF,
via **Laravel Sanctum en mode SPA** (voir `documents/DESIGN.md` pour le détail).

## Ports (en local)

| Service        | URL                       |
|----------------|---------------------------|
| Backend (API)  | `http://localhost:3000`   |
| Frontend (SPA) | `http://localhost:3001`   |
| Swagger UI     | `http://localhost:3000/swagger` |

## Prérequis

Deux workflows sont supportés, choisir celui qui convient :

- **Docker** (recommandé) : Docker Desktop + Docker Compose v2. Aucun autre
  outil à installer.
- **Manuel** : PHP 8.3+, Composer, Node.js 20+, npm, MySQL (MAMP fait l'affaire).

## Quick start (Docker)

```bash
# Depuis la racine du repo
docker compose up --build
```

Au premier lancement :
1. Construction des images backend (PHP 8.3) et frontend (Node 20).
2. Démarrage de MySQL 8.0 (port hôte 3307, conteneur 3306).
3. Bootstrap du backend : `composer install`, `key:generate`,
   `migrate --seed`, lancement de `artisan serve` sur :3000.
4. Bootstrap du frontend : `npm ci`, lancement de `next dev` sur :3001.

Une fois prêt (quelques dizaines de secondes la première fois, quelques
secondes ensuite grâce aux volumes nommés) :

| Service        | URL                              |
|----------------|----------------------------------|
| Frontend (SPA) | http://localhost:3001            |
| Backend (API)  | http://localhost:3000            |
| Swagger UI     | http://localhost:3000/swagger    |
| MySQL          | `localhost:3307` (user `motus` / pwd `motus` / db `motus`) |

Commandes utiles :

```bash
docker compose up                   # démarrer (sans rebuild)
docker compose down                 # arrêter
docker compose down -v              # tout supprimer (DB incluse)
docker compose logs -f backend      # suivre les logs du backend
docker compose exec backend bash    # shell dans le conteneur backend
docker compose exec backend php artisan test
docker compose exec backend php artisan l5-swagger:generate
docker compose exec frontend sh     # shell dans le conteneur frontend
```

La base de données et les dépendances (`vendor/`, `node_modules/`) sont
stockées dans des **volumes nommés** et survivent à `docker compose down`.
Les sources sont bind-montées : les modifications PHP/TS sont
répercutées immédiatement (hot reload pour le frontend, auto-restart
pour le backend via `artisan serve`).

Le port MySQL hôte est `3307` (et non `3306`) pour ne pas entrer en conflit
avec un éventuel MySQL MAMP/MySQL Workbench déjà installé.

## Installation (manuel)

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

Le seeder remplit la table `words` avec ~200 mots français répartis
par longueur (5 / 7 / 10 lettres) selon la difficulté. C'est un **filet de
sécurité** : la source principale des mots est l'API
[trouve-mot.fr](https://trouve-mot.fr), appelée par `WordProvider::pick()`
avec un cache d'une heure. En cas d'API indisponible hors-ligne, le seeder
fournit les mots de secours.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # si le fichier n'existe pas
```

Le `.env.local` doit contenir l'URL du backend :

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

## Lancer le projet

Dans deux terminaux séparés :

```bash
# terminal 1 — backend (inclut Swagger sur /swagger)
cd backend
php artisan serve
# → http://localhost:3000
# → http://localhost:3000/swagger  (documentation OpenAPI interactive)
```

```bash
# terminal 2 — frontend
cd frontend
npm run dev
# → http://localhost:3001
```

Ouvrir `http://localhost:3001` dans le navigateur, créer un compte, et jouer.

## Structure du projet

```
Motus/
├── backend/                 Laravel 13 (API uniquement)
│   ├── app/
│   │   ├── Http/Controllers
│   │   ├── Models
│   │   ├── OpenApi/         Classe regroupant les schémas OpenAPI partagés
│   │   ├── Providers/       ServiceProviders Laravel
│   │   └── Services
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
requête de modification. Swagger UI est disponible sur `/swagger` (sans préfixe
`/api`).

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

La spec OpenAPI est générée depuis les attributs `#[OA\...]` (PHP 8)
placés sur les contrôleurs (`app/Http/Controllers/*.php`) et sur la
classe `app/OpenApi/OpenApiSpec.php` qui regroupe les schémas
réutilisables. Pour la régénérer :

```bash
cd backend
php artisan l5-swagger:generate
```

Le JSON est écrit dans `storage/api-docs/api-docs.json`. Avec
`L5_SWAGGER_GENERATE_ALWAYS=true` dans `.env` (présent par défaut dans
`.env.example`), la spec est aussi régénérée à chaque requête vers `/swagger`,
ce qui évite d'avoir à relancer la commande après un changement.

## Tests

```bash
# backend (Pest)
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
- la doc OpenAPI (attributs PHP 8 natifs via darkaonline/l5-swagger)
- la source des mots : l'API REST publique [trouve-mot.fr](https://trouve-mot.fr)
  (`/api/size/{length}/50`, ~3 575 mots français). Ordre de résolution dans
  `WordProvider::pick()` : (1) API trouve-mot avec cache 1 h, (2) fallback sur
  la table `words` (mots déjà récupérés), (3) fallback final sur n'importe
  quel mot en base, (4) exception si la base est vide. Le seeder local
  (~200 mots répartis par longueur) reste utile comme filet de sécurité
  hors-ligne : il s'exécute automatiquement via `migrate --seed`.
