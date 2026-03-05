# Dental CRM

MVP web pentru administrare stomatologică.

## Stack
- Client: React + Vite
- Server: Node.js + Express + Prisma
- DB: PostgreSQL

## Rulare rapidă (Docker)
```bash
docker compose up --build
```

## Fără seed la startup
```bash
SEED_ON_STARTUP=false docker compose up --build
```

## URL-uri
- Client: http://localhost:5173
- API: http://localhost:4000

## Utilizatori seed (implicit)
- `admin@local.com / admin123`
- `doctor@local.com / doctor123`
- `reception@local.com / reception123`
