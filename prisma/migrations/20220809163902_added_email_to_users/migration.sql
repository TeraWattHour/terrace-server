/*
  Warnings:

  - You are about to drop the column `bannerUrl` on the `List` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "List" DROP COLUMN "bannerUrl";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "email" VARCHAR(255);
