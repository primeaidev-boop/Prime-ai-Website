-- CreateTable
CREATE TABLE "tutorial_leads" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "userType" TEXT NOT NULL,
    "tutorialAccessed" TEXT NOT NULL,
    "sourcePage" TEXT NOT NULL,
    "tutorialsViewedCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tutorial_leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tutorial_leads_mobile_key" ON "tutorial_leads"("mobile");
