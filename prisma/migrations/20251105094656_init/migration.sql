-- CreateTable
CREATE TABLE "ticketReserves" (
    "id" SERIAL NOT NULL,
    "amount" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT NOT NULL,

    CONSTRAINT "ticketReserves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "soldTickets" (
    "id" SERIAL NOT NULL,
    "delivery" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "paid" BOOLEAN,
    "sent" BOOLEAN,
    "transref" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "buyerId" INTEGER NOT NULL,
    "reserveId" INTEGER NOT NULL,
    "soldPrice" INTEGER NOT NULL,

    CONSTRAINT "soldTickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deliveryMethods" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "surcharge" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT NOT NULL DEFAULT 'System',

    CONSTRAINT "deliveryMethods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Buyers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "postal" INTEGER NOT NULL,
    "province" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL,
    "groupId" INTEGER NOT NULL,

    CONSTRAINT "Buyers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buyerGroups" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "maxTickets" INTEGER NOT NULL DEFAULT 2,

    CONSTRAINT "buyerGroups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backendUsers" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "surName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "groupId" INTEGER,

    CONSTRAINT "backendUsers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backendGroups" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "backendGroups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "_deliveryMethodsToticketReserves" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ticketReservesTobuyerGroups" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Buyers_email_key" ON "Buyers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "backendUsers_email_key" ON "backendUsers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "_deliveryMethodsToticketReserves_AB_unique" ON "_deliveryMethodsToticketReserves"("A", "B");

-- CreateIndex
CREATE INDEX "_deliveryMethodsToticketReserves_B_index" ON "_deliveryMethodsToticketReserves"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ticketReservesTobuyerGroups_AB_unique" ON "_ticketReservesTobuyerGroups"("A", "B");

-- CreateIndex
CREATE INDEX "_ticketReservesTobuyerGroups_B_index" ON "_ticketReservesTobuyerGroups"("B");

-- AddForeignKey
ALTER TABLE "soldTickets" ADD CONSTRAINT "soldTickets_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soldTickets" ADD CONSTRAINT "soldTickets_reserveId_fkey" FOREIGN KEY ("reserveId") REFERENCES "ticketReserves"("id") ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Buyers" ADD CONSTRAINT "Buyers_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "buyerGroups"("id") ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backendUsers" ADD CONSTRAINT "backendUsers_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "backendGroups"("id") ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_deliveryMethodsToticketReserves" ADD CONSTRAINT "_deliveryMethodsToticketReserves_A_fkey" FOREIGN KEY ("A") REFERENCES "deliveryMethods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_deliveryMethodsToticketReserves" ADD CONSTRAINT "_deliveryMethodsToticketReserves_B_fkey" FOREIGN KEY ("B") REFERENCES "ticketReserves"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ticketReservesTobuyerGroups" ADD CONSTRAINT "_ticketReservesTobuyerGroups_A_fkey" FOREIGN KEY ("A") REFERENCES "buyerGroups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ticketReservesTobuyerGroups" ADD CONSTRAINT "_ticketReservesTobuyerGroups_B_fkey" FOREIGN KEY ("B") REFERENCES "ticketReserves"("id") ON DELETE CASCADE ON UPDATE CASCADE;

