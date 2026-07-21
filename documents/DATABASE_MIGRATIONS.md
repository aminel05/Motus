# Database Migrations

This document describes all database tables created by the migrations.

---

## 1. `users`

| Column               | Type                     | Constraints         |
|----------------------|--------------------------|---------------------|
| `id`                 | bigint (auto-increment)  | PK                  |
| `name`               | string                   |                     |
| `email`              | string                   | unique              |
| `email_verified_at`  | timestamp                | nullable            |
| `password`           | string                   |                     |
| `remember_token`     | string                   |                     |
| `created_at`         | timestamp                |                     |
| `updated_at`         | timestamp                |                     |

---

## 2. `password_reset_tokens`

| Column        | Type      | Constraints |
|---------------|-----------|-------------|
| `email`       | string    | PK          |
| `token`       | string    |             |
| `created_at`  | timestamp | nullable    |

---

## 3. `sessions`

| Column          | Type         | Constraints     |
|-----------------|--------------|-----------------|
| `id`            | string       | PK              |
| `user_id`       | bigint       | nullable, index |
| `ip_address`    | string(45)   | nullable        |
| `user_agent`    | text         | nullable        |
| `payload`       | longText     |                 |
| `last_activity` | integer      | index           |

---

## 4. `cache`

| Column       | Type       | Constraints |
|--------------|------------|-------------|
| `key`        | string     | PK          |
| `value`      | mediumText |             |
| `expiration` | bigint     | index       |

---

## 5. `cache_locks`

| Column       | Type   | Constraints |
|--------------|--------|-------------|
| `key`        | string | PK          |
| `owner`      | string |             |
| `expiration` | bigint | index       |

---

## 6. `jobs`

| Column         | Type                     | Constraints |
|----------------|--------------------------|-------------|
| `id`           | bigint (auto-increment)  | PK          |
| `queue`        | string                   | index       |
| `payload`      | longText                 |             |
| `attempts`     | unsigned small integer   |             |
| `reserved_at`  | unsigned integer         | nullable    |
| `available_at` | unsigned integer         |             |
| `created_at`   | unsigned integer         |             |

---

## 7. `job_batches`

| Column           | Type         | Constraints |
|------------------|--------------|-------------|
| `id`             | string       | PK          |
| `name`           | string       |             |
| `total_jobs`     | integer      |             |
| `pending_jobs`   | integer      |             |
| `failed_jobs`    | integer      |             |
| `failed_job_ids` | longText     |             |
| `options`        | mediumText   | nullable    |
| `cancelled_at`   | integer      | nullable    |
| `created_at`     | integer      |             |
| `finished_at`    | integer      | nullable    |

---

## 8. `failed_jobs`

| Column       | Type                     | Constraints       |
|--------------|--------------------------|--------------------|
| `id`         | bigint (auto-increment)  | PK                 |
| `uuid`       | string                   | unique             |
| `connection` | string                   |                    |
| `queue`      | string                   |                    |
| `payload`    | longText                 |                    |
| `exception`  | longText                 |                    |
| `failed_at`  | timestamp                | default: current   |

---

## 9. `words`

| Column       | Type                     | Constraints |
|--------------|--------------------------|-------------|
| `id`         | bigint (auto-increment)  | PK          |
| `word`       | string(20)               | unique      |
| `length`     | integer                  |             |
| `difficulty` | enum(`easy`,`medium`,`hard`) | composite index: `[difficulty, length]` |
| `created_at` | timestamp                |             |
| `updated_at` | timestamp                |             |

---

## 10. `games`

| Column         | Type                     | Constraints                          |
|----------------|--------------------------|--------------------------------------|
| `id`           | bigint (auto-increment)  | PK                                   |
| `user_id`      | bigint                   | FK -> `users.id` (cascade delete), composite index: `[user_id, status, score]` |
| `word_id`      | bigint                   | FK -> `words.id` (restrict delete)   |
| `attempts_count` | unsigned tiny integer  | default: `0`                         |
| `max_attempts`   | unsigned tiny integer  | default: `6`                         |
| `status`         | enum(`in_progress`,`won`,`lost`) | default: `in_progress`      |
| `completed_at`   | timestamp              | nullable                             |
| `score`          | unsigned integer       | default: `0`                         |
| `created_at`     | timestamp              |                                      |
| `updated_at`     | timestamp              |                                      |

---

## 11. `attempts`

| Column          | Type                     | Constraints                       |
|-----------------|--------------------------|-----------------------------------|
| `id`            | bigint (auto-increment)  | PK                                |
| `game_id`       | bigint                   | FK -> `games.id` (cascade delete) |
| `attempted_word`| string(20)               |                                   |
| `attempt_number`| integer                  | unique: `[game_id, attempt_number]` |
| `result`        | json                     |                                   |
| `is_correct`    | boolean                  | default: `false`                  |
| `created_at`    | timestamp                |                                   |
| `updated_at`    | timestamp                |                                   |

---

## 12. `personal_access_tokens`

| Column          | Type                     | Constraints     |
|-----------------|--------------------------|-----------------|
| `id`            | bigint (auto-increment)  | PK              |
| `tokenable_type`| string                   | polymorphic     |
| `tokenable_id`  | bigint                   | polymorphic     |
| `name`          | string                   |                 |
| `token`         | string(64)               | unique          |
| `abilities`     | text                     | nullable        |
| `last_used_at`  | timestamp                | nullable        |
| `expires_at`    | timestamp                | nullable, index |
| `created_at`    | timestamp                |                 |
| `updated_at`    | timestamp                |                 |

---

## Relationships

```
users  1 ──── * games  * ──── 1 words
games  1 ──── * attempts
```

- A **user** can have many **games**.
- A **game** belongs to one **user** and one **word**.
- A **game** can have many **attempts**.
- Deleting a **user** cascades to delete their **games**.
- Deleting a **word** is restricted if it has **games**.
- Deleting a **game** cascades to delete its **attempts**.
