import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import ResultsPage from './pages/ResultsPage';
import HistoryPage from './pages/HistoryPage';
import { excelService } from './services/api';
import { useApiHealth, useProcessedData } from './hooks';
import { VIEWS, APP_NAME, APP_VERSION, APP_DESCRIPTION, MESSAGES } from './constants';
import type { ViewType } from './constants';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>(VIEWS.HOME);
  const { processedData, updateProcessedData, clearProcessedData, hasData } = useProcessedData();
  const [loading, setLoading] = useState(false);

  // Verificar saúde da API ao iniciar
  useApiHealth();

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
        // Converter ProcessedDataDetail para o formato esperado
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
    clearProcessedData();
    setCurrentView(VIEWS.UPLOAD);
  };

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

      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="brand">
            <svg className="logo" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <h1>{APP_NAME}</h1>
          </div>

          <nav className="nav">
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

            {hasData && (
              <button
                className={`nav-btn ${currentView === VIEWS.RESULTS ? 'active' : ''}`}
                onClick={() => setCurrentView(VIEWS.RESULTS)}
              >
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Resultados
              </button>
            )}

            <button
              className={`nav-btn ${currentView === VIEWS.HISTORY ? 'active' : ''}`}
              onClick={() => setCurrentView(VIEWS.HISTORY)}
            >
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Histórico
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {loading && (
          <div className="loading-overlay">
            <span className="spinner large"></span>
            <p>Carregando...</p>
          </div>
        )}

        {!loading && currentView === VIEWS.HOME && (
          <HomePage onGetStarted={() => setCurrentView(VIEWS.UPLOAD)} />
        )}

        {!loading && currentView === VIEWS.UPLOAD && (
          <UploadPage onSuccess={handleUploadSuccess} />
        )}

        {!loading && currentView === VIEWS.RESULTS && processedData && (
          <ResultsPage data={processedData} />
        )}

        {!loading && currentView === VIEWS.HISTORY && (
          <HistoryPage onViewDetails={handleViewDetails} />
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
