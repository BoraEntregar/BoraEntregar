import * as XLSX from 'xlsx';
import type { GroupedData } from '../types';

interface ExportData {
  routeName: string;
  data: GroupedData[];
}

/**
 * Exporta dados para arquivo Excel localmente
 */
export const exportToExcel = ({ routeName, data }: ExportData): void => {
  // Preparar dados para export
  const exportData = (data || []).map((row, index) => ({
    'Sequência': row.sequence || index + 1,
    'Endereço': row.destinationAddress,
    'Bairro': row.bairro || '',
    'Cidade': row.city || '',
    'CEP': row.zipcode || '',
    'Latitude': row.latitude,
    'Longitude': row.longitude,
  }));

  // Criar workbook e worksheet
  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rotas Agrupadas');

  // Ajustar largura das colunas
  const colWidths = [
    { wch: 12 }, // Sequência
    { wch: 50 }, // Endereço
    { wch: 20 }, // Bairro
    { wch: 20 }, // Cidade
    { wch: 12 }, // CEP
    { wch: 15 }, // Latitude
    { wch: 15 }, // Longitude
  ];
  ws['!cols'] = colWidths;

  // Exportar
  const fileName = `${routeName.replace(/[^a-z0-9]/gi, '_')}_processado.xlsx`;
  XLSX.writeFile(wb, fileName);
};

/**
 * Gera nome de arquivo sanitizado
 */
export const sanitizeFileName = (fileName: string): string => {
  return fileName.replace(/[^a-z0-9]/gi, '_');
};
