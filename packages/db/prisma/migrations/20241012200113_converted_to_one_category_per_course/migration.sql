/*
  Warnings:

  - You are about to drop the `_CourseTocategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CourseTocategory" DROP CONSTRAINT "_CourseTocategory_A_fkey";

-- DropForeignKey
ALTER TABLE "_CourseTocategory" DROP CONSTRAINT "_CourseTocategory_B_fkey";

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "categoryId" TEXT;

-- DropTable
DROP TABLE "_CourseTocategory";

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
