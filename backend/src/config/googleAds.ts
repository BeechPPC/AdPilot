export const GOOGLE_ADS_CONFIG = {
  get clientId() { return process.env.GOOGLE_ADS_CLIENT_ID!; },
  get clientSecret() { return process.env.GOOGLE_ADS_CLIENT_SECRET!; },
  get developerToken() { return process.env.GOOGLE_ADS_DEVELOPER_TOKEN!; },
  get redirectUri() { return process.env.GOOGLE_ADS_REDIRECT_URI!; },

  scopes: [
    'https://www.googleapis.com/auth/adwords',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ],

  endpoints: {
    auth: 'https://accounts.google.com/o/oauth2/v2/auth',
    token: 'https://oauth2.googleapis.com/token',
    ads: 'https://googleads.googleapis.com/v23/customers',
  },
};
