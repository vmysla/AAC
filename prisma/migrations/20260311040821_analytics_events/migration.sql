-- CreateTable
CREATE TABLE "ButtonPressEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "pressedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "buttonLabel" TEXT NOT NULL,
    "buttonRow" INTEGER NOT NULL,
    "buttonCol" INTEGER NOT NULL,
    CONSTRAINT "ButtonPressEvent_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "ChildProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FirstThenEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "thenItem" TEXT NOT NULL,
    "firstMode" TEXT NOT NULL,
    "firstItem" TEXT,
    CONSTRAINT "FirstThenEvent_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "ChildProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ButtonPressEvent_profileId_pressedAt_idx" ON "ButtonPressEvent"("profileId", "pressedAt");
