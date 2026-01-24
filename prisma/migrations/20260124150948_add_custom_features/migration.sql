-- CreateTable
CREATE TABLE "TailorTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "clothingType" TEXT NOT NULL,
    "fields" TEXT NOT NULL,
    "fitPreferences" TEXT,
    "collarOptions" TEXT,
    "enableStitchingNotes" BOOLEAN NOT NULL DEFAULT false,
    "customFeatures" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TailorTemplateAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TailorTemplateAssignment_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "TailorTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "TailorTemplate_shop_idx" ON "TailorTemplate"("shop");

-- CreateIndex
CREATE INDEX "TailorTemplateAssignment_shop_idx" ON "TailorTemplateAssignment"("shop");

-- CreateIndex
CREATE INDEX "TailorTemplateAssignment_templateId_idx" ON "TailorTemplateAssignment"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "TailorTemplateAssignment_shop_productId_key" ON "TailorTemplateAssignment"("shop", "productId");
