import { Request, Response, NextFunction } from 'express';
import { auth } from 'express-openid-connect';

export const authConfig = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET || 'a-long-randomly-generated-string-stored-in-env',
  baseURL: process.env.AUTH0_BASE_URL || 'http://localhost:5001',
  clientID: process.env.AUTH0_CLIENT_ID || 'eMCgaFN2GuusR1v0FNZ3A8jBV1A6jnow',
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL || 'https://boraentregar.us.auth0.com',
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  authorizationParams: {
    response_type: 'code',
    audience: process.env.AUTH0_AUDIENCE,
    scope: 'openid profile email'
  },
  idpLogout: true
};

// Middleware to require authentication
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.oidc?.isAuthenticated()) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'You must be logged in to access this resource'
    });
  }
  next();
};

// Middleware to extract user ID from token
export const extractUserId = (req: Request, _res: Response, next: NextFunction) => {
  if (req.oidc?.isAuthenticated() && req.oidc.user) {
    // Add userId to request object for use in controllers
    (req as any).userId = req.oidc.user.sub;
    (req as any).userEmail = req.oidc.user.email;
  }
  next();
};

// Export auth middleware from express-openid-connect
export { auth };
