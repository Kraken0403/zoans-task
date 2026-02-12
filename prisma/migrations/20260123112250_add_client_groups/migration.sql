-- AlterTable
ALTER TABLE `client` ADD COLUMN `clientGroupId` INTEGER NULL;

-- CreateTable
CREATE TABLE `client_group` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `client_group_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `client` ADD CONSTRAINT `client_clientGroupId_fkey` FOREIGN KEY (`clientGroupId`) REFERENCES `client_group`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
