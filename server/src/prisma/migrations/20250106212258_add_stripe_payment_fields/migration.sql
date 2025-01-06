/*
  Warnings:

  - A unique constraint covering the columns `[stripePaymentIntentId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `transaction` ADD COLUMN `paymentStatus` VARCHAR(191) NULL DEFAULT 'pending',
    ADD COLUMN `stripePaymentIntentId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Transaction_stripePaymentIntentId_key` ON `Transaction`(`stripePaymentIntentId`);
