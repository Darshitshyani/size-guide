-- CreateTable
CREATE TABLE "ProductTemplateAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductTemplateAssignment_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ProductTemplateAssignment_shop_idx" ON "ProductTemplateAssignment"("shop");

-- CreateIndex
CREATE INDEX "ProductTemplateAssignment_templateId_idx" ON "ProductTemplateAssignment"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductTemplateAssignment_shop_productId_key" ON "ProductTemplateAssignment"("shop", "productId");
