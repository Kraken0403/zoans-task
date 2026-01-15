/*
  Warnings:

  - You are about to drop the column `address` on the `client` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `client` DROP COLUMN `address`,
    ADD COLUMN `addressLine1` VARCHAR(191) NULL,
    ADD COLUMN `addressLine2` VARCHAR(191) NULL,
    ADD COLUMN `city` VARCHAR(191) NULL,
    ADD COLUMN `pincode` VARCHAR(191) NULL,
    ADD COLUMN `state` VARCHAR(191) NULL,
    ADD COLUMN `stateCode` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `invoice` ADD COLUMN `bankAccount` VARCHAR(191) NULL,
    ADD COLUMN `bankBranch` VARCHAR(191) NULL,
    ADD COLUMN `bankIfsc` VARCHAR(191) NULL,
    ADD COLUMN `bankName` VARCHAR(191) NULL,
    ADD COLUMN `clientAddress` VARCHAR(191) NULL,
    ADD COLUMN `clientCity` VARCHAR(191) NULL,
    ADD COLUMN `clientEmail` VARCHAR(191) NULL,
    ADD COLUMN `clientGstin` VARCHAR(191) NULL,
    ADD COLUMN `clientName` VARCHAR(191) NULL,
    ADD COLUMN `clientPhone` VARCHAR(191) NULL,
    ADD COLUMN `clientPincode` VARCHAR(191) NULL,
    ADD COLUMN `clientState` VARCHAR(191) NULL,
    ADD COLUMN `clientStateCode` VARCHAR(191) NULL,
    ADD COLUMN `companySealUrl` VARCHAR(191) NULL,
    ADD COLUMN `companySignatureUrl` VARCHAR(191) NULL,
    ADD COLUMN `fromCompanyAddress` VARCHAR(191) NULL,
    ADD COLUMN `fromCompanyEmail` VARCHAR(191) NULL,
    ADD COLUMN `fromCompanyGstin` VARCHAR(191) NULL,
    ADD COLUMN `fromCompanyName` VARCHAR(191) NULL,
    ADD COLUMN `fromCompanyPhone` VARCHAR(191) NULL,
    ADD COLUMN `fromCompanyState` VARCHAR(191) NULL,
    ADD COLUMN `fromCompanyStateCode` VARCHAR(191) NULL,
    ADD COLUMN `placeOfSupplyState` VARCHAR(191) NULL,
    ADD COLUMN `placeOfSupplyStateCode` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `invoiceitem` ADD COLUMN `hsnSac` VARCHAR(191) NULL,
    ADD COLUMN `unit` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `InvoiceSequence` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `fy` VARCHAR(191) NOT NULL,
    `month` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `counter` INTEGER NOT NULL,

    UNIQUE INDEX `InvoiceSequence_companyId_fy_month_category_key`(`companyId`, `fy`, `month`, `category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
