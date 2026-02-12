-- AlterTable
ALTER TABLE `task` ADD COLUMN `periodKey` VARCHAR(191) NULL,
    MODIFY `frequency` ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY') NULL;

-- AlterTable
ALTER TABLE `taskmaster` MODIFY `frequency` ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY') NOT NULL;

-- CreateIndex
CREATE INDEX `task_taskMasterId_clientId_periodKey_idx` ON `task`(`taskMasterId`, `clientId`, `periodKey`);
