# AI Feed — Veille IA PWA

> Votre veille sur l'intelligence artificielle en un seul endroit — modèles, recherche, startups, produits et régulation.

**Stack :** Next.js 15 · React 19 · TypeScript · Tailwind CSS · Supabase · Web Push · PWA  
**Coût d'hébergement :** 0 €/mois (Vercel Free + Supabase Free)

---

## Fonctionnalités

| Feature | Description |
|---|---|
| **Feed unifié** | Articles de 20+ sources RSS IA, triés par fraîcheur |
| **Catégories** | Modèles · Recherche · Startups · Produits · Régulation |
| **Favoris / À lire** | Bookmarks par type, persistants dans Supabase |
| **Suivi de lecture** | Articles lus marqués visuellement |
| **Explore** | Catalogue de sources, subscribe/unsubscribe par source |
| **Push notifications** | Alertes par mot-clé (GPT-5, Claude, Llama…) + résumé quotidien |
| **Widgets** | Widget Apple News-style intégrable (petit/moyen/grand) |
| **PWA installable** | Manifeste + service worker + offline shell |
| **Dark mode** | Automatique (préférence système) |
| **Auth sécurisée** | Supabase Auth avec RLS sur toutes les tables |

---

## Sources pré-configurées (20)

| Source | Catégorie |
|---|---|
| OpenAI Blog, Anthropic News, Google DeepMind, Google AI, Microsoft AI, Meta AI | Modèles |
| Hugging Face, MIT Tech Review AI, arXiv cs.AI, MarkTechPost, The Batch, Import AI, Papers With Code, Towards Data Science | Recherche |
| VentureBeat AI, TechCrunch AI | Startups |
| The Verge AI, Wired AI, AWS ML Blog | Produits |
| AI Alignment Forum | Régulation |

---

## Démarrage rapide (local)

### Prérequis
- Node.js 18+
- Un projet Supabase (gratuit)

### 1. Cloner et installer

```bash
git clone https://github.com/Endsi3g/AI-RSS-Feed-.git
cd AI-RSS-Feed-
npm install
```

### 2. Variables d'environnement

```bash
cp .env.example .env.local
```

Remplir `.env.local` :

```env
# Supabase — Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Web Push VAPID (générer ci-dessous)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BNxxxxx...
VAPID_PRIVATE_KEY=xxxxx...
VAPID_EMAIL=mailto:vous@email.com

# Cron secret (chaîne aléatoire)
CRON_SECRET=votre-secret-aleatoire-ici
```

### 3. Générer les clés VAPID

```bash
npx web-push generate-vapid-keys
```

Copier les clés dans `.env.local`.

### 4. Base de données Supabase

Dans le **SQL Editor** de votre projet Supabase, exécuter le contenu de :

```
lib/supabase/schema.sql
```

Ce script crée toutes les tables avec RLS, le trigger de création de profil et seed les 20 sources.

### 5. Lancer en développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

### 6. Premier chargement des feeds

Après vous être connecté, aller dans **Profil → Synchroniser les feeds** ou appeler :

```bash
curl -X POST http://localhost:3000/api/cron/fetch-feeds \
  -H "x-cron-secret: manual"
```

---

## Déploiement gratuit (Production)

### Vercel (hébergement + cron) — Free tier

Le plan gratuit Vercel inclut :
- 100 GB de bande passante/mois
- 100 000 invocations de fonctions/jour
- 2 cron jobs
- Edge Network mondial

#### Étapes

1. **Forker** ce repo sur GitHub

