FROM node:20-bookworm-slim

WORKDIR /app

# prisma engines need libssl at runtime (bookworm => openssl 3 / libssl3)
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl postgresql-client \
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

# la start: asteapta DB pe TCP, aplica migratii, optional seed, apoi porneste serverul
CMD ["sh", "-c", "attempt=1; max=30; until pg_isready -h db -p 5432 -U postgres -d dentalcrm >/dev/null 2>&1; do if [ \"$attempt\" -ge \"$max\" ]; then echo 'Database is still unreachable after retries.' >&2; exit 1; fi; echo \"Waiting for database... ($attempt/$max)\"; attempt=$((attempt+1)); sleep 2; done; npx prisma migrate deploy && if [ \"${SEED_ON_STARTUP:-true}\" = \"true\" ]; then node src/seed.js; else echo 'Skipping seed (SEED_ON_STARTUP=false)'; fi && node src/index.js"]
