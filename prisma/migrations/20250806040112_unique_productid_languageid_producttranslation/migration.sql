-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

CREATE UNIQUE INDEX "ProductTranslation_productId_languageId_unique"
   ON "ProductTranslation" ("productId", "languageId")
   WHERE "deletedAt" IS NULL;
