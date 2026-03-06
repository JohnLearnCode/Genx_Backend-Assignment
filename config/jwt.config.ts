export const jwtConfig = {
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || 'your-access-token-secret',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'your-refresh-token-secret',
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
};
