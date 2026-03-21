import { initAuth0 } from '@auth0/nextjs-auth0';

// Debug: Log Auth0 configuration (without sensitive data)
console.log('=== Auth0 Configuration Check ===');
console.log('AUTH0_BASE_URL:', process.env.AUTH0_BASE_URL || 'USING_FALLBACK: http://localhost:3000');
console.log('AUTH0_ISSUER_BASE_URL:', process.env.AUTH0_ISSUER_BASE_URL || 'USING_FALLBACK');
console.log('AUTH0_CLIENT_ID:', process.env.AUTH0_CLIENT_ID ? '***' + process.env.AUTH0_CLIENT_ID.slice(-10) : 'USING_FALLBACK');
console.log('AUTH0_CLIENT_SECRET:', process.env.AUTH0_CLIENT_SECRET ? '***' + process.env.AUTH0_CLIENT_SECRET.slice(-10) : 'USING_FALLBACK');
console.log('AUTH0_SECRET:', process.env.AUTH0_SECRET ? '***' + process.env.AUTH0_SECRET.slice(-10) : 'USING_FALLBACK');
console.log('===================================');

export const auth0 = initAuth0({
  baseURL: process.env.AUTH0_BASE_URL || 'http://localhost:3000',
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL || 'https://dev-cfns55eqkszncm62.us.auth0.com',
  clientID: process.env.AUTH0_CLIENT_ID || 'hXW3gRRvNSstCigBDfIdcpLBzQJfUo80',
  clientSecret: process.env.AUTH0_CLIENT_SECRET || '4FvtcTL76fE5TNxzieC_Ogf9rYhkB7mltdW9dtm-GQ_dQ94gwd401MmBAsATyRhR',
  secret: process.env.AUTH0_SECRET || 'dev-secret-dev-secret-dev-secret-dev-secret!!',
});

export const { 
  getSession, 
  handleAuth, 
  handleLogin, 
  handleLogout, 
  handleCallback, 
  handleProfile, 
  withApiAuthRequired, 
  withPageAuthRequired 
} = auth0;
