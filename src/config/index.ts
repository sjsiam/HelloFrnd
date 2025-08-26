export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  oauth2: {
    clientId: process.env.OAUTH2_CLIENT_ID || "",
    clientSecret: process.env.OAUTH2_CLIENT_SECRET || "",
    authUrl: process.env.OAUTH2_AUTH_URL || "",
    tokenUrl: process.env.OAUTH2_TOKEN_URL || "",
    redirectUrl: process.env.OAUTH2_REDIRECT_URL || "",
    logoutUrl: process.env.OAUTH2_LOGOUT_URL || "",
  },
  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
  },
};
