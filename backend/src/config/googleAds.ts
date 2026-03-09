export const GOOGLE_ADS_CONFIG = {
  clientId: process.env.GOOGLE_ADS_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
  developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
  redirectUri: process.env.GOOGLE_ADS_REDIRECT_URI!,

  scopes: [
    'https://www.googleapis.com/auth/adwords',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ],

  endpoints: {
    auth: 'https://accounts.google.com/o/oauth2/v2/auth',
    token: 'https://oauth2.googleapis.com/token',
    ads: 'https://googleads.googleapis.com/v23.1/customers',
  },
};
