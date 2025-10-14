import Link from "next/link";

import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Ball <span className="text-[hsl(280,100%,70%)]">Tickets</span>
          </h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href="/buyer"
            >
              <h3 className="text-2xl font-bold">Buy Tickets →</h3>
              <div className="text-lg">
                Purchase tickets for the ball event.
              </div>
            </Link>
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href="/auth/signin"
            >
              <h3 className="text-2xl font-bold">Admin Login →</h3>
              <div className="text-lg">
                Access the admin panel to manage tickets.
              </div>
            </Link>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
