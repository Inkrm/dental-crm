FROM node:20-bookworm-slim

WORKDIR /app

# prisma engines need libssl at runtime (bookworm => openssl 3 / libssl3)
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

# deps
COPY package*.json ./
RUN npm ci

# prisma schema + generate
COPY prisma ./prisma
RUN npx prisma generate

# app source
COPY src ./src

EXPOSE 4000

# la start: aplică migrații, rulează seed idempotent, apoi pornește serverul
CMD ["sh", "-c", "npx prisma migrate deploy && node src/seed.js && node src/index.js"]
