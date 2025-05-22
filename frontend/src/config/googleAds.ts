export const GOOGLE_ADS_CONFIG = {
  // OAuth 2.0 configuration
  clientId: process.env.REACT_APP_GOOGLE_ADS_CLIENT_ID,
  clientSecret: process.env.REACT_APP_GOOGLE_ADS_CLIENT_SECRET,
  redirectUri: process.env.REACT_APP_GOOGLE_ADS_REDIRECT_URI,
  
  // API configuration
  developerToken: process.env.REACT_APP_GOOGLE_ADS_DEVELOPER_TOKEN,
  
  // Scopes required for Google Ads API
  scopes: [
    'https://www.googleapis.com/auth/adwords',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ],
  
  // API endpoints
  endpoints: {
    auth: 'https://accounts.google.com/o/oauth2/v2/auth',
    token: 'https://oauth2.googleapis.com/token',
    ads: 'https://googleads.googleapis.com/v14/customers'
  }
}; 