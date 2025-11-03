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
          name: backendUser.firstName + " " + backendUser.surName,
          email: backendUser.email,
        };
      },
    }),
    EmailProvider({
      server: {},
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ url, identifier, provider }) {
        
        // Professional email with nice button and elaborate text
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f6f3;">
            <div style="background: transparent; color: #c17a3a; padding: 25px; text-align: center; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 2px;">HTL BRAUNAU</h1>
              <p style="margin: 8px 0 0 0; font-size: 16px; font-weight: 600; letter-spacing: 1px;">Ball der Auserwählten 2026</p>
            </div>
            
            <div style="background: white; padding: 35px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
              <h2 style="color: #c17a3a; margin-bottom: 25px; font-size: 22px; font-weight: 400;">Willkommen zum Ball der Auserwählten</h2>
              
              <p style="margin-bottom: 20px; line-height: 1.6; color: #444; font-size: 16px;">
                Sehr geehrte Damen und Herren,
              </p>
              
              <p style="margin-bottom: 20px; line-height: 1.6; color: #444; font-size: 16px;">
                wir freuen uns sehr über Ihr Interesse am <strong style="color: #c17a3a;">HTL Ball 2026 - Ball der Auserwählten</strong>. 
                Dieser elegante Abend im Zeichen von DUNE verspricht ein unvergessliches Erlebnis voller Magie und Eleganz.
              </p>
              
              <p style="margin-bottom: 25px; line-height: 1.6; color: #444; font-size: 16px;">
                Um Ihre Anmeldung abzuschließen und Zugang zu unserem exklusiven Ticketverkauf zu erhalten, 
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
                  <strong>Wichtiger Hinweis:</strong> Dieser Anmeldungslink ist 24 Stunden gültig.
                </p>
                <p style="margin: 0; font-size: 14px; color: #666;">
                  Bei Fragen oder Problemen wenden Sie sich gerne an uns:<br>
                  <a href="mailto:ball@htl-braunau.at" style="color: #c17a3a; text-decoration: none;">ball@htl-braunau.at</a>
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