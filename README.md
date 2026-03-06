# Dental CRM

MVP web pentru administrare stomatologică.

## Stack
- Client: React + Vite
- Server: Node.js + Express + Prisma
- DB: PostgreSQL

## Prima rulare (Docker)
Pentru a rula aplicația pentru prima dată, folosiți comenzile:
```bash
npm i
```
pentru a instala dependințele, in SERVER si in CLIENT,apoi:

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
