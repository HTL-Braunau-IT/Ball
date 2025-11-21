import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    // Make these optional during build - they're required at runtime
    DATABASE_URL: z.string().optional(),
    NEXTAUTH_URL: z.string().optional(),
    NEXTAUTH_SECRET: z.string().optional(),
    EMAIL_FROM: z.string().optional(),
    // Microsoft Graph API Configuration
    // Optional during build, but required at runtime
    CLIENT_ID: z.string().optional(),
    TENANT_ID: z.string().optional(),
    APP_SECRET: z.string().optional(),
    STRIPE_SECRET_KEY: z.string().optional(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_TICKET_SALE_DATE: z.string().optional(),
    NEXT_PUBLIC_PICKUP_DATE_1: z.string().optional(),
    NEXT_PUBLIC_PICKUP_DATE_1_START_TIME: z.string().optional(),
    NEXT_PUBLIC_PICKUP_DATE_1_END_TIME: z.string().optional(),
    NEXT_PUBLIC_PICKUP_DATE_2: z.string().optional(),
    NEXT_PUBLIC_PICKUP_DATE_2_START_TIME: z.string().optional(),
    NEXT_PUBLIC_PICKUP_DATE_2_END_TIME: z.string().optional(),
    // Optional during build - required at runtime
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    EMAIL_FROM: process.env.EMAIL_FROM,
    CLIENT_ID: process.env.CLIENT_ID,
    TENANT_ID: process.env.TENANT_ID,
    APP_SECRET: process.env.APP_SECRET,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_TICKET_SALE_DATE: process.env.NEXT_PUBLIC_TICKET_SALE_DATE,
    NEXT_PUBLIC_PICKUP_DATE_1: process.env.NEXT_PUBLIC_PICKUP_DATE_1,
    NEXT_PUBLIC_PICKUP_DATE_1_START_TIME: process.env.NEXT_PUBLIC_PICKUP_DATE_1_START_TIME,
    NEXT_PUBLIC_PICKUP_DATE_1_END_TIME: process.env.NEXT_PUBLIC_PICKUP_DATE_1_END_TIME,
    NEXT_PUBLIC_PICKUP_DATE_2: process.env.NEXT_PUBLIC_PICKUP_DATE_2,
    NEXT_PUBLIC_PICKUP_DATE_2_START_TIME: process.env.NEXT_PUBLIC_PICKUP_DATE_2_START_TIME,
    NEXT_PUBLIC_PICKUP_DATE_2_END_TIME: process.env.NEXT_PUBLIC_PICKUP_DATE_2_END_TIME,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
