import { Request, Response, NextFunction } from 'express';
import { auth as jwtCheck } from 'express-oauth2-jwt-bearer';

// Configuração do JWT validator
export const validateAccessToken = jwtCheck({
  audience: process.env.AUTH0_AUDIENCE || 'https://api.boraentregar.com.br',
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL || 'https://boraentregar.us.auth0.com',
  tokenSigningAlg: 'RS256'
});

// Middleware to require authentication
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.auth) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'You must be logged in to access this resource'
    });
  }
  next();
};

// Middleware to extract user ID from token
export const extractUserId = (req: Request, _res: Response, next: NextFunction) => {
  if (req.auth) {
    (req as any).userId = req.auth.payload.sub;
    (req as any).userEmail = req.auth.payload.email;
  }
  next();
};
