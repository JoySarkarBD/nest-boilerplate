-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('CUSTOMER', 'SHOP_OWNER');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "avatar" TEXT,
    "password" VARCHAR(255) NOT NULL,
    "acc_verification_otp" VARCHAR(10),
    "acc_verified" BOOLEAN NOT NULL DEFAULT false,
    "role" "user_role" NOT NULL,
    "reset_pass_otp" VARCHAR(255),
    "reset_pass_otp_expired_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");
