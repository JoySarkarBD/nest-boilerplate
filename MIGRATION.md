# Prisma + PostgreSQL Migration Guide

## Overview of Changes

| Layer | Before (Mongoose) | After (Prisma/PostgreSQL) |
|---|---|---|
| DB | MongoDB | PostgreSQL |
| ORM | Mongoose `@Schema`, `@Prop` | Prisma schema files |
| Data access | `UserService` with `Model<User>` | `UserDAO` → `UserService` → Prisma |
| Schema | `user.schema.ts` | `prisma/schemas/user.prisma` |
| Root module | `MongooseModule.forRoot()` | `PrismaModule` (global) |
| Connection | Mongoose client | `PrismaService` (lifecycle hooks) |

---

## Step 1 — Install dependencies

```bash
npm install @prisma/client
npm install -D prisma
```

Remove Mongoose (no longer needed):
```bash
npm uninstall @nestjs/mongoose mongoose
```

---

## Step 2 — Environment variable

Replace `MONGO_URI` with `DATABASE_URL` in `.env`:

```env
# Remove this:
MONGO_URI=mongodb://localhost:27017/mydb

# Add this:
DATABASE_URL=postgresql://postgres:password@localhost:5432/myapp_db?schema=public
```

---

## Step 3 — Generate Prisma client

```bash
npx prisma generate
```

This reads all files in `prisma/schemas/` (via `prismaSchemaFolder` feature)
and generates the TypeScript client at `node_modules/@prisma/client`.

---

## Step 4 — Run first migration

```bash
# Development (creates migration file + applies it)
npx prisma migrate dev --name init

# This creates:
# prisma/migrations/20250504_init/migration.sql
# Which contains the CREATE TABLE "User" DDL matching the DB diagram
```

---

## Step 5 — Seed the database

```bash
npx prisma db seed
# Creates default admin@example.com (SHOP_OWNER)
```

---

## Step 6 — Copy modified files into your project

Replace the following files:

```
src/app.module.ts                              ← removes MongooseModule, adds PrismaModule
src/shared/config/app.config.ts               ← DATABASE_URL instead of MONGO_URI
src/shared/interfaces/auth-user.interface.ts  ← name instead of fullName
src/shared/prisma/prisma.service.ts           ← NEW
src/shared/prisma/prisma.module.ts            ← NEW
src/shared/prisma/index.ts                    ← NEW
src/modules/user-service/dao/user.dao.ts      ← NEW — all DB logic
src/modules/user-service/user.service.ts      ← delegates to UserDAO
src/modules/user-service/user.module.ts       ← no Mongoose imports
src/modules/auth-service/auth.service.ts      ← uses UserService Prisma methods
src/modules/auth-service/auth.module.ts       ← same wiring, Prisma-compatible
src/modules/auth-service/strategies/jwt.strategy.ts  ← Redis validation + `name` field
src/modules/auth-service/dto/validation/register.dto.ts     ← password complexity
src/modules/auth-service/dto/validation/verify-account.dto.ts ← email + OTP fields
src/modules/auth-service/dto/validation/reset-password.dto.ts ← OTP-only (no UUID token)
prisma/schema.prisma                          ← NEW (entry point)
prisma/schemas/base.prisma                    ← NEW (datasource + generator)
prisma/schemas/user.prisma                    ← NEW (User model + UserRole enum)
prisma/seed.ts                                ← NEW (dev seed)
```

---

## Schema folder approach — how it works

With `previewFeatures = ["prismaSchemaFolder"]` in `base.prisma`:

```
prisma/
├── schema.prisma          ← root (kept for tooling compat)
└── schemas/
    ├── base.prisma        ← generator + datasource
    ├── user.prisma        ← User + UserRole
    └── product.prisma     ← (future) Product, Category
    └── order.prisma       ← (future) Order, OrderItem
```

**To add a new domain:**
1. Create `prisma/schemas/<domain>.prisma`
2. Define models and enums scoped to that domain
3. Run `npx prisma generate` + `npx prisma migrate dev --name <description>`
4. No changes to `schema.prisma` or `base.prisma`

---

## DAO layer — why and how

```
AuthService → UserService → UserDAO → PrismaService → PostgreSQL
```

**UserDAO** owns ALL Prisma queries for the User model:
- `password` is NEVER returned by default selects
- Separate `findWithPassword()` and `findByIdWithPassword()` for auth flows
- Separate `findWithOtp()` for verification/reset flows
- `markVerifiedAndClearOtp()` and `resetPasswordAndClearOtp()` for atomic updates

**UserService** exposes the domain API — delegates everything to UserDAO.

**AuthService** depends only on UserService, never on Prisma directly.

---

## Auth flow changes (Mongoose → Prisma)

| Flow | Mongoose field | Prisma column |
|---|---|---|
| Registration OTP | `verificationToken` (UUID) | `acc_verification_otp` (6-digit OTP) |
| Password reset | `resetPasswordToken` + `otp` | `reset_pass_otp` (6-digit OTP) |
| Reset expiry | `resetPasswordExpires` / `otpExpires` | `reset_pass_otp_expired_at` |
| User name | `fullName` | `name` |
| Account verified | `accountVerified` | `acc_verified` |

**Why OTP instead of UUID token?**
The PostgreSQL table uses `acc_verification_otp` and `reset_pass_otp` — both
6-digit OTP fields. This matches the DB diagram exactly. The DTO field name
`token` is kept for backward compatibility with the existing controller.

---

## Production migration checklist

```bash
# Always run in CI before deploying
npx prisma migrate deploy

# Never run migrate dev in production (it can drop data)
# Never run prisma db push in production
```
