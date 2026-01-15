-- AlterTable
ALTER TABLE `task` ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `endDate` DATETIME(3) NULL,
    ADD COLUMN `isPaused` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `pausedAt` DATETIME(3) NULL,
    ADD COLUMN `skipWeekends` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `Task_deletedAt_idx` ON `Task`(`deletedAt`);
