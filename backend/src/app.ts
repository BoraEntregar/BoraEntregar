import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import excelRoutes from './routes/excel.routes';

const app: Application = express();

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rota de health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'BoraEntregar API está funcionando!',
    timestamp: new Date().toISOString()
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