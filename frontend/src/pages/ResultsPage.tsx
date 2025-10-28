import { useState } from 'react';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';
import type { GroupedData } from '../types';

interface DataTableProps {
  data: {
    _id: string;
    routeName: string;
    originalFileName: string;
    totalRows: number;
    groupedRows: number;
    data: GroupedData[];
    processedAt: string;
  };
  excelService: {
    exportExcel: (processedDataId: string) => Promise<Blob>;
  };
}

export default function DataTable({ data, excelService }: DataTableProps) {
  const [exporting, setExporting] = useState(false);

  // Debug - ver o que está chegando
  console.log('DataTable recebeu data:', data);

  // Validação de segurança
  if (!data) {
    console.error('DataTable: data é null ou undefined');
    return (
      <div className="data-table-container">
        <div className="empty-state">
          <p>Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

  if (!data.routeName || !data.data) {
    console.error('DataTable: estrutura de data inválida:', data);
    return (
      <div className="data-table-container">
        <div className="empty-state">
          <p>Estrutura de dados inválida</p>
        </div>
      </div>
    );
  }

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await excelService.exportExcel(data._id);
      const fileName = `${data.routeName.replace(/[^a-z0-9]/gi, '_')}_processado.xlsx`;
      saveAs(blob, fileName);
      toast.success('Arquivo exportado com sucesso!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao exportar arquivo');
    } finally {
      setExporting(false);
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

  return (
    <div className="data-table-container">
      {/* Header com informações */}
      <div className="table-header">
        <div className="header-info">
          <h2>{data.routeName}</h2>
          <div className="metadata">
            <span className="badge">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {data.originalFileName}
            </span>
            <span className="badge">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDate(data.processedAt)}
            </span>
          </div>
          <div className="stats">
            <div className="stat">
              <span className="stat-label">Total Original</span>
              <span className="stat-value">{data.totalRows}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Total Agrupado</span>
              <span className="stat-value success">{data.groupedRows}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Economia</span>
              <span className="stat-value highlight">
                {((1 - data.groupedRows / data.totalRows) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button
            onClick={handleExport}
            className="btn-export primary"
            disabled={exporting}
            title="Exportar para Excel"
          >
            {exporting ? (
              <>
                <span className="spinner"></span>
                Exportando...
              </>
            ) : (
              <>
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Exportar Excel
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabela de dados */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Seq.</th>
              <th>Endereço de Destino</th>
              <th>Bairro</th>
              <th>Cidade</th>
              <th>CEP</th>
              <th>Latitude</th>
              <th>Longitude</th>
            </tr>
          </thead>
          <tbody>
            {(data.data || []).map((row, index) => (
              <tr key={index}>
                <td className="seq">{row.sequence || index + 1}</td>
                <td className="address">{row.destinationAddress}</td>
                <td>{row.bairro || '-'}</td>
                <td>{row.city || '-'}</td>
                <td>{row.zipcode || '-'}</td>
                <td className="coord">{row.latitude}</td>
                <td className="coord">{row.longitude}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(!data.data || data.data.length === 0) && (
        <div className="empty-state">
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p>Nenhum dado encontrado</p>
        </div>
      )}
    </div>
  );
}
