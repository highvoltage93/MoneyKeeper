# Money Keeper API

NestJS backend for the Money Keeper mobile app. It exposes REST endpoints over a PostgreSQL database and is designed to run locally through Docker Compose.

## Run With Docker

From the repository root:

```bash
docker compose up --build
```

The API will be available at:

```text
http://localhost:3001
```

PostgreSQL will be available at:

```text
localhost:5432
database: money_keeper
user: money_keeper
password: money_keeper_password
```

The container runs `prisma db push` and seeds demo data on startup.

## Useful Endpoints

```text
GET    /health
GET    /accounts
POST   /accounts
PATCH  /accounts/:id
DELETE /accounts/:id

GET    /categories?type=expense
POST   /categories
PATCH  /categories/:id
DELETE /categories/:id

GET    /transactions?from=2026-05-01&to=2026-05-29&type=expense
POST   /transactions
PATCH  /transactions/:id
DELETE /transactions/:id

GET    /budgets
GET    /goals
GET    /recurring-payments
GET    /analytics/summary?from=2026-05-01&to=2026-05-29
```

## iPhone / Expo URL

If the API runs on a machine in the same Wi-Fi network as the iPhone, the mobile app should use that machine's LAN IP:

```text
http://<LAN_IP>:3001
```

For example:

```text
http://192.168.68.100:3001
```
