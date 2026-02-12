-- DropForeignKey
ALTER TABLE `invoice` DROP FOREIGN KEY `Invoice_clientId_fkey`;

-- DropForeignKey
ALTER TABLE `invoice` DROP FOREIGN KEY `Invoice_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `invoice` DROP FOREIGN KEY `Invoice_fromCompanyId_fkey`;

-- DropForeignKey
ALTER TABLE `invoiceemaillog` DROP FOREIGN KEY `InvoiceEmailLog_invoiceId_fkey`;

-- DropForeignKey
ALTER TABLE `invoiceitem` DROP FOREIGN KEY `InvoiceItem_invoiceId_fkey`;

-- DropForeignKey
ALTER TABLE `invoiceitem` DROP FOREIGN KEY `InvoiceItem_taskId_fkey`;

-- DropForeignKey
ALTER TABLE `mycompany` DROP FOREIGN KEY `MyCompany_ownerId_fkey`;

-- DropForeignKey
ALTER TABLE `task` DROP FOREIGN KEY `Task_clientId_fkey`;

-- DropForeignKey
ALTER TABLE `task` DROP FOREIGN KEY `Task_parentTaskId_fkey`;

-- DropForeignKey
ALTER TABLE `taskassignment` DROP FOREIGN KEY `TaskAssignment_taskId_fkey`;

-- DropForeignKey
ALTER TABLE `taskassignment` DROP FOREIGN KEY `TaskAssignment_userId_fkey`;

-- AlterTable
ALTER TABLE `task` ADD COLUMN `assignedToUserId` INTEGER NULL,
    ADD COLUMN `categoryId` INTEGER NULL,
    ADD COLUMN `periodEnd` DATETIME(3) NULL,
    ADD COLUMN `periodStart` DATETIME(3) NULL,
    ADD COLUMN `taskMasterId` INTEGER NULL;

-- CreateTable
CREATE TABLE `taskcategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `taskcategory_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `taskmaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `categoryId` INTEGER NOT NULL,
    `frequency` ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY') NOT NULL,
    `interval` INTEGER NULL,
    `financialYear` VARCHAR(191) NOT NULL,
    `defaultDueDay` INTEGER NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `taskmaster_categoryId_idx`(`categoryId`),
    INDEX `taskmaster_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `taskmasterclient` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `taskMasterId` INTEGER NOT NULL,
    `clientId` INTEGER NOT NULL,
    `customDueDay` INTEGER NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    INDEX `taskmasterclient_clientId_idx`(`clientId`),
    INDEX `taskmasterclient_taskMasterId_idx`(`taskMasterId`),
    INDEX `taskmasterclient_isActive_idx`(`isActive`),
    UNIQUE INDEX `taskmasterclient_taskMasterId_clientId_key`(`taskMasterId`, `clientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `task_taskMasterId_idx` ON `task`(`taskMasterId`);

-- CreateIndex
CREATE INDEX `task_categoryId_idx` ON `task`(`categoryId`);

-- CreateIndex
CREATE INDEX `task_assignedToUserId_idx` ON `task`(`assignedToUserId`);

-- CreateIndex
CREATE INDEX `task_periodStart_idx` ON `task`(`periodStart`);

-- AddForeignKey
ALTER TABLE `mycompany` ADD CONSTRAINT `mycompany_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice` ADD CONSTRAINT `invoice_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice` ADD CONSTRAINT `invoice_fromCompanyId_fkey` FOREIGN KEY (`fromCompanyId`) REFERENCES `mycompany`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice` ADD CONSTRAINT `invoice_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoiceitem` ADD CONSTRAINT `invoiceitem_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoiceitem` ADD CONSTRAINT `invoiceitem_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `task`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoiceemaillog` ADD CONSTRAINT `invoiceemaillog_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `taskmaster` ADD CONSTRAINT `taskmaster_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `taskcategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `taskmasterclient` ADD CONSTRAINT `taskmasterclient_taskMasterId_fkey` FOREIGN KEY (`taskMasterId`) REFERENCES `taskmaster`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `taskmasterclient` ADD CONSTRAINT `taskmasterclient_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task` ADD CONSTRAINT `task_taskMasterId_fkey` FOREIGN KEY (`taskMasterId`) REFERENCES `taskmaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task` ADD CONSTRAINT `task_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `taskcategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task` ADD CONSTRAINT `task_assignedToUserId_fkey` FOREIGN KEY (`assignedToUserId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task` ADD CONSTRAINT `task_parentTaskId_fkey` FOREIGN KEY (`parentTaskId`) REFERENCES `task`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task` ADD CONSTRAINT `task_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `taskassignment` ADD CONSTRAINT `taskassignment_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `task`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `taskassignment` ADD CONSTRAINT `taskassignment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `client` RENAME INDEX `Client_code_key` TO `client_code_key`;

-- RenameIndex
ALTER TABLE `invoice` RENAME INDEX `Invoice_invoiceNumber_key` TO `invoice_invoiceNumber_key`;

-- RenameIndex
ALTER TABLE `invoicesequence` RENAME INDEX `InvoiceSequence_companyId_fy_month_key` TO `invoicesequence_companyId_fy_month_key`;

-- RenameIndex
ALTER TABLE `mycompany` RENAME INDEX `MyCompany_code_key` TO `mycompany_code_key`;

-- RenameIndex
ALTER TABLE `mycompany` RENAME INDEX `MyCompany_gstin_key` TO `mycompany_gstin_key`;

-- RenameIndex
ALTER TABLE `task` RENAME INDEX `Task_clientId_idx` TO `task_clientId_idx`;

-- RenameIndex
ALTER TABLE `task` RENAME INDEX `Task_deletedAt_idx` TO `task_deletedAt_idx`;

-- RenameIndex
ALTER TABLE `task` RENAME INDEX `Task_parentTaskId_idx` TO `task_parentTaskId_idx`;

-- RenameIndex
ALTER TABLE `taskassignment` RENAME INDEX `TaskAssignment_taskId_userId_key` TO `taskassignment_taskId_userId_key`;

-- RenameIndex
ALTER TABLE `user` RENAME INDEX `User_email_key` TO `user_email_key`;
