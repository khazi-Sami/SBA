-- CreateEnum
CREATE TYPE "QurbaniPaymentStatus" AS ENUM ('PAID', 'PENDING');

-- CreateEnum
CREATE TYPE "QurbaniMeatPreference" AS ENUM ('RECEIVE_MEAT', 'DONATE');

-- CreateTable
CREATE TABLE "QurbaniSubmission" (
    "id" TEXT NOT NULL,
    "participantName" TEXT NOT NULL,
    "fatherName" TEXT NOT NULL,
    "niyyahName" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "shares" INTEGER NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "paymentStatus" "QurbaniPaymentStatus" NOT NULL,
    "meatPreference" "QurbaniMeatPreference" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QurbaniSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QurbaniSubmission_createdAt_idx" ON "QurbaniSubmission"("createdAt");

-- CreateIndex
CREATE INDEX "QurbaniSubmission_paymentStatus_idx" ON "QurbaniSubmission"("paymentStatus");
