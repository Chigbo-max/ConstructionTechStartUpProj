/*
  Warnings:

  - The values [CONTRACTOT] on the enum `userRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."userRole_new" AS ENUM ('HOMEOWNER', 'CONTRACTOR', 'OTHER');
ALTER TABLE "public"."User" ALTER COLUMN "role" TYPE "public"."userRole_new" USING ("role"::text::"public"."userRole_new");
ALTER TYPE "public"."userRole" RENAME TO "userRole_old";
ALTER TYPE "public"."userRole_new" RENAME TO "userRole";
DROP TYPE "public"."userRole_old";
COMMIT;
