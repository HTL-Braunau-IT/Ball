import { type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "~/server/db";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

// Z - Debug
// console.log("🔧 Email config check:");
// console.log("  EMAIL_SERVER_USER:", process.env.EMAIL_SERVER_USER ? "✅ Set" : "❌ Missing");
// console.log("  EMAIL_SERVER_PASSWORD:", process.env.EMAIL_SERVER_PASSWORD ? "✅ Set" : "❌ Missing");
// console.log("  EMAIL_FROM:", process.env.EMAIL_FROM ? "✅ Set" : "❌ Missing");

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const backendUser = await db.backendUsers.findUnique({
          where: { email: credentials.email },
        });
        if (!backendUser?.passwordHash) return null;
        const passwordOk = await bcrypt.compare(
          credentials.password,
          backendUser.passwordHash,
        );
        if (!passwordOk) return null;
        return {
          id: String(backendUser.id),
          name: backendUser.name,
          email: backendUser.email,
        };
      },
    }),
    EmailProvider({
      server: {
        host: "smtp.office365.com",
        port: 587,
        // secure: false,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      // Z - Debug
      // sendVerificationRequest({url, identifier, provider}) {
      //   console.log("📧 Attempting to send email:");
      //   console.log("  To:", identifier);
      //   console.log("  From:", provider.from);
      //   console.log("  Server:", provider.server);
      //   console.log("  URL:", url);
      // },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
  },
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user && token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
};