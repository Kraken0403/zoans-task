-- AlterTable
ALTER TABLE `task` ADD COLUMN `parentTaskId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Task_parentTaskId_idx` ON `Task`(`parentTaskId`);

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_parentTaskId_fkey` FOREIGN KEY (`parentTaskId`) REFERENCES `Task`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `task` RENAME INDEX `Task_clientId_fkey` TO `Task_clientId_idx`;
