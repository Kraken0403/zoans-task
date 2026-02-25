-- CreateTable
CREATE TABLE `client` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `gstNumber` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `code` VARCHAR(191) NOT NULL,
    `addressLine1` VARCHAR(191) NULL,
    `addressLine2` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `pincode` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `stateCode` VARCHAR(191) NULL,
    `clientGroupId` INTEGER NULL,

    INDEX `client_clientGroupId_fkey`(`clientGroupId` ASC),
    UNIQUE INDEX `client_code_key`(`code` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `client_group` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `client_group_code_key`(`code` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clientId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `cgstAmount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `createdById` INTEGER NOT NULL,
    `discount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `dueDate` DATETIME(3) NULL,
    `fromCompanyId` INTEGER NOT NULL,
    `gstPercent` DECIMAL(5, 2) NOT NULL DEFAULT 18.00,
    `igstAmount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `isIntraState` BOOLEAN NOT NULL DEFAULT true,
    `isManualTotal` BOOLEAN NOT NULL DEFAULT false,
    `issueDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notes` VARCHAR(191) NULL,
    `placeOfSupply` VARCHAR(191) NULL,
    `pricingMode` ENUM('EXCLUSIVE', 'INCLUSIVE') NOT NULL DEFAULT 'EXCLUSIVE',
    `sgstAmount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `status` ENUM('DRAFT', 'SENT', 'PAID', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `subtotal` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `total` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `updatedAt` DATETIME(3) NOT NULL,
    `bankAccount` VARCHAR(191) NULL,
    `bankBranch` VARCHAR(191) NULL,
    `bankIfsc` VARCHAR(191) NULL,
    `bankName` VARCHAR(191) NULL,
    `clientAddress` VARCHAR(191) NULL,
    `clientCity` VARCHAR(191) NULL,
    `clientEmail` VARCHAR(191) NULL,
    `clientGstin` VARCHAR(191) NULL,
    `clientName` VARCHAR(191) NULL,
    `clientPhone` VARCHAR(191) NULL,
    `clientPincode` VARCHAR(191) NULL,
    `clientState` VARCHAR(191) NULL,
    `clientStateCode` VARCHAR(191) NULL,
    `companySealUrl` VARCHAR(191) NULL,
    `companySignatureUrl` VARCHAR(191) NULL,
    `fromCompanyAddress` VARCHAR(191) NULL,
    `fromCompanyEmail` VARCHAR(191) NULL,
    `fromCompanyGstin` VARCHAR(191) NULL,
    `fromCompanyName` VARCHAR(191) NULL,
    `fromCompanyPhone` VARCHAR(191) NULL,
    `fromCompanyState` VARCHAR(191) NULL,
    `fromCompanyStateCode` VARCHAR(191) NULL,
    `placeOfSupplyState` VARCHAR(191) NULL,
    `placeOfSupplyStateCode` VARCHAR(191) NULL,
    `fromCompanyCity` VARCHAR(191) NULL,
    `sourceType` VARCHAR(191) NULL,
    `bankUpi` VARCHAR(191) NULL,
    `fromCompanyLogoUrl` VARCHAR(191) NULL,
    `fromCompanyMsme` VARCHAR(191) NULL,
    `fromCompanyMsmeCategory` VARCHAR(191) NULL,
    `fromCompanyPan` VARCHAR(191) NULL,
    `fromCompanyTagline` VARCHAR(191) NULL,
    `fromCompanyUpiId` VARCHAR(191) NULL,
    `servicePeriodEnd` DATETIME(3) NULL,
    `servicePeriodStart` DATETIME(3) NULL,
    `serviceFrom` DATETIME(3) NULL,
    `serviceTo` DATETIME(3) NULL,

    INDEX `invoice_clientId_fkey`(`clientId` ASC),
    INDEX `invoice_createdById_fkey`(`createdById` ASC),
    INDEX `invoice_fromCompanyId_fkey`(`fromCompanyId` ASC),
    UNIQUE INDEX `invoice_invoiceNumber_key`(`invoiceNumber` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoiceemaillog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoiceId` INTEGER NOT NULL,
    `toEmail` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NULL,
    `sentAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(191) NOT NULL,
    `error` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `invoiceemaillog_invoiceId_fkey`(`invoiceId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoiceitem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoiceId` INTEGER NOT NULL,
    `taskId` INTEGER NULL,
    `amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `description` VARCHAR(191) NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `title` VARCHAR(191) NOT NULL,
    `unitPrice` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `hsnSac` VARCHAR(191) NULL,
    `unit` VARCHAR(191) NULL,
    `discountPercent` DECIMAL(5, 2) NULL,
    `originalAmount` DECIMAL(12, 2) NULL,
    `period` VARCHAR(191) NULL,

    INDEX `invoiceitem_invoiceId_fkey`(`invoiceId` ASC),
    INDEX `invoiceitem_taskId_fkey`(`taskId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoicesequence` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `fy` VARCHAR(191) NOT NULL,
    `month` VARCHAR(191) NOT NULL,
    `counter` INTEGER NOT NULL,

    UNIQUE INDEX `invoicesequence_companyId_fy_month_key`(`companyId` ASC, `fy` ASC, `month` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mycompany` (
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
    `sealUrl` VARCHAR(191) NULL,
    `signatureUrl` VARCHAR(191) NULL,
    `code` VARCHAR(191) NOT NULL,
    `msmeCategory` VARCHAR(191) NULL,
    `msmeNumber` VARCHAR(191) NULL,
    `tagline` VARCHAR(191) NULL,
    `upiId` VARCHAR(191) NULL,
    `stateCode` VARCHAR(5) NULL,

    UNIQUE INDEX `mycompany_code_key`(`code` ASC),
    UNIQUE INDEX `mycompany_gstin_key`(`gstin` ASC),
    INDEX `mycompany_ownerId_fkey`(`ownerId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `task` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `clientId` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'INVOICED') NOT NULL DEFAULT 'PENDING',
    `interval` INTEGER NULL,
    `dueDate` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deletedAt` DATETIME(3) NULL,
    `assignedToUserId` INTEGER NULL,
    `categoryId` INTEGER NULL,
    `periodEnd` DATETIME(3) NULL,
    `periodStart` DATETIME(3) NULL,
    `taskMasterId` INTEGER NULL,
    `periodKey` VARCHAR(191) NULL,
    `gstRate` DECIMAL(5, 2) NULL,
    `hsnSac` VARCHAR(191) NULL,
    `isBillable` BOOLEAN NOT NULL DEFAULT true,
    `unitLabel` VARCHAR(191) NULL,

    INDEX `task_assignedToUserId_idx`(`assignedToUserId` ASC),
    INDEX `task_categoryId_idx`(`categoryId` ASC),
    INDEX `task_clientId_idx`(`clientId` ASC),
    INDEX `task_deletedAt_idx`(`deletedAt` ASC),
    INDEX `task_periodStart_idx`(`periodStart` ASC),
    INDEX `task_taskMasterId_clientId_periodKey_idx`(`taskMasterId` ASC, `clientId` ASC, `periodKey` ASC),
    INDEX `task_taskMasterId_idx`(`taskMasterId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `taskassignment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `taskId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `taskassignment_taskId_userId_key`(`taskId` ASC, `userId` ASC),
    INDEX `taskassignment_userId_fkey`(`userId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `taskcategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `taskcategory_name_key`(`name` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `taskmaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `categoryId` INTEGER NOT NULL,
    `frequency` ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'EVENT_BASED') NOT NULL,
    `interval` INTEGER NULL,
    `financialYear` VARCHAR(191) NULL,
    `defaultDueDay` INTEGER NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `gstRate` DECIMAL(5, 2) NULL,
    `hsnSac` VARCHAR(191) NULL,
    `isBillable` BOOLEAN NOT NULL DEFAULT true,
    `unitLabel` VARCHAR(191) NULL,

    INDEX `taskmaster_categoryId_idx`(`categoryId` ASC),
    INDEX `taskmaster_isActive_idx`(`isActive` ASC),
    PRIMARY KEY (`id` ASC)
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

    INDEX `taskmasterclient_clientId_idx`(`clientId` ASC),
    INDEX `taskmasterclient_isActive_idx`(`isActive` ASC),
    UNIQUE INDEX `taskmasterclient_taskMasterId_clientId_key`(`taskMasterId` ASC, `clientId` ASC),
    INDEX `taskmasterclient_taskMasterId_idx`(`taskMasterId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'MANAGER', 'EMPLOYEE', 'EXECUTIVE') NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `resetToken` VARCHAR(191) NULL,
    `resetTokenExpiry` DATETIME(3) NULL,
    `username` VARCHAR(191) NULL,

    UNIQUE INDEX `user_email_key`(`email` ASC),
    UNIQUE INDEX `user_username_key`(`username` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `client` ADD CONSTRAINT `client_clientGroupId_fkey` FOREIGN KEY (`clientGroupId`) REFERENCES `client_group`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice` ADD CONSTRAINT `invoice_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice` ADD CONSTRAINT `invoice_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice` ADD CONSTRAINT `invoice_fromCompanyId_fkey` FOREIGN KEY (`fromCompanyId`) REFERENCES `mycompany`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoiceemaillog` ADD CONSTRAINT `invoiceemaillog_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoiceitem` ADD CONSTRAINT `invoiceitem_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoiceitem` ADD CONSTRAINT `invoiceitem_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `task`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mycompany` ADD CONSTRAINT `mycompany_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task` ADD CONSTRAINT `task_assignedToUserId_fkey` FOREIGN KEY (`assignedToUserId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task` ADD CONSTRAINT `task_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `taskcategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task` ADD CONSTRAINT `task_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task` ADD CONSTRAINT `task_taskMasterId_fkey` FOREIGN KEY (`taskMasterId`) REFERENCES `taskmaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `taskassignment` ADD CONSTRAINT `taskassignment_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `task`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `taskassignment` ADD CONSTRAINT `taskassignment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `taskmaster` ADD CONSTRAINT `taskmaster_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `taskcategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `taskmasterclient` ADD CONSTRAINT `taskmasterclient_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `taskmasterclient` ADD CONSTRAINT `taskmasterclient_taskMasterId_fkey` FOREIGN KEY (`taskMasterId`) REFERENCES `taskmaster`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
