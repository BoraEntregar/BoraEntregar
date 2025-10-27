import { useState, useEffect } from 'react';
import { excelService } from '../services/api';
import toast from 'react-hot-toast';
import type { HistoryItem } from '../types';

interface HistoryProps {
  onViewDetails: (id: string) => void;
}

export default function History({ onViewDetails }: HistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadHistory = async (pageNum: number = 1) => {
    setLoading(true);
    try {
      const response = await excelService.getHistory(pageNum, 10);
      if (response.success) {
        setHistory(response.data);
        setPage(response.pagination.page);
        setTotalPages(response.pagination.totalPages);
        setTotal(response.pagination.total);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao carregar histórico');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory(1);
  }, []);

  const handleDelete = async (id: string, routeName: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${routeName}"?`)) {
      return;
    }

    try {
      await excelService.deleteById(id);
      toast.success('Registro excluído com sucesso');

      // Recarregar histórico
      const newPage = history.length === 1 && page > 1 ? page - 1 : page;
      loadHistory(newPage);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir registro');
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      loadHistory(newPage);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && history.length === 0) {
    return (
      <div className="history-container">
        <div className="loading-state">
          <span className="spinner large"></span>
          <p>Carregando histórico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <h2>Histórico de Processamentos</h2>
        {total > 0 && (
          <p className="total-count">
            {total} {total === 1 ? 'processamento' : 'processamentos'} encontrado{total !== 1 && 's'}
          </p>
        )}
      </div>

      {history.length === 0 ? (
        <div className="empty-state">
          <svg className="icon large" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3>Nenhum processamento encontrado</h3>
          <p>Faça upload de um arquivo Excel para começar</p>
        </div>
      ) : (
        <>
          <div className="history-list">
            {history.map((item) => (
              <div key={item._id} className="history-item">
                <div className="item-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>

                <div className="item-info">
                  <h3>{item.routeName}</h3>
                  <p className="filename">{item.originalFileName}</p>
                  <div className="item-meta">
                    <span className="meta-item">
                      <svg className="icon small" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDate(item.processedAt)}
                    </span>
                    <span className="meta-item">
                      <svg className="icon small" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      {item.totalRows} → {item.groupedRows} linhas
                    </span>
                  </div>
                </div>

                <div className="item-actions">
                  <button
                    onClick={() => onViewDetails(item._id)}
                    className="btn-action primary"
                    title="Ver detalhes"
                  >
                    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Ver Detalhes
                  </button>
                  <button
                    onClick={() => handleDelete(item._id, item.routeName)}
                    className="btn-action danger"
                    title="Excluir"
                  >
                    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1 || loading}
                className="btn-page"
              >
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Anterior
              </button>

              <span className="page-info">
                Página {page} de {totalPages}
              </span>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages || loading}
                className="btn-page"
              >
                Próxima
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
