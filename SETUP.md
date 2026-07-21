# Setup

Use the checked-in [.env.example](.env.example) as the configuration contract. PostgreSQL is required; MongoDB and mock-only startup modes are not supported.

```bash
cp .env.example .env
# Edit DATABASE_URL, NEXTAUTH_SECRET, and SALES_WORKER_TOKEN before continuing.
npm ci
npx prisma generate
npx prisma migrate deploy
npm run dev
```

`npx prisma migrate deploy` is an explicit operator/CI step. Neither `npm start` nor `start.sh` changes database schema or creates sample accounts.

For a container deployment, set `POSTGRES_PASSWORD`, `NEXTAUTH_URL`, 32+ character `NEXTAUTH_SECRET` and `SALES_WORKER_TOKEN` values, and any connector/webhook secrets used by configured providers, then run:

```bash
docker compose up --build
```

The database must be backed up before production migration. See [docs/OPERATIONS.md](docs/OPERATIONS.md) for the release, rollback, and health-check procedures.
