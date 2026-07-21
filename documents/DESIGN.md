# Motus — Choix techniques

Document court qui résume les décisions structurantes du projet. Il complète
le `README.md` (installation et utilisation) et le `DATABASE_MIGRATIONS.md`
(détail des tables).

## 1. Authentification : Sanctum en mode SPA

Le frontend tourne sur `localhost:3000` et l'API sur `localhost:8000`. Ce sont
deux origines différentes pour le navigateur, donc :

- Un **bearer token** stocké côté front serait exposé au XSS.
- Une **session cookie** envoyée par le navigateur sur chaque requête reste
  inaccessible à JavaScript si on la marque `HttpOnly`.

J'ai retenu **Laravel Sanctum en mode SPA** (aussi appelé *first-party SPA
authentication*) : cookie de session `HttpOnly` + token CSRF dans un second
cookie lisible par JS (`XSRF-TOKEN`). Axios lit ce cookie et l'envoie dans
l'en-tête `X-XSRF-TOKEN` à chaque requête de modification. Laravel valide
le token avant d'exécuter la requête.

Configuration côté backend (`bootstrap/app.php`) : `$middleware->statefulApi()`.
Côté frontend (`lib/api.ts`) : `withCredentials: true, withXSRFToken: true`.

## 2. Modèle de données

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

## 3. Algorithme de scoring

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
attribuerait à tort un `correct` au deuxième `A` (il n'y a que deux `A` dans
le mot, et le premier est déjà à la bonne place).

## 4. Classement

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

J'ai gardé la requête en `DB::table(...)` plutôt qu'en scope Eloquent parce
qu'elle agrège sur l'ensemble de la table, pas par enregistrement : c'est
plus lisible en query builder, et il n'y a pas de N+1 à craindre.

## 5. Provenance des mots

Le seeder `WordSeeder` remplit la table `words` avec une liste statique
d'environ 250 mots français répartis par longueur (5, 7, 10 lettres).

Au moment de démarrer une partie, `WordProvider::pick($difficulty)` :

1. Cherche un mot de la bonne longueur déjà en base (`Word::where('length', …)`)
   — c'est le cas normal.
2. Sinon, télécharge la liste de mots français de Taknok sur GitHub
   (`Http::get(...)`), la met en cache une heure, et pioche un mot
   correspondant à la longueur demandée. Le mot est enregistré en base
   pour les parties suivantes.
3. Sinon, retombe sur n'importe quel mot déjà en base (`Word::inRandomOrder()`).
4. Sinon, lance une `RuntimeException` qui demande d'exécuter le seeder.

C'est un fallback utile si quelqu'un vide la base, mais le chemin normal
passe par le seeder, donc l'API externe n'est appelée qu'en dernier recours.

## 6. Indice révélée au joueur

Au démarrage d'une partie, le backend ne renvoie pas le mot : seulement
les métadonnées (difficulté, longueur, première lettre). Le mot complet
n'est inclus dans la réponse qu'une fois la partie terminée (`won` ou `lost`).
C'est le rôle de `Game::toApiArray()` qui teste `$this->isFinished()`.

## 7. Documentation OpenAPI (Swagger)

L'API est documentée via `darkaonline/l5-swagger` v11. L'UI Swagger est
servie par le backend sur `http://localhost:3000/swagger` (donc à la même
origine que l'API — pas de problème de CORS pour le navigateur de la personne
qui corrige).

**Annotations.** Les endpoints sont décrits en PHP avec des docblocks
`@OA\Get`, `@OA\Post`, etc. directement au-dessus de chaque méthode de
contrôleur. Les schémas partagés (`User`, `Game`, `Attempt`,
`PaginatedGames`, `LeaderboardEntry`, `Leaderboard`, `AttemptSubmission`)
sont définis une seule fois dans `app/OpenApi/OpenApiSpec.php` et référencés
depuis les contrôleurs via `@OA\JsonContent(ref="#/components/schemas/…")`.

**Analyseur custom.** l5-swagger v11 utilise par défaut un analyseur qui ne
sait lire que les attributs PHP 8 (`#[\OpenApi\Attributes\...]`), pas les
docblocks `@OA\...`. Comme tout le projet utilise la syntaxe docblock, j'ai
ajouté un `App\OpenApi\DocBlockAnalyser` qui combine
`DocBlockAnnotationFactory` (lit les docblocks) et
`AttributeAnnotationFactory` (lit les attributs). Il est injecté via
`App\Providers\SwaggerServiceProvider::boot()` qui remplace la valeur de
`scanOptions.analyser` dans la config l5-swagger *après* que le service
provider par défaut l'ait posée. Sans cette étape, la commande
`php artisan l5-swagger:generate` produit un JSON vide.

**Dépendance.** L'analyseur docblock a besoin de `doctrine/annotations` au
runtime (le scanner l'utilise via `Doctrine\Common\Annotations\DocParser`).
Cette dépendance est marquée *abandoned* par Composer mais elle reste
nécessaire tant qu'on n'a pas converti toutes les annotations en attributs
PHP 8 — un travail de migration que je n'ai pas fait pour ne pas gonfler le
diff.

**Régénération.** `L5_SWAGGER_GENERATE_ALWAYS=true` (dans `.env.example`)
fait que la spec est régénérée à chaque requête vers `/swagger`, donc pas
besoin de relancer la commande manuellement en dev.

## 8. Ports

| Service | Port | Pourquoi |
|---------|------|----------|
| Backend (API + Swagger) | 3000 | Le sujet demande « Swagger sur `http://localhost:3000/swagger` » — le plus simple est que l'API tienne ce port et serve aussi l'UI Swagger à la même origine |
| Frontend (SPA)          | 3001 | Évite le conflit avec le backend |

L'ancien port 8000 du backend n'est plus utilisé.
