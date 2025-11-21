-- CreateTable
CREATE TABLE "systemSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "salesEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT NOT NULL DEFAULT 'System',

    CONSTRAINT "systemSettings_pkey" PRIMARY KEY ("id")
);

