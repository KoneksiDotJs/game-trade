-- AlterTable
ALTER TABLE `moderationlog` MODIFY `moderatorId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `moderationLog` ADD CONSTRAINT `moderationLog_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `Listing`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
