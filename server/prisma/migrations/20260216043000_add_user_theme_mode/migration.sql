-- CreateEnum
CREATE TYPE "ThemeMode" AS ENUM ('SYSTEM', 'LIGHT', 'DARK');

-- AlterTable
ALTER TABLE "User"
ADD COLUMN "themeMode" "ThemeMode" NOT NULL DEFAULT 'SYSTEM';
