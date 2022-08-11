/*
  Warnings:

  - You are about to drop the column `thumbnailUrl` on the `List` table. All the data in the column will be lost.
  - You are about to drop the column `bannerUrl` on the `Place` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailUrl` on the `Place` table. All the data in the column will be lost.
  - You are about to drop the column `avatarUrl` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "List" DROP COLUMN "thumbnailUrl",
ADD COLUMN     "thumbnail" VARCHAR(2048);

-- AlterTable
ALTER TABLE "Place" DROP COLUMN "bannerUrl",
DROP COLUMN "thumbnailUrl",
ADD COLUMN     "banner" VARCHAR(2048),
ADD COLUMN     "thumbnail" VARCHAR(2048);

-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatarUrl",
ADD COLUMN     "avatar" VARCHAR(2048);