2. **Créer un compte** sur [vercel.com](https://vercel.com) et importer le repo

3. **Configurer les variables d'environnement** dans Vercel Dashboard :
   - `Settings → Environment Variables`
   - Ajouter toutes les variables de `.env.example`

4. **Déployer** — Vercel détecte automatiquement Next.js

5. **Cron automatique** — `vercel.json` configure la synchronisation RSS toutes les 2h.  
   Vercel envoie automatiquement le header `Authorization: Bearer <CRON_SECRET>`.

#### Variables Vercel obligatoires

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
VAPID_EMAIL
CRON_SECRET
```

### Supabase — Free tier

Le plan gratuit inclut :
- 500 MB de base de données
- 1 GB de stockage
- 50 000 utilisateurs actifs/mois
- 2 GB de bande passante

#### Configuration Auth

Dans Supabase Dashboard :
1. `Authentication → URL Configuration`
2. **Site URL** : `https://votre-app.vercel.app`
3. **Redirect URLs** : `https://votre-app.vercel.app/api/auth/callback`

### Coût total

| Service | Plan | Coût |
|---|---|---|
| Vercel | Hobby (Free) | 0 €/mois |
| Supabase | Free | 0 €/mois |
| Domaine (optionnel) | — | ~12 €/an |
| **Total** | | **0 €/mois** |

---

## Widgets

### Widget web (PWA)

Trois tailles disponibles, accessibles via l'URL :

| Taille | URL | Usage |
|---|---|---|
| Petit | `/widget?size=small` | 1 article, très compact |
| Moyen | `/widget?size=medium` | 3 articles (défaut) |
| Grand | `/widget?size=large` | 6 articles détaillés |

**Sur iOS :** Ouvrir l'URL dans Safari → Partager → Sur l'écran d'accueil  
**Sur Android :** Chrome → Menu → Ajouter à l'écran d'accueil

### Widget Windows 11 / Adaptive Card

Le manifeste déclare un widget compatible avec le **Widget Board de Windows 11**.  
L'API data est disponible sur `/api/widget/latest?limit=5`.

### Widget temps réel

Le service worker met à jour le widget via `Periodic Background Sync` si le navigateur le supporte (Chrome Android).

---

## Architecture

```
AI-RSS-Feed-/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          # Page de connexion
│   │   └── signup/page.tsx         # Page d'inscription
│   ├── (app)/
│   │   ├── layout.tsx              # Layout avec tab bar
│   │   ├── feed/page.tsx           # Feed principal
│   │   ├── explore/page.tsx        # Catalogue des sources
│   │   ├── saved/page.tsx          # Favoris et à lire
│   │   ├── alerts/page.tsx         # Règles de notification
│   │   └── settings/page.tsx       # Profil et paramètres
│   ├── (widget)/
│   │   └── widget/page.tsx         # Widget Apple News-style
│   ├── api/
│   │   ├── articles/route.ts       # GET articles (paginé, filtré)
│   │   ├── sources/
│   │   │   ├── route.ts            # GET/POST sources
│   │   │   └── subscribe/route.ts  # POST/DELETE abonnements
│   │   ├── bookmarks/
│   │   │   ├── route.ts            # GET/POST favoris
│   │   │   └── [id]/route.ts       # DELETE favori
│   │   ├── read/route.ts           # POST statut de lecture
│   │   ├── push/subscribe/route.ts # POST/DELETE push sub
│   │   ├── notifications/
│   │   │   └── rules/              # CRUD règles notification
│   │   ├── widget/latest/route.ts  # GET données widget (public)
│   │   ├── cron/fetch-feeds/       # POST ingestion RSS (cron)
│   │   └── auth/callback/route.ts  # Callback Supabase OAuth
│   ├── globals.css                 # Design tokens iOS
│   ├── layout.tsx                  # Root layout + SW registration
│   └── page.tsx                    # Redirect vers /feed
├── components/
│   ├── feed/
│   │   ├── ArticleCard.tsx         # Carte article avec bookmark
│   │   ├── FilterChips.tsx         # Filtres par catégorie
│   │   └── SkeletonCard.tsx        # Loading skeleton
│   ├── layout/
│   │   ├── BottomTabBar.tsx        # Navigation iOS
│   │   └── Header.tsx              # Header large titre
│   ├── ui/
│   │   ├── Button.tsx              # Bouton avec variantes
│   │   ├── Badge.tsx               # Badge catégorie coloré
│   │   └── EmptyState.tsx          # État vide illustré
│   └── widget/
│       └── LatestNewsWidget.tsx    # Widget Apple News-style
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Client browser
│   │   ├── server.ts               # Client server + service role
│   │   └── schema.sql              # Schéma complet + seed
│   ├── rss/parser.ts               # Parseur RSS avec extraction image
│   ├── push/vapid.ts               # Wrapper web-push
│   └── utils.ts                    # cn, timeAgo, truncate…
├── public/
│   ├── manifest.json               # PWA manifest + widget def
│   ├── sw.js                       # Service worker
│   ├── widget-latest.ac.json       # Adaptive Card Windows
│   └── icons/icon.svg
├── types/index.ts                  # Types TypeScript partagés
├── middleware.ts                   # Garde auth + redirects
├── vercel.json                     # Config Vercel + cron
└── .env.example                    # Template variables d'env
```

---

## Modèle de données

```sql
profiles          -- Profils utilisateurs (étend auth.users)
sources           -- Sources RSS (20 pré-configurées)
articles          -- Articles ingérés depuis les feeds
user_sources      -- Abonnements utilisateur ↔ source
bookmarks         -- Favoris et articles à lire
read_status       -- Historique de lecture
push_subscriptions -- Subscriptions Web Push
notification_rules -- Règles d'alerte (mot-clé, source, digest)
```

Toutes les tables ont **Row Level Security (RLS)** activé.

---

## Roadmap — Prochaines étapes

### Semaine 2 (polish MVP)
- [ ] Infinite scroll / pagination sur le feed
- [ ] Recherche full-text dans les articles
- [ ] Résumé quotidien automatique (cron 8h)
- [ ] Page article détaillée (reader mode)
- [ ] Tests sur iPhone Safari + Android Chrome
- [ ] Génération d'icônes PNG 192/512 pour le manifest

### Semaine 3 (engagement)
- [ ] Onboarding : sélection de catégories au premier login
- [ ] Score de pertinence (fraîcheur + source suivie)
- [ ] Résumé AI des articles (Claude API)
- [ ] Partage d'articles (Web Share API)
- [ ] Historique de lecture avec stats

### Semaine 4 (natif-ready)
- [ ] React Native / Expo migration du cœur UI
- [ ] App Store / Play Store wrapper (Capacitor ou EAS Build)
- [ ] Widget natif iOS (WidgetKit via Capacitor plugin)
- [ ] Widget natif Android (Glance)
- [ ] Analytics d'usage (Plausible ou Posthog)

### Futur
- [ ] Multi-langue (i18n)
- [ ] Collections collaboratives
- [ ] API publique pour les widgets tiers
- [ ] Intégration calendrier (conférences IA)

---

## Développement

```bash
# Lancer en dev
npm run dev

# Build de production
npm run build

# Vérification TypeScript
npx tsc --noEmit

# Lint
npm run lint

# Synchroniser les feeds manuellement
curl -X POST http://localhost:3000/api/cron/fetch-feeds \
  -H "x-cron-secret: manual"
```

---

## Licence

MIT — voir [LICENSE](./LICENSE)
