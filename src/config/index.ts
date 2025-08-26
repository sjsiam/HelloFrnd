export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  oauth2: {
    clientId: process.env.NEXT_PUBLIC_CLIENT_ID || "",
    clientSecret: process.env.CLIENT_SECRET || "",
    authUrl: process.env.NEXT_PUBLIC_AUTHORIZE_URL || "",
    tokenUrl: process.env.NEXT_PUBLIC_TOKEN_URL || "",
    redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI || "",
    logoutUrl: process.env.NEXT_PUBLIC_LOGOUT_URL || "",
    authApiUrl: process.env.FILEION_AUTH_API_URL || "",
  },
  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
  },
};
