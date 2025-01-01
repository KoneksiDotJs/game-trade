/*
  Warnings:

  - You are about to drop the column `parentId` on the `category` table. All the data in the column will be lost.
  - Added the required column `serviceTypeId` to the `Listing` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `category` DROP FOREIGN KEY `Category_parentId_fkey`;

-- DropIndex
DROP INDEX `Category_parentId_fkey` ON `category`;

-- AlterTable
ALTER TABLE `category` DROP COLUMN `parentId`;

-- AlterTable
ALTER TABLE `listing` ADD COLUMN `serviceTypeId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `ServiceType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,

    UNIQUE INDEX `ServiceType_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Listing` ADD CONSTRAINT `Listing_serviceTypeId_fkey` FOREIGN KEY (`serviceTypeId`) REFERENCES `ServiceType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
