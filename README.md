# L’Atelier — Fidélio

Système de fidélité web **entièrement en français** pour un établissement multi-activités : **café · billard · restaurant**.

Clients : connexion par **nom + téléphone** (pas de mot de passe).  
Personnel : tableau de bord admin protégé par **PIN**.

---

## Ce que fait l’app

| Côté client | Côté admin |
| --- | --- |
| Inscription / connexion nom + téléphone | Stats (clients, visites, CA, top clients) |
| Solde de points, dépenses, historique | Recherche et fiche client |
| Récompenses échangeables | Ajout conso / visite / bonus points |
| Validation par **code** (ou QR côté admin) | Règles de fidélité + récompenses |
| | Historique global + génération de codes QR |

---

## Stack

- **Next.js** (App Router) + TypeScript + Tailwind CSS
- **Postgres** en production (`DATABASE_URL`)
- **PGlite** en local (aucune base à installer)
- Sessions JWT en cookies (`SESSION_SECRET`)

---

## Démarrage local (5 minutes)

```bash
git clone https://github.com/cyrano2200/latelier-fidelite.git
cd latelier-fidelite
npm install
npm run dev
```

- Dépôt : [github.com/cyrano2200/latelier-fidelite](https://github.com/cyrano2200/latelier-fidelite)
- App en ligne : [latelier-fidelite.vercel.app](https://latelier-fidelite.vercel.app)
- Admin : [latelier-fidelite.vercel.app/admin/connexion](https://latelier-fidelite.vercel.app/admin/connexion) (PIN initial `2468`)

Ouvrir [http://localhost:3000](http://localhost:3000).

En local, la base est créée automatiquement dans `.data/` (ignoré par git).

### Comptes de démonstration (local uniquement)

| Rôle | Identifiants |
| --- | --- |
| Client | Sara Benali / `0612345678` |
| Client | Youssef Amrani / `0698765432` |
| Client | Inès Kadiri / `0661122334` |
| Admin | PIN `2468` |
| Codes | `CAFE10`, `BILL20`, `VISITE` |

> Changez le PIN admin dès que possible : **Admin → Règles**.

---

## Déjà déployé (référence)

| Ressource | URL |
| --- | --- |
| GitHub | https://github.com/cyrano2200/latelier-fidelite |
| Production | https://latelier-fidelite.vercel.app |
| Admin | https://latelier-fidelite.vercel.app/admin/connexion |
| Vercel projet | équipe `fit-app6` · projet `latelier-fidelite` |
| Base | Neon Postgres (`DATABASE_URL` branché via Vercel Marketplace) |

Chaque push sur `main` redéploie automatiquement (repo GitHub connecté à Vercel).

---

## Créer un nouveau dépôt GitHub + héberger l’app (guide complet)

Suivez ces étapes si vous repartez de zéro (nouveau projet / nouveau compte).

### 1. Préparer le code

```bash
# depuis ce dossier
npm install
npm run build   # vérifie que tout compile
```

Variables utiles : copiez `.env.example` → `.env.local` (ne jamais committer `.env*`).

### 2. Créer le dépôt GitHub

**Option A — site GitHub**

1. Allez sur [https://github.com/new](https://github.com/new)
2. Nom suggéré : `latelier-fidelite` (ou `fidelio`)
3. Public ou Private
4. **Ne cochez pas** “Add a README” (le projet en a déjà un)
5. Créez le dépôt

**Option B — ligne de commande** (`gh` installé et connecté)

```bash
gh auth login
gh repo create latelier-fidelite --private --source=. --remote=origin --push
```

### 3. Pousser le code

Si le remote n’existe pas encore :

```bash
git init
git checkout -b main
git add .
git commit -m "Initial commit — Fidélio loyalty app"
git remote add origin https://github.com/VOTRE_USER/latelier-fidelite.git
git push -u origin main
```

### 4. Base de données Postgres (production)

L’app lit `DATABASE_URL`. Créez une base gratuite, par exemple :

- [Neon](https://neon.tech) → New Project → copier la connection string
- ou [Supabase](https://supabase.com) → Project Settings → Database → URI

Format typique :

```text
postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require
```

Les migrations SQL dans `migrations/` sont appliquées au `npm run build` (script `scripts/migrate.mjs`) quand `DATABASE_URL` est défini.

### 5. Héberger sur Vercel (recommandé pour Next.js)

1. Allez sur [https://vercel.com/new](https://vercel.com/new)
2. Importez le dépôt GitHub
3. Framework : **Next.js** (détecté automatiquement)
4. Ajoutez les variables d’environnement :

| Nom | Valeur |
| --- | --- |
| `DATABASE_URL` | URL Postgres (étape 4) |
| `SESSION_SECRET` | chaîne longue aléatoire (ex. `openssl rand -hex 32`) |

5. Deploy

Après le premier déploiement réussi :

- Accueil client : `https://VOTRE-APP.vercel.app/`
- Admin : `https://VOTRE-APP.vercel.app/admin/connexion`
- PIN initial : `2468` → **à changer** dans Règles

### 6. Alternative : Cursor Apps

Si vous publiez depuis un agent Cloud Cursor sur un dépôt lié :

- `cursor-app.json` demande déjà une base Postgres
- `npm run build` applique les migrations
- Utilisez le bouton **Publish** de l’agent

---

## Structure du projet

```text
fidelio/
├── migrations/          # Schéma SQL (Postgres / PGlite)
├── scripts/migrate.mjs  # Migrations en prod au build
├── src/
│   ├── app/             # Pages (accueil, client, admin, API)
│   ├── components/      # UI
│   └── lib/             # db, auth, règles de fidélité
├── cursor-app.json      # Déclare Postgres pour Cursor Apps
├── .env.example
└── package.json
```

### Pages

| URL | Rôle |
| --- | --- |
| `/` | Accueil + connexion client |
| `/client` | Espace client |
| `/admin/connexion` | Login admin (PIN) |
| `/admin` | Tableau de bord |
| `/admin/clients` | Gestion clients |
| `/admin/regles` | Points, bonus, récompenses |
| `/admin/historique` | Journal des transactions |
| `/admin/codes` | Codes + QR |

---

## Règles de fidélité (paramétrables)

Par défaut (modifiables dans Admin → Règles) :

- **1 € dépensé = 1 point**
- **+5 points** bonus par visite
- Récompenses exemples : café 100 pts, dessert 180, 1 h billard 300, menu 450

---

## Sécurité (checklist prod)

- [ ] Changer le PIN admin (`2468` n’est qu’une démo)
- [ ] Définir `SESSION_SECRET` fort
- [ ] Ne jamais committer `DATABASE_URL` / `.env*`
- [ ] Restreindre l’accès admin (PIN + éventuellement app privée Cursor / Vercel Password Protection)

---

## Scripts npm

| Commande | Effet |
| --- | --- |
| `npm run dev` | Dev local (ignore `DATABASE_URL` → PGlite) |
| `npm run build` | Build Next.js + migrations SQL si `DATABASE_URL` |
| `npm start` | Serveur production |

---

## Licence / usage

Projet fourni comme base métier pour un établissement. Adaptez le nom dans **Admin → Règles** (`L'Atelier` par défaut).
