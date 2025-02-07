let OAuth2Client;

// Import only on the server side
if (typeof window === 'undefined') {
  OAuth2Client = (await import('google-auth-library')).OAuth2Client;
}

// Check if OAuth2Client is defined before creating the client
if (!OAuth2Client) {
  throw new Error("OAuth2Client is not available. Ensure this code is running on the server.");
}

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

export async function getGoogleAuthUrl() {
  const scopes = [
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email"
  ];

  const authUrl = client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  });

  return authUrl;
}

export async function getGoogleUser(code: string) {
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  const { data } = await client.request({
    url: "https://www.googleapis.com/oauth2/v2/userinfo",
  });

  return data;
}

export { client };

// Example of dynamic import
let GoogleAuth;

if (typeof window === 'undefined') {
  GoogleAuth = await import('google-auth-library').then(module => module.GoogleAuth);
  // Use GoogleAuth here
}

