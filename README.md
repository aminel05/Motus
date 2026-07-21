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

### Authentification : Sanctum en mode SPA

Le frontend tourne sur `localhost:3001` et l'API sur `localhost:3000`. Ce
sont deux origines différentes pour le navigateur, donc :

- Un **bearer token** stocké côté front serait exposé au XSS.
- Une **session cookie** envoyée par le navigateur sur chaque requête reste
  inaccessible à JavaScript si on la marque `HttpOnly`.

J'ai retenu **Laravel Sanctum en mode SPA** (aussi appelé *first-party
SPA authentication*) : cookie de session `HttpOnly` + token CSRF dans un
second cookie lisible par JS (`XSRF-TOKEN`). Axios lit ce cookie et
l'envoie dans l'en-tête `X-XSRF-TOKEN` à chaque requête de modification.
Laravel valide le token avant d'exécuter la requête.

Côté backend (`bootstrap/app.php`) : `$middleware->statefulApi()`. Côté
frontend (`lib/api.ts`) : `withCredentials: true, withXSRFToken: true`.

### Modèle de données

```
users ──< games >── words
            │
            └──< attempts
```

Quelques contraintes explicites dans les migrations :

- `games.user_id` **cascade on delete** : supprimer un utilisateur efface
  ses parties. Logique : les parties n'ont pas de sens sans leur propriétaire.
- `games.word_id` **restrict on delete** : on n'efface jamais un mot pendant
  qu'une partie le référence. Un mot reste valide même après la fin d'une
  partie, ce qui permet d'auditer le mot qui était proposé.
- `attempts.(game_id, attempt_number)` **unique** : garantit qu'on ne peut
  pas créer deux essais avec le même numéro pour la même partie (race
  condition en cas de double-clic).
- `games.(user_id, status, score)` **indexé** : la page d'historique trie
  par utilisateur + statut + score.
- `attempts.result` stocké en **JSON** plutôt qu'en table normalisée : une
  ligne d'essai = un tableau de statuts par position. Le volume reste petit
  (≤ 10 statuts par essai), donc pas la peine de normaliser.

### Algorithme de scoring

L'algo est dans `app/Services/GameScorer.php`. Il tourne en **deux passes**
pour gérer correctement les lettres en doublon :

1. **Première passe** : on compare position par position. Si la lettre
   devinée correspond à la lettre cible à la même position → `correct`.
   Sinon, on ajoute la lettre cible à un compteur des lettres restantes
   (« pool »).
2. **Deuxième passe** : pour les positions qui ne sont pas `correct`, on
   pioche dans le pool. Si la lettre devinée est dans le pool → `present`,
   et on décrémente le pool. Sinon → `absent`.

Sans la deuxième passe, une devinette comme `AABBA` contre le mot `ABBAZ`
attribuerait à tort un `correct` au deuxième `A` (il n'y a que deux `A`
dans le mot, et le premier est déjà à la bonne place).

### Classement

Une seule requête SQL dans `LeaderboardController::index` :

```sql
SELECT user_id,
       SUM(score)              AS total_score,
       COUNT(*)                AS games_played,
       SUM(status = 'won')     AS games_won,
       MAX(score)              AS best_score
FROM   games
GROUP BY user_id
ORDER BY total_score DESC, best_score DESC
```

Le contrôleur ajoute le rang (`1, 2, 3, …`) en PHP après la requête, joint
les `User` correspondants en un seul `whereIn`, et découpe le tableau en
« top 10 » + entrée de l'utilisateur courant s'il n'est pas dans le top.
La requête est en `DB::table(...)` plutôt qu'en scope Eloquent parce
qu'elle agrège sur l'ensemble de la table : c'est plus lisible en query
builder, et il n'y a pas de N+1 à craindre.

### Provenance des mots

La source principale est l'API REST publique
[trouve-mot.fr](https://trouve-mot.fr), qui expose un endpoint
`GET /api/size/{length}/{count}` renvoyant un JSON de mots français de
la longueur demandée (3 575 mots, 27 catégories thématiques : animaux,
aliments, école, etc.).

`WordProvider::pick($difficulty)` résout un mot en 4 étapes :

1. **API trouve-mot** — un appel `Http::get("/api/size/{$length}/50")`,
   caché pendant 1 heure via `Cache::remember()`. C'est le chemin normal.
2. **Table `words` (mots déjà récupérés)** — si l'API est en carafe, on
   pioche parmi les mots qu'on a déjà récupérés (incluant les mots de
   l'API sauvegardés à l'étape 1).
3. **N'importe quel mot en base** — dernier filet.
4. **`RuntimeException`** — base vide, on demande à l'utilisateur de
   lancer le seeder.

Le `WordSeeder` (≈ 200 mots, exécuté automatiquement par
`migrate --seed`) sert de **filet de sécurité hors-ligne** : si l'API
est injoignable au démarrage, le jeu reste jouable. Les mots puisés via
l'API sont aussi persistés en base via `Word::firstOrCreate(...)`, ce
qui élargit progressivement le pool de secours.

> **Note SSL (dev only)** : l'appel à l'API est fait avec
> `withOptions(['verify' => false])` parce que la version de PHP livrée
> avec MAMP (8.3.1) n'a pas de `cacert.pem` configuré (`curl.cainfo` /
> `openssl.cafile` vides), ce qui déclenche *« cURL error 60: SSL
> certificate problem »*. C'est acceptable ici car l'endpoint ne sert
> qu'une liste de mots publique, sans auth ni donnée utilisateur. En
> production (ou pour toute API authentifiée), il faut pointer
> `curl.cainfo` et `openssl.cafile` du `php.ini` vers un vrai
> `cacert.pem` (par exemple celui déjà présent dans
> `C:\MAMP\bin\php\php8.3.1\cacert.pem`) et retirer le `verify => false`.

### Documentation OpenAPI

L'API est documentée via `darkaonline/l5-swagger` v11. L'UI Swagger est
servie par le backend sur `http://localhost:3000/swagger` (donc à la
même origine que l'API — pas de problème de CORS pour le navigateur de
la personne qui corrige).

Les endpoints sont décrits avec des **attributs PHP 8** (`#[OA\Get]`,
`#[OA\Post]`, …) directement au-dessus de chaque méthode de
contrôleur. Les schémas partagés (`User`, `Game`, `Attempt`,
`PaginatedGames`, `LeaderboardEntry`, `Leaderboard`, `AttemptSubmission`)
sont définis une seule fois dans `app/OpenApi/OpenApiSpec.php` et
référencés depuis les contrôleurs via
`new OA\JsonContent(ref: '#/components/schemas/…')`. L5-swagger v11
sait lire les attributs nativement — **aucune configuration
supplémentaire n'est nécessaire** (pas d'analyseur custom, pas de
dépendance `doctrine/annotations`).

Régénération : `L5_SWAGGER_GENERATE_ALWAYS=true` (dans `.env.example`)
fait que la spec est régénérée à chaque requête vers `/swagger`, donc
pas besoin de relancer la commande manuellement en dev.

### Ports

| Service                  | Port         | Pourquoi |
|--------------------------|--------------|----------|
| Backend (API + Swagger)  | 3000         | Le sujet demande « Swagger sur `http://localhost:3000/swagger` » — l'API tient ce port et sert aussi l'UI Swagger à la même origine |
| Frontend (SPA)           | 3001         | Évite le conflit avec le backend |
| MySQL (conteneur → hôte) | 3306 → 3307  | 3307 côté hôte pour ne pas entrer en conflit avec un éventuel MySQL déjà installé (MAMP, etc.) |
