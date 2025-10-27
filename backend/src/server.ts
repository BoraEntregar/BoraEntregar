import app from './app';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';

// Carregar variáveis de ambiente
dotenv.config();

const PORT = process.env.PORT || 5000;

// Função para iniciar o servidor
const startServer = async () => {
  try {
    // Tentar conectar ao MongoDB
    try {
      await connectDatabase();
    } catch (dbError) {
      console.warn('⚠️  MongoDB não conectado. Servidor rodará sem persistência de dados.');
      console.warn('⚠️  Para habilitar o banco, configure o MongoDB Atlas ou instale MongoDB local.');
      console.warn('⚠️  Veja instruções em: README.md');
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