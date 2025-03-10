-- CreateTable
CREATE TABLE `moderationLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `moderatorId` INTEGER NOT NULL,
    `listingId` INTEGER NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `reason` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
