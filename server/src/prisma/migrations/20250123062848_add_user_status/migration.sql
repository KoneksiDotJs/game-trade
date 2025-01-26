-- AlterTable
ALTER TABLE `user` ADD COLUMN `banReason` VARCHAR(191) NULL,
    ADD COLUMN `bannedAt` DATETIME(3) NULL,
    ADD COLUMN `bannedById` VARCHAR(36) NULL,
    ADD COLUMN `status` ENUM('ACTIVE', 'SUSPENDED', 'BANNED') NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX `User_email_idx` ON `User`(`email`);

-- CreateIndex
CREATE INDEX `User_role_idx` ON `User`(`role`);

-- CreateIndex
CREATE INDEX `User_status_idx` ON `User`(`status`);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_bannedById_fkey` FOREIGN KEY (`bannedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
