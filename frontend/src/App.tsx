import { useState, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import ResultsPage from './pages/ResultsPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import Header from './components/Header';
import { createAuthenticatedApi } from './services/apiAuth';
import { useApiHealth, useProcessedData } from './hooks';
import { VIEWS, APP_NAME, APP_VERSION, APP_DESCRIPTION, MESSAGES } from './constants';
import type { ViewType } from './constants';
import './App.css';

function App() {
  const { isAuthenticated, isLoading: authLoading, getAccessTokenSilently, loginWithPopup } = useAuth0();
  const [currentView, setCurrentView] = useState<ViewType>(VIEWS.HOME);
  const { processedData, updateProcessedData, clearProcessedData, hasData } = useProcessedData();
  const [loading, setLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Criar instância autenticada da API
  const excelService = useMemo(
    () => createAuthenticatedApi(getAccessTokenSilently),
    [getAccessTokenSilently]
  );

  // Verificar saúde da API ao iniciar
  useApiHealth();

  // Handler para login com popup
  const handleLogin = async () => {
    try {
      setLoginLoading(true);
      await loginWithPopup();
      toast.success('Login realizado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      if (error instanceof Error && !error.message.includes('popup_closed_by_user')) {
        toast.error('Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleUploadSuccess = (data: typeof processedData) => {
    if (data) {
      updateProcessedData(data);
      setCurrentView(VIEWS.RESULTS);
    }
  };

  const handleViewDetails = async (id: string) => {
    setLoading(true);
    try {
      const response = await excelService.getById(id);
      if (response.success && response.data) {
        const tableData = {
          _id: response.data._id,
          routeName: response.data.routeName,
          originalFileName: response.data.originalFileName,
          totalRows: response.data.totalRows,
          groupedRows: response.data.groupedRows,
          data: response.data.data,
          processedAt: response.data.processedAt,
        };
        updateProcessedData(tableData);
        setCurrentView(VIEWS.RESULTS);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : MESSAGES.ERROR.LOAD_DETAILS_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleNewUpload = async () => {
    if (!isAuthenticated) {
      toast('Você precisa fazer login para fazer upload', { icon: '🔒' });
      await handleLogin();
      return;
    }
    clearProcessedData();
    setCurrentView(VIEWS.UPLOAD);
  };

  const handleProtectedNavigation = async (view: ViewType) => {
    // Views que requerem autenticação
    const protectedViews: ViewType[] = ['upload', 'history', 'profile', 'results'];

    if (protectedViews.includes(view) && !isAuthenticated) {
      toast('Faça login para continuar', { icon: '🔒' });
      await handleLogin();
      return;
    }

    setCurrentView(view);
  };

  // Mostrar loading enquanto verifica autenticação
  if (authLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '1.2rem',
        color: '#667eea'
      }}>
        Carregando...
      </div>
    );
  }

  return (
    <div className="app">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#1f2937',
            border: '1px solid #e5e7eb',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#2563eb',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Header - mostra informações do usuário se estiver logado */}
      {isAuthenticated && <Header onProfileClick={() => handleProtectedNavigation(VIEWS.PROFILE)} />}

      {/* Navigation */}
      <nav className="app-nav">
        <div className="nav-content">
          <button
            className={`nav-btn ${currentView === VIEWS.HOME ? 'active' : ''}`}
            onClick={() => setCurrentView(VIEWS.HOME)}
          >
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Início
          </button>

          <button
            className={`nav-btn ${currentView === VIEWS.UPLOAD ? 'active' : ''}`}
            onClick={handleNewUpload}
          >
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload
          </button>

          {isAuthenticated && hasData && (
            <button
              className={`nav-btn ${currentView === VIEWS.RESULTS ? 'active' : ''}`}
              onClick={() => handleProtectedNavigation(VIEWS.RESULTS)}
            >
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Resultados
            </button>
          )}

          <button
            className={`nav-btn ${currentView === VIEWS.HISTORY ? 'active' : ''}`}
            onClick={() => handleProtectedNavigation(VIEWS.HISTORY)}
          >
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Histórico
          </button>

          {!isAuthenticated && (
            <button
              className="nav-btn"
              onClick={handleLogin}
              disabled={loginLoading}
            >
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              {loginLoading ? 'Carregando...' : 'Login'}
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="app-main">
        {loading && (
          <div className="loading-overlay">
            <span className="spinner large"></span>
            <p>Carregando...</p>
          </div>
        )}

        {!loading && currentView === VIEWS.HOME && (
          <HomePage onGetStarted={handleNewUpload} />
        )}

        {!loading && currentView === VIEWS.UPLOAD && isAuthenticated && (
          <UploadPage onSuccess={handleUploadSuccess} />
        )}

        {!loading && currentView === VIEWS.RESULTS && processedData && isAuthenticated && (
          <ResultsPage data={processedData} />
        )}

        {!loading && currentView === VIEWS.HISTORY && isAuthenticated && (
          <HistoryPage onViewDetails={handleViewDetails} />
        )}

        {!loading && currentView === VIEWS.PROFILE && isAuthenticated && (
          <ProfilePage />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>{APP_NAME} - {APP_DESCRIPTION}</p>
        <p className="version">{APP_VERSION}</p>
      </footer>
    </div>
  );
}

export default App;
