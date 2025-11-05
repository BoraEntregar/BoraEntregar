import { useState, useMemo, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import ResultsPage from './pages/ResultsPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import { createAuthenticatedApi } from './services/apiAuth';
import { useApiHealth, useProcessedData } from './hooks';
import { VIEWS, APP_NAME, APP_VERSION, APP_DESCRIPTION, MESSAGES } from './constants';
import type { ViewType } from './constants';
import './App.css';

function App() {
  const { isAuthenticated, isLoading: authLoading, getAccessTokenSilently, loginWithPopup, user, logout } = useAuth0();
  const [currentView, setCurrentView] = useState<ViewType>(VIEWS.HOME);
  const { processedData, updateProcessedData, clearProcessedData, hasData } = useProcessedData();
  const [loading, setLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Criar instância autenticada da API
  const excelService = useMemo(
    () => createAuthenticatedApi(getAccessTokenSilently),
    [getAccessTokenSilently]
  );

  // Verificar saúde da API ao iniciar
  useApiHealth();

  // Após login bem-sucedido, navegar para a view pendente
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      const pendingNavigation = sessionStorage.getItem('pendingNavigation');
      if (pendingNavigation) {
        sessionStorage.removeItem('pendingNavigation');
        setCurrentView(pendingNavigation as ViewType);
        if (pendingNavigation === VIEWS.UPLOAD) {
          clearProcessedData();
        }
      }
    }
  }, [isAuthenticated, authLoading]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

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

  const handleNewUpload = () => {
    if (!isAuthenticated) {
      toast('Você precisa fazer login para fazer upload', { icon: '🔒' });
      // Armazena a intenção de navegação antes do login
      sessionStorage.setItem('pendingNavigation', VIEWS.UPLOAD);
      handleLogin();
      return;
    }
    clearProcessedData();
    setCurrentView(VIEWS.UPLOAD);
  };

  const handleProtectedNavigation = (view: ViewType) => {
    // Views que requerem autenticação
    const protectedViews: ViewType[] = ['upload', 'history', 'profile', 'results'];

    if (protectedViews.includes(view) && !isAuthenticated) {
      toast('Faça login para continuar', { icon: '🔒' });
      // Armazena a intenção de navegação antes do login
      sessionStorage.setItem('pendingNavigation', view);
      handleLogin();
      return;
    }

    setCurrentView(view);
    setMobileMenuOpen(false); // Fecha o menu mobile ao navegar
  };

  const handleMobileNavigation = (view: ViewType) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  // Mostrar loading enquanto verifica autenticação
  if (authLoading) {
    return (
      <div className="auth-loading">
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

      <nav className="app-nav">
        <div className="nav-wrapper">
          <div className="nav-logo">
            <img
              src="/imgs/BoraEntregar.svg"
              alt="BoraEntregar"
              onClick={() => handleMobileNavigation(VIEWS.HOME)}
              className="clickable"
            />
          </div>

          {/* Desktop Navigation */}
          <div className="nav-content desktop-nav">
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
              Otimizar rotas
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
          </div>

          {/* Desktop User Controls */}
          <div className="nav-user desktop-nav">
            {isAuthenticated ? (
              <>
                <button
                  className="user-profile-btn"
                  onClick={() => handleProtectedNavigation(VIEWS.PROFILE)}
                  title="Ver perfil"
                >
                  <div className="user-info-wrapper">
                    <div className="user-details">
                      <span className="user-name">{user?.name || user?.email}</span>
                      <span className="user-email">{user?.email}</span>
                    </div>
                    {user?.picture && (
                      <img
                        src={user.picture}
                        alt={user.name || 'User'}
                        className="user-avatar"
                      />
                    )}
                  </div>
                </button>

                <button
                  onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                  className="logout-button"
                  title="Sair"
                >
                  <svg className="logout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sair</span>
                </button>
              </>
            ) : (
              <button
                className="nav-btn login-btn"
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

          {/* Mobile Hamburger Button */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            title={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
            <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
              {/* Close Button */}
              <button
                className="mobile-menu-close"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Fechar menu"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Mobile User Section */}
              <div className="mobile-menu-user">
                {isAuthenticated && user?.picture && (
                  <img
                    src={user.picture}
                    alt={user.name || 'User'}
                    className="mobile-user-avatar"
                  />
                )}
                <div className="mobile-user-info">
                  {isAuthenticated ? (
                    <>
                      <span className="mobile-user-name">{user?.name || user?.email}</span>
                      <span className="mobile-user-email">{user?.email}</span>
                    </>
                  ) : (
                    <span className="mobile-user-name">Bem-vindo!</span>
                  )}
                </div>
              </div>

              {/* Mobile Navigation Items */}
              <div className="mobile-menu-items">
                <button
                  className={`mobile-menu-item ${currentView === VIEWS.HOME ? 'active' : ''}`}
                  onClick={() => handleMobileNavigation(VIEWS.HOME)}
                >
                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Início</span>
                </button>

                <button
                  className={`mobile-menu-item ${currentView === VIEWS.UPLOAD ? 'active' : ''}`}
                  onClick={() => {
                    handleNewUpload();
                    setMobileMenuOpen(false);
                  }}
                >
                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Otimizar rotas</span>
                </button>

                {isAuthenticated && hasData && (
                  <button
                    className={`mobile-menu-item ${currentView === VIEWS.RESULTS ? 'active' : ''}`}
                    onClick={() => handleProtectedNavigation(VIEWS.RESULTS)}
                  >
                    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Resultados</span>
                  </button>
                )}

                <button
                  className={`mobile-menu-item ${currentView === VIEWS.HISTORY ? 'active' : ''}`}
                  onClick={() => handleProtectedNavigation(VIEWS.HISTORY)}
                >
                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Histórico</span>
                </button>

                {isAuthenticated && (
                  <button
                    className={`mobile-menu-item ${currentView === VIEWS.PROFILE ? 'active' : ''}`}
                    onClick={() => handleProtectedNavigation(VIEWS.PROFILE)}
                  >
                    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Perfil</span>
                  </button>
                )}
              </div>

              {/* Mobile Menu Actions */}
              <div className="mobile-menu-actions">
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      logout({ logoutParams: { returnTo: window.location.origin } });
                      setMobileMenuOpen(false);
                    }}
                    className="mobile-logout-btn"
                  >
                    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Sair</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleLogin();
                      setMobileMenuOpen(false);
                    }}
                    className="mobile-login-btn"
                    disabled={loginLoading}
                  >
                    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>{loginLoading ? 'Carregando...' : 'Login'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

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
          <UploadPage onSuccess={handleUploadSuccess} excelService={excelService} />
        )}

        {!loading && currentView === VIEWS.RESULTS && processedData && isAuthenticated && (
          <ResultsPage data={processedData} excelService={excelService} />
        )}

        {!loading && currentView === VIEWS.HISTORY && isAuthenticated && (
          <HistoryPage onViewDetails={handleViewDetails} excelService={excelService} />
        )}

        {!loading && currentView === VIEWS.PROFILE && isAuthenticated && (
          <ProfilePage />
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-top">
          <p>{APP_NAME} - {APP_DESCRIPTION}</p>
        </div>

        <div className="footer-beta">
          <svg className="warning-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10.29 3.86L1.82 18a1 1 0 00.86 1.5h18.64a1 1 0 00.86-1.5L13.71 3.86a1 1 0 00-1.71 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>

          <span className="beta-text">
            Estamos em beta — se alguma funcionalidade não funcionar, entre em contato:
          </span>
          <a href="mailto:contato@boraentregar.com.br" className="beta-link">
            contato@boraentregar.com.br
          </a>
          <span className="beta-text">ou</span>
          <a href="https://wa.me/5521964166523?text=Ol%C3%A1%2C%20estou%20usando%20o%20BoraEntregar%20e%20encontrei%20um%20problema!" target="_blank" rel="noopener noreferrer" className="beta-link whatsapp" aria-label="Abrir WhatsApp">
            WhatsApp
          </a>
        </div>
        <p className="version">BETA {APP_VERSION}</p>
      </footer>
    </div>
  );
}

export default App;
