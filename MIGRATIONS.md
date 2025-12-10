# Database Migrations

This project uses Prisma for database migrations with MariaDB.

## Setup

### Local Development

1. Start the local MariaDB shadow database:
   ```bash
   docker compose up -d
   ```

2. Ensure your `.env` has both database URLs:
   ```
   DATABASE_URL="mysql://user:pass@your-server:3306/soapbot"
   SHADOW_DATABASE_URL="mysql://root:root@localhost:3306/soapbot_shadow"
   ```

The shadow database is required for `prisma migrate dev` to detect schema changes and generate migrations.

## Commands

### Create and apply a migration (development)
```bash
npx prisma migrate dev --name migration_name
```

### Create migration without applying (review first)
```bash
npx prisma migrate dev --create-only --name migration_name
```

### Apply pending migrations (production)
```bash
npx prisma migrate deploy
```

### Check migration status
```bash
npx prisma migrate status
```

### Pull schema from existing database
```bash
npx prisma db pull
```

### Generate Prisma Client after schema changes
```bash
npx prisma generate
```

## Notes

- Production uses MariaDB 11.x
- Local shadow database uses MariaDB 11.0 (via Docker) to match production
- The `migration_lock.toml` file should be committed to version control
- `prisma migrate deploy` does not require a shadow database (safe for production)
- `prisma migrate dev` requires a shadow database (local development only)

## File Structure

```
prisma/
├── schema.prisma          # Database schema
├── migrations/
│   ├── migration_lock.toml  # Provider lock (commit this)
│   └── 0_init/
│       └── migration.sql    # Initial migration
└── ...
```
