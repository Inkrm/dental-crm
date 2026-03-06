# Dental CRM

MVP web pentru administrare stomatologică. (NU ESTE PENTRU PRODUCȚIE!!!)

## Stack
- Client: React + Vite
- Server: Node.js + Express + Prisma
- DB: PostgreSQL

## Prima rulare (Docker)
Pentru a porni aplicația pentru prima dată, executați mai întâi comanda (in SERVER si in CLIENT):
```bash
npm i
```
Aceasta va instala dependențele atât pentru SERVER, cât și pentru CLIENT.
După, executați:
```bash
docker compose up --build
```
Această comandă va construi imaginile Docker și va porni aplicația.

## Startup
```bash
SEED_ON_STARTUP=false docker compose up --build
```

## Utilizatori seed (implicit)
- `admin@local.com / admin123`
- `doctor@local.com / doctor123`
- `reception@local.com / reception123`
