# Dental CRM

MVP web pentru administrare stomatologică.

## Stack
- Client: React + Vite
- Server: Node.js + Express + Prisma
- DB: PostgreSQL

## Prima rulare (Docker)
```bash
docker compose up --build
```

## Startup
```bash
SEED_ON_STARTUP=false docker compose up --build
```

## Utilizatori seed (implicit)
- `admin@local.com / admin123`
- `doctor@local.com / doctor123`
- `reception@local.com / reception123`
