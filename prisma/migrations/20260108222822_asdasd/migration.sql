/*
  Warnings:

  - You are about to drop the column `category` on the `invoicesequence` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[companyId,fy,month]` on the table `InvoiceSequence` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `MyCompany` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `MyCompany` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `InvoiceSequence_companyId_fy_month_category_key` ON `invoicesequence`;

-- AlterTable
ALTER TABLE `invoicesequence` DROP COLUMN `category`;

-- AlterTable
ALTER TABLE `mycompany` ADD COLUMN `code` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `InvoiceSequence_companyId_fy_month_key` ON `InvoiceSequence`(`companyId`, `fy`, `month`);

-- CreateIndex
CREATE UNIQUE INDEX `MyCompany_code_key` ON `MyCompany`(`code`);
