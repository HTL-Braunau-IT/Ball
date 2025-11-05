import { Client } from "@microsoft/microsoft-graph-client";
import { ConfidentialClientApplication } from "@azure/msal-node";
import { env } from "~/env";

let msalApp: ConfidentialClientApplication | null = null;

/**
 * Get MSAL application instance (reused across calls)
 * Only initializes at runtime, not during build
 */
function getMsalApp(): ConfidentialClientApplication {
  if (msalApp) {
    return msalApp;
  }

  // Validate required environment variables
  if (!env.CLIENT_ID || !env.TENANT_ID || !env.APP_SECRET) {
    throw new Error("Microsoft Graph API credentials are not configured. Please set CLIENT_ID, TENANT_ID, and APP_SECRET environment variables.");
  }

  const msalConfig = {
    auth: {
      clientId: env.CLIENT_ID,
      authority: `https://login.microsoftonline.com/${env.TENANT_ID}`,
      clientSecret: env.APP_SECRET,
    },
  };

  msalApp = new ConfidentialClientApplication(msalConfig);
  return msalApp;
}

/**
 * Get an authenticated Microsoft Graph client using client credentials flow
 * The token is fetched fresh on each call to handle expiration
 * This function should only be called at runtime, not during build
 */
export async function getGraphClient(): Promise<Client> {
  // Prevent initialization during build time
  if (process.env.NEXT_PHASE === "phase-production-build" || 
      process.env.NEXT_PHASE === "phase-development-build") {
    throw new Error("Graph client cannot be initialized during build time. This function should only be called at runtime.");
  }

  // Validate environment variables are available
  if (!env.CLIENT_ID || !env.TENANT_ID || !env.APP_SECRET) {
    throw new Error("Microsoft Graph API credentials are not configured. Please set CLIENT_ID, TENANT_ID, and APP_SECRET environment variables.");
  }

  const cca = getMsalApp();

  // Get access token (MSAL handles caching internally)
  const clientCredentialRequest = {
    scopes: ["https://graph.microsoft.com/.default"],
  };

  try {
    const response = await cca.acquireTokenByClientCredential(clientCredentialRequest);
    
    if (!response?.accessToken) {
      throw new Error("Failed to acquire access token from Microsoft Graph");
    }

    // Create Graph client with a function that fetches a fresh token
    const graphClient = Client.init({
      authProvider: (done) => {
        void (async () => {
          try {
            // Get a fresh token (MSAL will use cached token if still valid)
            const tokenResponse = await cca.acquireTokenByClientCredential(clientCredentialRequest);
            if (tokenResponse?.accessToken) {
              done(null, tokenResponse.accessToken);
            } else {
              done(new Error("Failed to acquire access token"), null);
            }
          } catch (error) {
            console.error("Error in authProvider:", error);
            done(error as Error, null);
          }
        })();
      },
    });

    return graphClient;
  } catch (error) {
    console.error("Error acquiring Microsoft Graph token:", error);
    throw new Error("Failed to authenticate with Microsoft Graph API");
  }
}

