FROM node:22-slim

# 1. Créér le répertoire de travail
WORKDIR /app

# 2. Copier les fichiers de config
COPY package*.json tsconfig.json ./

# 3. Instalaltion des dépendances
RUN npm install

# 4. Copier le reste du code
COPY . .

# 5. Exposer le port interne
EXPOSE 3003

# 6. Lancer en dev avec hot reload
CMD ["npm", "run", "dev"]