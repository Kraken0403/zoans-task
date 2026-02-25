-- DropForeignKey
ALTER TABLE `task` DROP FOREIGN KEY `task_taskMasterId_fkey`;

-- DropIndex
DROP INDEX `task_taskMasterId_clientId_periodKey_idx` ON `task`;

-- AlterTable
ALTER TABLE `mycompany` MODIFY `stateCode` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `task` DROP COLUMN `periodKey`;

-- CreateIndex
CREATE UNIQUE INDEX `task_taskMasterId_clientId_periodStart_key` ON `task`(`taskMasterId`, `clientId`, `periodStart`);

-- AddForeignKey
ALTER TABLE `task` ADD CONSTRAINT `task_taskMasterId_fkey` FOREIGN KEY (`taskMasterId`) REFERENCES `taskmaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
