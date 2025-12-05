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

declare module "next-auth/jwt" {
  interface JWT {
    provider?: string;
    groupName?: string | null;
  }
}


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
          include: { group: true },
        });
        if (!backendUser?.passwordHash) return null;
        const passwordOk = await bcrypt.compare(
          credentials.password,
          backendUser.passwordHash,
        );
        if (!passwordOk) return null;
        return {
          id: String(backendUser.id),
          name: backendUser.firstName + " " + backendUser.surName,
          email: backendUser.email,
          groupName: backendUser.group?.name ?? null,
        };
      },
    }),
    EmailProvider({
      server: {},
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ url, identifier, provider }) {
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const logoUrl = `${baseUrl}/logos/HTL-Ball-2026_Logo_Farbe_transparent.png`;
        
        // Professional email with nice button and elaborate text
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f6f3;">
            <div style="background: transparent; color: #c17a3a; padding: 25px; margin-bottom: 20px; text-align: center;">
              <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="vertical-align: middle; text-align: center; padding-right: 20px;">
                    <img src="${logoUrl}" alt="HTL Ball 2026 Logo" style="max-width: 120px; height: auto; display: block;" />
                  </td>
                  <td style="vertical-align: middle; width: 1px; background-color: #c17a3a; padding: 0;">
                    <div style="width: 1px; height: 80px; background-color: #c17a3a;"></div>
                  </td>
                  <td style="vertical-align: middle; text-align: left; padding-left: 20px;">
                    <h1 style="margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 2px; color: #c17a3a;">HTL BRAUNAU</h1>
                    <p style="margin: 8px 0 0 0; font-size: 16px; font-weight: 600; letter-spacing: 1px; color: #c17a3a;">Ball der Auserwählten 2026</p>
                  </td>
                </tr>
              </table>
            </div>
            
            <div style="background: white; padding: 20px 35px 35px 35px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
              <p style="margin-bottom: 20px; line-height: 1.6; color: #444; font-size: 16px;">
                Sehr geehrte Damen und Herren,
              </p>
              
              <p style="margin-bottom: 20px; line-height: 1.6; color: #444; font-size: 16px;">
                wir freuen uns sehr über Ihr Interesse am <strong style="color: #c17a3a;">HTL Ball 2026 - Ball der Auserwählten</strong>. 
                Dieser elegante Abend im Zeichen von DUNE verspricht ein unvergessliches Erlebnis voller Magie und Eleganz.
              </p>
              
              <p style="margin-bottom: 25px; line-height: 1.6; color: #444; font-size: 16px;">
                Um Ihre Anmeldung abzuschließen und Zugang zu unserem exklusiven Kartenverkauf zu erhalten, 
                klicken Sie bitte auf den untenstehenden Button:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${url}" style="background: transparent; color: #8b4513; padding: 16px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 700; font-size: 16px; letter-spacing: 1px; text-transform: uppercase; box-shadow: 0 4px 12px rgba(193, 122, 58, 0.2); border: 2px solid #8b4513;">
                  Jetzt anmelden
                </a>
              </div>
              
              <div style="margin-top: 30px; padding: 20px; background: #f9f9f9; border-radius: 6px; border-left: 4px solid #c17a3a; font-size: 14px;">
                <p style="margin: 0 0 12px 0; font-weight: 600; color: #333;"><strong>Falls der Button nicht funktioniert:</strong></p>
                <p style="margin: 0; word-break: break-all; color: #666;">
                  Kopieren Sie diesen Link in Ihren Browser:<br>
                  <a href="${url}" style="color: #c17a3a; text-decoration: underline;">${url}</a>
                </p>
              </div>
              
              <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">
                  <strong>Wichtiger Hinweis:</strong> Dieser Anmeldungslink ist 24 Stunden gültig und kann nur einmal verwendet werden.
                </p>
                <p style="margin: 0; font-size: 14px; color: #666;">
                  Bei Fragen oder Problemen wenden Sie sich gerne an uns:<br>
                  <a href="mailto:ballkomitee@htl-braunau.at" style="color: #c17a3a; text-decoration: none;">ballkomitee@htl-braunau.at</a>
                </p>
              </div>
              
              <p style="margin-top: 20px; font-size: 13px; color: #999; text-align: center; font-style: italic;">
                Wir freuen uns auf einen magischen Abend mit Ihnen!<br>
                Ihr HTL Braunau Team
              </p>
            </div>
          </div>
        `;

        try {
          const { getGraphClient } = await import("~/utils/graphClient");
          
          // Extract email address from EMAIL_FROM string
          const fromString = provider.from;
          const angleBracketMatch = /<([^>]+)>/.exec(fromString);
          const emailMatch = angleBracketMatch || /([\w\.-]+@[\w\.-]+\.\w+)/.exec(fromString);
          const fromEmail = emailMatch?.[1] ?? fromString;

          const graphClient = await getGraphClient();
          
          await graphClient.api(`/users/${fromEmail}/sendMail`).post({
            message: {
              subject: "HTL Ball 2026 - Anmeldung für den Ball der Auserwählten",
              body: {
                contentType: 'HTML',
                content: html,
              },
              toRecipients: [
                {
                  emailAddress: {
                    address: identifier,
                  },
                },
              ],
            },
          });
        } catch (error) {
          console.error("❌ Email sending failed:", error);
          throw error;
        }
      },
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
    jwt: async ({ user, token, account }) => {
      if (user) {
        token.uid = user.id;
        // Store groupName from user object (set in authorize callback for credentials provider)
        // NextAuth allows additional properties in user object from authorize
        const userWithGroup = user as typeof user & { groupName?: string | null };
        if (userWithGroup.groupName !== undefined) {
          token.groupName = userWithGroup.groupName;
        }
      }
      // Store provider type in token
      // For CredentialsProvider, account is null, so we set it explicitly
      if (account) {
        // EmailProvider creates an account, so account.provider will be "email"
        token.provider = account.provider;
      } else if (user) {
        // If account is null but user exists, it's credentials provider
        // (CredentialsProvider doesn't create account records)
        token.provider = "credentials";
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
};