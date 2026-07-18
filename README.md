# Annuel

## Authentification GitHub OAuth

La connexion "Continuer avec GitHub" repose sur une OAuth App GitHub. Le backend échange lui-même le `code` renvoyé par GitHub contre un `access_token` (le `client_secret` ne doit jamais être exposé côté frontend).

### 1. Créer une OAuth App GitHub

1. Aller sur [github.com/settings/developers](https://github.com/settings/developers) → **OAuth Apps** → **New OAuth App**.
2. Renseigner :
   - **Application name** : `Annuel (dev)` (ou ce que tu veux)
   - **Homepage URL** : `http://localhost:3000`
   - **Authorization callback URL** : `http://localhost:3000/auth/github/callback`
3. Valider, puis générer un **Client secret**.
4. Récupérer le **Client ID** et le **Client secret**.

En production, créer une seconde OAuth App (ou modifier l'URL) avec le domaine réel, par exemple :
- Homepage URL : `https://ton-domaine.fr`
- Authorization callback URL : `https://ton-domaine.fr/auth/github/callback`

### 2. Configurer le backend

Dans `backend/.env` (voir `backend/.env.dev.example`) :

```env
GITHUB_CLIENT_ID=le_client_id_github
GITHUB_CLIENT_SECRET=le_client_secret_github

# Origine autorisée à appeler l'API (CORS) — l'URL du frontend
CORS_ORIGIN=http://localhost:3000
```

### 3. Configurer le frontend

Dans `frontend/.env` (voir `frontend/.env.example`) :

```env
NUXT_PUBLIC_API_BASE=http://localhost:3003/api
NUXT_PUBLIC_API_KEY=test
NUXT_PUBLIC_GITHUB_CLIENT_ID=le_client_id_github
```

Le `client_id` est public (il apparaît dans l'URL d'autorisation GitHub), seul le `client_secret` doit rester côté backend.

### 4. Tester le flow

1. Lancer le backend (`npm run dev` dans `backend/`) et le frontend (`npm run dev` dans `frontend/`).
2. Aller sur `http://localhost:3000/login` et cliquer sur **Continuer avec GitHub**.
3. Après autorisation sur GitHub, tu es redirigé vers `/auth/github/callback` qui échange le code auprès du backend (`POST /api/auth/oauth/github`) et te connecte (ou crée le compte si c'est la première connexion avec cet e-mail GitHub).
4. Si la double authentification (TOTP) est activée sur le compte, un code est demandé avant de finaliser la connexion.
