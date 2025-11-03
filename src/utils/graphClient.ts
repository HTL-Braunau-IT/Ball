import { Client } from "@microsoft/microsoft-graph-client";
import { ConfidentialClientApplication } from "@azure/msal-node";
import { env } from "~/env";

let msalApp: ConfidentialClientApplication | null = null;

/**
 * Get MSAL application instance (reused across calls)
 */
function getMsalApp(): ConfidentialClientApplication {
  if (msalApp) {
    return msalApp;
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
 */
export async function getGraphClient(): Promise<Client> {
  const cca = getMsalApp();

  // Get access token (MSAL handles caching internally)
  const clientCredentialRequest = {
    scopes: ["https://graph.microsoft.com/.default"],
  };

  try {
    const response = await cca.acquireTokenByClientCredential(clientCredentialRequest);
    
    if (!response || !response.accessToken) {
      throw new Error("Failed to acquire access token from Microsoft Graph");
    }

    // Create Graph client with a function that fetches a fresh token
    const graphClient = Client.init({
      authProvider: async (done) => {
        try {
          // Get a fresh token (MSAL will use cached token if still valid)
          const tokenResponse = await cca.acquireTokenByClientCredential(clientCredentialRequest);
          if (tokenResponse && tokenResponse.accessToken) {
            done(null, tokenResponse.accessToken);
          } else {
            done(new Error("Failed to acquire access token"), null);
          }
        } catch (error) {
          console.error("Error in authProvider:", error);
          done(error as Error, null);
        }
      },
    });

    return graphClient;
  } catch (error) {
    console.error("Error acquiring Microsoft Graph token:", error);
    throw new Error("Failed to authenticate with Microsoft Graph API");
  }
}

