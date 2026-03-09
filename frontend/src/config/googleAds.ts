export const GOOGLE_ADS_CONFIG = {
  clientId: process.env.REACT_APP_GOOGLE_ADS_CLIENT_ID,
  redirectUri: process.env.REACT_APP_GOOGLE_ADS_REDIRECT_URI,

  scopes: [
    'https://www.googleapis.com/auth/adwords',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ],

  endpoints: {
    auth: 'https://accounts.google.com/o/oauth2/v2/auth',
  },
};
