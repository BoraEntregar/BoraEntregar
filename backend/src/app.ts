import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import excelRoutes from './routes/excel.routes';
import { validateAccessToken, extractUserId, requireAuth } from './middleware/auth';

const app: Application = express();

// Configuração de CORS com múltiplas origens permitidas
const allowedOrigins = (process.env.FRONTEND_URLS || 'http://localhost:5173')
  .split(',')
  .map(url => url.trim())
  .filter(url => url.length > 0);

// Middlewares
app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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
app.get('/api/profile', validateAccessToken, requireAuth, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const userEmail = (req as any).userEmail;
  const auth = (req as any).auth;

  res.status(200).json({
    success: true,
    profile: {
      userId,
      email: userEmail,
      sub: auth?.payload?.sub,
      permissions: auth?.payload?.permissions || []
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