# L’Atelier — Fidélio

Système de fidélité web (français) pour un établissement multi-activités : café, billard, restaurant.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- PostgreSQL en production (`DATABASE_URL`) via Cursor Apps
- PGlite en local (aucune config DB requise)
- Sessions JWT (cookies) : client (nom + téléphone) et admin (PIN)

## Démarrage local

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

### Comptes de démonstration

**Clients** (déjà en base locale) :

| Nom | Téléphone |
| --- | --- |
| Sara Benali | 0612345678 |
| Youssef Amrani | 0698765432 |
| Inès Kadiri | 0661122334 |

**Admin** : PIN `2468`

**Codes visite** : `CAFE10`, `BILL20`, `VISITE`

## Fonctionnalités

- Connexion / inscription client par nom + téléphone
- Solde de points, historique, CA personnel, récompenses
- Validation de visite / conso par code (QR généré côté admin)
- Dashboard admin, gestion clients, règles, historique, codes

## Publication Cursor

Le fichier `cursor-app.json` déclare une base Postgres. Le script `build` applique les migrations SQL.

Pour publier via `publish-app`, l’application doit vivre dans un dépôt GitHub/Origin rattaché à l’agent Cloud.
