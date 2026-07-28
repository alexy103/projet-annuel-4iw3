FROM node:22-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-slim AS runtime

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
WORKDIR /app

COPY --from=build /app/.output ./.output

RUN useradd --system --create-home --home-dir /app appuser \
    && chown -R appuser:appuser /app

USER appuser

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
