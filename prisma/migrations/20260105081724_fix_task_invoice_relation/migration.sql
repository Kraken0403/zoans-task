/*
  Warnings:

  - You are about to drop the column `invoiceNo` on the `invoice` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `invoice` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `invoiceitem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(12,2)`.
  - A unique constraint covering the columns `[invoiceNumber]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `createdById` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fromCompanyId` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoiceNumber` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `InvoiceItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `invoiceitem` DROP FOREIGN KEY `InvoiceItem_invoiceId_fkey`;

-- DropForeignKey
ALTER TABLE `invoiceitem` DROP FOREIGN KEY `InvoiceItem_taskId_fkey`;

-- DropIndex
DROP INDEX `Invoice_invoiceNo_key` ON `invoice`;

-- DropIndex
DROP INDEX `InvoiceItem_invoiceId_fkey` ON `invoiceitem`;

-- DropIndex
DROP INDEX `InvoiceItem_taskId_key` ON `invoiceitem`;

-- AlterTable
ALTER TABLE `invoice` DROP COLUMN `invoiceNo`,
    DROP COLUMN `totalAmount`,
    ADD COLUMN `cgstAmount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `createdById` INTEGER NOT NULL,
    ADD COLUMN `discount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `dueDate` DATETIME(3) NULL,
    ADD COLUMN `fromCompanyId` INTEGER NOT NULL,
    ADD COLUMN `gstPercent` DECIMAL(5, 2) NOT NULL DEFAULT 18.00,
    ADD COLUMN `igstAmount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `invoiceNumber` VARCHAR(191) NOT NULL,
    ADD COLUMN `isIntraState` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `isManualTotal` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `issueDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `notes` VARCHAR(191) NULL,
    ADD COLUMN `placeOfSupply` VARCHAR(191) NULL,
    ADD COLUMN `pricingMode` ENUM('EXCLUSIVE', 'INCLUSIVE') NOT NULL DEFAULT 'EXCLUSIVE',
    ADD COLUMN `sgstAmount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `status` ENUM('DRAFT', 'SENT', 'PAID', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    ADD COLUMN `subtotal` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `total` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `invoiceitem` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `quantity` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `title` VARCHAR(191) NOT NULL,
    ADD COLUMN `unitPrice` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    MODIFY `taskId` INTEGER NULL,
    MODIFY `amount` DECIMAL(12, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `task` MODIFY `status` ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'INVOICED') NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE `MyCompany` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ownerId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `gstin` VARCHAR(191) NULL,
    `pan` VARCHAR(191) NULL,
    `addressLine1` VARCHAR(191) NULL,
    `addressLine2` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `pincode` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `logoUrl` VARCHAR(191) NULL,
    `bankName` VARCHAR(191) NULL,
    `bankAccount` VARCHAR(191) NULL,
    `bankIfsc` VARCHAR(191) NULL,
    `bankBranch` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MyCompany_gstin_key`(`gstin`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InvoiceEmailLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoiceId` INTEGER NOT NULL,
    `toEmail` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NULL,
    `sentAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(191) NOT NULL,
    `error` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Invoice_invoiceNumber_key` ON `Invoice`(`invoiceNumber`);

-- AddForeignKey
ALTER TABLE `MyCompany` ADD CONSTRAINT `MyCompany_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_fromCompanyId_fkey` FOREIGN KEY (`fromCompanyId`) REFERENCES `MyCompany`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceItem` ADD CONSTRAINT `InvoiceItem_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceItem` ADD CONSTRAINT `InvoiceItem_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `Task`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceEmailLog` ADD CONSTRAINT `InvoiceEmailLog_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
