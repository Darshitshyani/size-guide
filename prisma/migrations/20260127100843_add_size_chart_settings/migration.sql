-- CreateTable
CREATE TABLE "SizeChartSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "buttonText" TEXT NOT NULL DEFAULT 'Size Guide',
    "buttonIcon" TEXT NOT NULL DEFAULT 'ruler',
    "buttonAlignment" TEXT NOT NULL DEFAULT 'left',
    "buttonTextColor" TEXT NOT NULL DEFAULT '#ffffff',
    "buttonBgColor" TEXT NOT NULL DEFAULT '#111111',
    "buttonBorderRadius" INTEGER NOT NULL DEFAULT 6,
    "buttonPaddingTop" INTEGER NOT NULL DEFAULT 10,
    "buttonPaddingBottom" INTEGER NOT NULL DEFAULT 10,
    "buttonPaddingLeft" INTEGER NOT NULL DEFAULT 20,
    "buttonPaddingRight" INTEGER NOT NULL DEFAULT 20,
    "buttonBorderStyle" TEXT NOT NULL DEFAULT 'none',
    "buttonBorderColor" TEXT NOT NULL DEFAULT '#111111',
    "buttonBorderWidth" INTEGER NOT NULL DEFAULT 1,
    "tableDesign" TEXT NOT NULL DEFAULT 'classic',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SizeChartSettings_shop_key" ON "SizeChartSettings"("shop");

-- CreateIndex
CREATE INDEX "SizeChartSettings_shop_idx" ON "SizeChartSettings"("shop");
