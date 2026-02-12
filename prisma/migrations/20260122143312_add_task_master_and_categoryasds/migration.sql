/*
  Warnings:

  - You are about to drop the column `endDate` on the `task` table. All the data in the column will be lost.
  - You are about to drop the column `frequency` on the `task` table. All the data in the column will be lost.
  - You are about to drop the column `isPaused` on the `task` table. All the data in the column will be lost.
  - You are about to drop the column `isRecurring` on the `task` table. All the data in the column will be lost.
  - You are about to drop the column `parentTaskId` on the `task` table. All the data in the column will be lost.
  - You are about to drop the column `pausedAt` on the `task` table. All the data in the column will be lost.
  - You are about to drop the column `skipWeekends` on the `task` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `task` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `task` DROP FOREIGN KEY `task_parentTaskId_fkey`;

-- DropIndex
DROP INDEX `task_parentTaskId_idx` ON `task`;

-- AlterTable
ALTER TABLE `invoice` ADD COLUMN `sourceType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `task` DROP COLUMN `endDate`,
    DROP COLUMN `frequency`,
    DROP COLUMN `isPaused`,
    DROP COLUMN `isRecurring`,
    DROP COLUMN `parentTaskId`,
    DROP COLUMN `pausedAt`,
    DROP COLUMN `skipWeekends`,
    DROP COLUMN `startDate`,
    ADD COLUMN `gstRate` DECIMAL(5, 2) NULL,
    ADD COLUMN `hsnSac` VARCHAR(191) NULL,
    ADD COLUMN `isBillable` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `unitLabel` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `taskmaster` ADD COLUMN `gstRate` DECIMAL(5, 2) NULL,
    ADD COLUMN `hsnSac` VARCHAR(191) NULL,
    ADD COLUMN `isBillable` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `unitLabel` VARCHAR(191) NULL;
