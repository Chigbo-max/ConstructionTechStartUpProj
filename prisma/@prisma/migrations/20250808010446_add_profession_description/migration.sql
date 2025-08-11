/*
  Warnings:

  - Changed the type of `role` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."userRole" AS ENUM ('HOMEOWNER', 'CONTRACTOT', 'OTHER');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "professionDescription" TEXT,
DROP COLUMN "role",
ADD COLUMN     "role" "public"."userRole" NOT NULL;
