# Annuel

## Authentification GitHub OAuth

La connexion "Continuer avec GitHub" repose sur une OAuth App GitHub. Le backend échange lui-même le `code` renvoyé par GitHub contre un `access_token` (le `client_secret` ne doit jamais être exposé côté frontend).

### En développement

1. Créer une OAuth App GitHub :
   - Aller sur [github.com/settings/developers](https://github.com/settings/developers) → **OAuth Apps** → **New OAuth App**.
   - Renseigner :
     - **Application name** : `Annuel (dev)` (ou ce que tu veux)
     - **Homepage URL** : `http://localhost:3000`
     - **Authorization callback URL** : `http://localhost:3000/auth/github/callback`
   - Valider, puis générer un **Client secret**. Récupérer le **Client ID** et le **Client secret**.

2. Configurer le backend, dans `backend/.env` (voir `backend/.env.dev.example`) :

   ```env
   GITHUB_CLIENT_ID=le_client_id_github
   GITHUB_CLIENT_SECRET=le_client_secret_github

   # Origine autorisée à appeler l'API (CORS) — l'URL du frontend
   CORS_ORIGIN=http://localhost:3000
   ```

3. Configurer le frontend, dans `frontend/.env` (voir `frontend/.env.example`) :

   ```env
   NUXT_PUBLIC_API_BASE=http://localhost:3003/api
   NUXT_PUBLIC_API_KEY=test
   NUXT_PUBLIC_GITHUB_CLIENT_ID=le_client_id_github
   ```

   Le `client_id` est public (il apparaît dans l'URL d'autorisation GitHub), seul le `client_secret` doit rester côté backend.

4. Tester le flow :
   - Lancer le backend (`npm run dev` dans `backend/`) et le frontend (`npm run dev` dans `frontend/`).
   - Aller sur `http://localhost:3000/login` et cliquer sur **Continuer avec GitHub**.
   - Après autorisation sur GitHub, tu es redirigé vers `/auth/github/callback` qui échange le code auprès du backend (`POST /api/auth/oauth/github`) et te connecte (ou crée le compte si c'est la première connexion avec cet e-mail GitHub).
   - Si la double authentification (TOTP) est activée sur le compte, un code est demandé avant de finaliser la connexion.

### En production

1. Créer une **seconde** OAuth App GitHub dédiée à la prod (ou changer les URLs de celle du dev) avec le vrai domaine :
   - Homepage URL : `https://ton-domaine.fr`
   - Authorization callback URL : `https://ton-domaine.fr/auth/github/callback`

2. Renseigner `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `CORS_ORIGIN`, `NUXT_PUBLIC_GITHUB_CLIENT_ID` dans `.env.prod.local` avec ces valeurs (voir [Déploiement en production](#déploiement-en-production)).

## Analytics Umami auto-hébergé

Le projet intègre Umami auto-hébergé via Docker Compose. Le script analytics est injecté dans le frontend seulement si les variables publiques Umami sont renseignées.

### En développement

1. Dans `.env` (copie de `.env.dev.example`), configurer :

   ```env
   UMAMI_PORT=3005
   UMAMI_DB_NAME=umami
   UMAMI_DB_USER=umami
   UMAMI_DB_PASSWORD=umami_password_change_me
   UMAMI_APP_SECRET=change_me_with_a_long_random_secret
   UMAMI_HASH_SALT=change_me_with_a_second_long_random_secret
   ```

2. Lancer la stack habituelle :

   ```bash
   bash start.dev.sh
   ```

   Umami sera disponible sur `http://localhost:3005`.

3. Initialiser Umami :
   - Ouvrir `http://localhost:3005`.
   - Se connecter avec les identifiants par défaut Umami (à changer ensuite dans l'interface).
   - Créer un site et récupérer son Website ID.

4. Brancher le frontend sur Umami, dans `frontend/.env` (voir `frontend/.env.example`) :

   ```env
   NUXT_PUBLIC_UMAMI_WEBSITE_ID=your_website_id
   NUXT_PUBLIC_UMAMI_SCRIPT_URL=http://localhost:3005/script.js
   ```

   Puis relancer le frontend pour appliquer les variables d'environnement. Si `NUXT_PUBLIC_UMAMI_WEBSITE_ID` ou `NUXT_PUBLIC_UMAMI_SCRIPT_URL` est vide, aucun script analytics n'est chargé.

### En production

Pas de setup séparé : renseigner les mêmes variables `UMAMI_*` dans `.env.prod.local` (voir [Déploiement en production](#déploiement-en-production)). Umami démarre avec le reste de la stack via `./deploy.sh`, et n'est accessible que localement sur le serveur sauf si tu lui ajoutes un sous-domaine/bloc Caddy dédié.

## Lancer les tests

Ces commandes servent en local et en CI, pas en prod (la CI les rejoue déjà avant chaque merge).

### Backend (Jest)

```bash
cd backend
npm test              # tests unitaires + intégration
npm run test:watch    # mode watch
npm run test:coverage # avec couverture
```

### Frontend (Vitest)

```bash
cd frontend
npm test        # tests unitaires (stores, composables)
npm run test:watch
```

### Frontend (Playwright e2e)

Nécessite le backend et le frontend lancés (`npm run dev` dans chaque dossier), Playwright démarre sinon automatiquement le serveur frontend si besoin.

```bash
cd frontend
npx playwright install   # une seule fois, installe les navigateurs
npm run test:e2e
```

## Déploiement en production

Cette section ne concerne que la prod — pour tourner le projet en local, voir les sections précédentes (`npm run dev` dans `backend/` et `frontend/`, ou `bash start.dev.sh` pour l'infra Docker).

La stack de prod (backend, frontend, Postgres, Umami) tourne via `prod.docker-compose.yml`, buildée à partir des Dockerfiles multi-stage de chaque app (`backend/scripts/dockerfile/prod.dockerfile`, `frontend/scripts/dockerfile/prod.dockerfile`). Aucun secret n'est copié dans les images : ils sont injectés au démarrage des conteneurs via un fichier d'env non commité.

### 1. Prérequis (une seule fois)

Sur le serveur :

```bash
# Docker + Docker Compose installés
git clone <url_du_repo> annuel
cd annuel
```

### 2. Préparer les secrets

Toujours à la racine du repo :

```bash
cp .env.prod.example .env.prod.local
```

Puis remplir `.env.prod.local` (clés JWT, pepper, API key, GitHub OAuth, SMTP, mots de passe Postgres/Umami...). Ce fichier ne doit jamais être commité (il est dans `.gitignore`).

### 3. Déployer

```bash
./deploy.sh
```

Le script pull le dernier code, build les images, démarre les conteneurs et lance les migrations (`node-pg-migrate`) dans le conteneur backend. Pour les déploiements suivants (nouvelle version du code), il suffit de relancer `./deploy.sh` depuis le repo déjà cloné.

### 4. Notes de sécurité

- Penser à créer une OAuth App GitHub dédiée à la prod avec le vrai domaine, et à renseigner `CORS_ORIGIN` avec ce même domaine.
