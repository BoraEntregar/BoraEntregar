import { useAuth0 } from '@auth0/auth0-react';
import '../styles/LoginPage.css';

export default function LoginPage() {
  const { loginWithRedirect, isLoading } = useAuth0();

  const handleLogin = () => {
    loginWithRedirect();
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>BoraEntregar</h1>
          <p className="login-subtitle">
            Sistema de Otimização de Rotas de Entrega
          </p>
        </div>

        <div className="login-content">
          <div className="login-icon">
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>

          <h2>Bem-vindo!</h2>
          <p className="login-description">
            Faça login para acessar o sistema de processamento e otimização de
            rotas de entrega.
          </p>

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="login-button"
          >
            {isLoading ? 'Carregando...' : 'Entrar com Auth0'}
          </button>

          <div className="login-features">
            <h3>Funcionalidades:</h3>
            <ul>
              <li>Upload e processamento de planilhas Excel</li>
              <li>Agrupamento inteligente de endereços</li>
              <li>Histórico de processamentos</li>
              <li>Exportação de dados otimizados</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
