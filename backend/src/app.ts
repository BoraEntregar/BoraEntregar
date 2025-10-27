import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import excelRoutes from './routes/excel.routes';
import { auth, authConfig, extractUserId, requireAuth } from './middleware/auth';

const app: Application = express();

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Auth0 middleware - attaches /login, /logout, and /callback routes
app.use(auth(authConfig));

// Extract user ID from authenticated requests
app.use(extractUserId);

// Rota de health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'BoraEntregar API está funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rota de perfil do usuário (protegida)
app.get('/api/profile', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).oidc?.user;
  const userId = (req as any).userId;
  const userEmail = (req as any).userEmail;

  res.status(200).json({
    success: true,
    profile: {
      userId,
      email: userEmail,
      name: user?.name,
      picture: user?.picture,
      nickname: user?.nickname,
      updatedAt: user?.updated_at,
      sub: user?.sub
    }
  });
});

// Rotas
app.use('/api/excel', excelRoutes);

// Rota 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.path 
  });
});

export default app;