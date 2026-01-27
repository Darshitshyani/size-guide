-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SizeChartSettings" (
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
    "buttonBorderTop" BOOLEAN NOT NULL DEFAULT true,
    "buttonBorderRight" BOOLEAN NOT NULL DEFAULT true,
    "buttonBorderBottom" BOOLEAN NOT NULL DEFAULT true,
    "buttonBorderLeft" BOOLEAN NOT NULL DEFAULT true,
    "tableDesign" TEXT NOT NULL DEFAULT 'classic',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SizeChartSettings" ("buttonAlignment", "buttonBgColor", "buttonBorderColor", "buttonBorderRadius", "buttonBorderStyle", "buttonBorderWidth", "buttonIcon", "buttonPaddingBottom", "buttonPaddingLeft", "buttonPaddingRight", "buttonPaddingTop", "buttonText", "buttonTextColor", "createdAt", "id", "shop", "tableDesign", "updatedAt") SELECT "buttonAlignment", "buttonBgColor", "buttonBorderColor", "buttonBorderRadius", "buttonBorderStyle", "buttonBorderWidth", "buttonIcon", "buttonPaddingBottom", "buttonPaddingLeft", "buttonPaddingRight", "buttonPaddingTop", "buttonText", "buttonTextColor", "createdAt", "id", "shop", "tableDesign", "updatedAt" FROM "SizeChartSettings";
DROP TABLE "SizeChartSettings";
ALTER TABLE "new_SizeChartSettings" RENAME TO "SizeChartSettings";
CREATE UNIQUE INDEX "SizeChartSettings_shop_key" ON "SizeChartSettings"("shop");
CREATE INDEX "SizeChartSettings_shop_idx" ON "SizeChartSettings"("shop");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
