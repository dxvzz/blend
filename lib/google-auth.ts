import { OAuth2Client } from "google-auth-library"

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
)

export async function getGoogleAuthUrl() {
  const scopes = ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"]

  const authUrl = client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  })

  return authUrl
}

export async function getGoogleUser(code: string) {
  const { tokens } = await client.getToken(code)
  client.setCredentials(tokens)

  const { data } = await client.request({
    url: "https://www.googleapis.com/oauth2/v2/userinfo",
  })

  return data
}

export { client }

