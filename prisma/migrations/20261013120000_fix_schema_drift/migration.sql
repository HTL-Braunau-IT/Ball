-- Brings databases created from the migration history in line with schema.prisma.
-- The init migration created the buyerGroups <-> ticketReserves join table as
-- "_ticketReservesTobuyerGroups", while Prisma Client queries "_buyerGroupsToticketReserves".
-- Every step is conditional, so this is also safe on databases that were set up
-- with `prisma db push` and already have the expected shape. No rows are dropped.

-- 1. buyerGroups <-> ticketReserves join table: rename and keep its data
DO $$
BEGIN
  IF to_regclass('public."_ticketReservesTobuyerGroups"') IS NOT NULL
     AND to_regclass('public."_buyerGroupsToticketReserves"') IS NULL THEN
    ALTER TABLE "_ticketReservesTobuyerGroups" RENAME TO "_buyerGroupsToticketReserves";
    ALTER TABLE "_buyerGroupsToticketReserves" RENAME CONSTRAINT "_ticketReservesTobuyerGroups_A_fkey" TO "_buyerGroupsToticketReserves_A_fkey";
    ALTER TABLE "_buyerGroupsToticketReserves" RENAME CONSTRAINT "_ticketReservesTobuyerGroups_B_fkey" TO "_buyerGroupsToticketReserves_B_fkey";
    ALTER INDEX "_ticketReservesTobuyerGroups_B_index" RENAME TO "_buyerGroupsToticketReserves_B_index";
    DROP INDEX "_ticketReservesTobuyerGroups_AB_unique";
    ALTER TABLE "_buyerGroupsToticketReserves" ADD CONSTRAINT "_buyerGroupsToticketReserves_AB_pkey" PRIMARY KEY ("A", "B");
  END IF;
END $$;

-- 2. deliveryMethods <-> ticketReserves join table: unique index -> primary key (Prisma 6 layout)
DO $$
BEGIN
  IF to_regclass('public."_deliveryMethodsToticketReserves_AB_unique"') IS NOT NULL THEN
    DROP INDEX "_deliveryMethodsToticketReserves_AB_unique";
    ALTER TABLE "_deliveryMethodsToticketReserves" ADD CONSTRAINT "_deliveryMethodsToticketReserves_AB_pkey" PRIMARY KEY ("A", "B");
  END IF;
END $$;

-- 3. Foreign keys with the ON DELETE behaviour declared in schema.prisma
ALTER TABLE "soldTickets" DROP CONSTRAINT IF EXISTS "soldTickets_reserveId_fkey";
ALTER TABLE "soldTickets" ADD CONSTRAINT "soldTickets_reserveId_fkey" FOREIGN KEY ("reserveId") REFERENCES "ticketReserves"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Buyers" DROP CONSTRAINT IF EXISTS "Buyers_groupId_fkey";
ALTER TABLE "Buyers" ADD CONSTRAINT "Buyers_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "buyerGroups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "backendUsers" DROP CONSTRAINT IF EXISTS "backendUsers_groupId_fkey";
ALTER TABLE "backendUsers" ADD CONSTRAINT "backendUsers_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "backendGroups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
