-- CreateIndex
CREATE INDEX "Role_deletedAt_idx" ON "Role"("deletedAt");

CREATE UNIQUE INDEX "Role_name_unique"
   ON "Role" (name)
   WHERE "deletedAt" IS NULL;
