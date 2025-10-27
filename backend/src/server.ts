// Carregar variáveis de ambiente ANTES de qualquer outra importação
import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDatabase } from './config/database';

const PORT = process.env.PORT || 5000;

// Função para iniciar o servidor
const startServer = async () => {
  try {
    // Tentar conectar ao MongoDB
    try {
      await connectDatabase();
    } catch (dbError) {
      console.warn('⚠️  MongoDB não conectado. Servidor rodará sem persistência de dados.');
    }

    // Iniciar servidor mesmo sem MongoDB (útil para desenvolvimento)
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📦 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Acesse: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();