import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import FileUpload from './components/FileUpload';
import DataTable from './components/DataTable';
import History from './components/History';
import { excelService } from './services/api';
import type { ProcessExcelResponse } from './types';
import './App.css';

type View = 'upload' | 'results' | 'history';

function App() {
  const [currentView, setCurrentView] = useState<View>('upload');
  const [processedData, setProcessedData] = useState<ProcessExcelResponse['data'] | null>(null);
  const [loading, setLoading] = useState(false);

  // Verificar saúde da API ao iniciar
  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      await excelService.healthCheck();
    } catch (error) {
      toast.error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
    }
  };

  const handleUploadSuccess = (data: ProcessExcelResponse['data']) => {
    if (data) {
      setProcessedData(data);
      setCurrentView('results');
    }
  };

  const handleViewDetails = async (id: string) => {
    setLoading(true);
    try {
      const response = await excelService.getById(id);
      if (response.success && response.data) {
        // Converter ProcessedDataDetail para o formato esperado pelo DataTable
        const tableData: ProcessExcelResponse['data'] = {
          _id: response.data._id,
          routeName: response.data.routeName,
          originalFileName: response.data.originalFileName,
          totalRows: response.data.totalRows,
          groupedRows: response.data.groupedRows,
          data: response.data.data,
          processedAt: response.data.processedAt,
        };
        setProcessedData(tableData);
        setCurrentView('results');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao carregar detalhes');
    } finally {
      setLoading(false);
    }
  };

  const handleNewUpload = () => {
    setProcessedData(null);
    setCurrentView('upload');
  };

  return (
    <div className="app">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
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
            <h1>BoraEntregar</h1>
          </div>

          <nav className="nav">
            <button
              className={`nav-btn ${currentView === 'upload' ? 'active' : ''}`}
              onClick={handleNewUpload}
            >
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload
            </button>

            {processedData && (
              <button
                className={`nav-btn ${currentView === 'results' ? 'active' : ''}`}
                onClick={() => setCurrentView('results')}
              >
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Resultados
              </button>
            )}

            <button
              className={`nav-btn ${currentView === 'history' ? 'active' : ''}`}
              onClick={() => setCurrentView('history')}
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

        {!loading && currentView === 'upload' && (
          <FileUpload onSuccess={handleUploadSuccess} />
        )}

        {!loading && currentView === 'results' && processedData && (
          <DataTable data={processedData} />
        )}

        {!loading && currentView === 'history' && (
          <History onViewDetails={handleViewDetails} />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>
          BoraEntregar - Sistema de Agrupamento de Rotas de Entrega
        </p>
        <p className="version">v1.0.0</p>
      </footer>
    </div>
  );
}

export default App;
