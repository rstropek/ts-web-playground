import * as msal from "@azure/msal-node";
import graph from "@microsoft/microsoft-graph-client";

function getAuthenticatedClient(msalClient: msal.ConfidentialClientApplication, userId: string) {
  if (!msalClient || !userId) {
    throw new Error(`Invalid MSAL state. Client: ${msalClient ? "present" : "missing"}, User ID: ${userId ? "present" : "missing"}`);
  }

  // Initialize Graph client
  const client = graph.Client.init({
    // Implement an auth provider that gets a token
    // from the app's MSAL instance
    authProvider: async (done) => {
      try {
        // Get the user's account
        const account = await msalClient.getTokenCache().getAccountByHomeId(userId);

        if (account) {
          // Attempt to get the token silently
          // This method uses the token cache and
          // refreshes expired tokens as needed
          const scopes = ["user.read"];
          const response = await msalClient.acquireTokenSilent({
            scopes: scopes,
            redirectUri: process.env.OAUTH_REDIRECT_URI,
            account: account,
          });

          // First param to callback is the error,
          // Set to null in success case
          done(null, response.accessToken);
        }
      } catch (err) {
        console.log(JSON.stringify(err, Object.getOwnPropertyNames(err)));
        done(err, null);
      }
    },
  });

  return client;
}

export async function getUserDetails(msalClient: msal.ConfidentialClientApplication, userId: string) {
  const client = getAuthenticatedClient(msalClient, userId);

  const user = await client.api("/me").select("givenName,surname,displayName,mail,userPrincipalName,otherMails").get();
  return user;
}
