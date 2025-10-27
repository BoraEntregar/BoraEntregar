import * as XLSX from 'xlsx';
import { ExcelRow, GroupedData } from '../types/excel.types';

export class ExcelProcessor {
  
  /**
   * Lê arquivo Excel e retorna array de objetos
   * @param buffer - Buffer do arquivo Excel
   * @returns Array de ExcelRow
   */
  static readExcelFile(buffer: Buffer): ExcelRow[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Converter para JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    
    // Mapear para interface ExcelRow
    const excelRows: ExcelRow[] = jsonData.map((row: any) => ({
      sequence: String(row['Sequence'] || row['sequence'] || ''),
      destinationAddress: String(row['Destination Address'] || row['destinationAddress'] || ''),
      bairro: String(row['Bairro'] || row['bairro'] || ''),
      city: String(row['City'] || row['city'] || ''),
      zipcode: String(row['Zipcode/Postal code'] || row['Zipcode'] || row['zipcode'] || ''),
      latitude: String(row['Latitude'] || row['latitude'] || ''),
      longitude: String(row['Longitude'] || row['longitude'] || '')
    }));

    return excelRows;
  }

  /**
   * Extrai o número do endereço após a primeira vírgula
   * @param address - Endereço completo
   * @returns Número do endereço
   */
  static extractAddressNumber(address: string): string {
    const parts = address.split(',');
    
    if (parts.length > 1) {
      const secondPart = parts[1].trim();
      // Extrai apenas os dígitos do início
      const number = secondPart.match(/^\d+/);
      return number ? number[0] : '';
    }
    
    return '';
  }

  /**
   * Agrupa dados por latitude, longitude e número do endereço
   * @param data - Array de ExcelRow
   * @param latitudePrecision - Precisão da latitude (padrão: 7 caracteres)
   * @param longitudePrecision - Precisão da longitude (padrão: 7 caracteres)
   * @returns Array de GroupedData
   */
  static groupByCoordinates(
    data: ExcelRow[], 
    latitudePrecision: number = 7,
    longitudePrecision: number = 7
  ): GroupedData[] {
    
    const groupedMap = new Map<string, GroupedData>();

    for (const row of data) {
      // Pega os primeiros N caracteres de latitude e longitude
      const latitudeKey = row.latitude.substring(0, latitudePrecision);
      const longitudeKey = row.longitude.substring(0, longitudePrecision);
      
      // Extrai o número do endereço
      const addressNumber = this.extractAddressNumber(row.destinationAddress);
      
      // Cria chave única para agrupamento
      const groupKey = `${latitudeKey}_${longitudeKey}_${addressNumber}`;

      if (groupedMap.has(groupKey)) {
        // Se já existe, concatena a sequence
        const existing = groupedMap.get(groupKey)!;
        existing.sequence += `; ${row.sequence}`;
      } else {
        // Cria nova entrada
        groupedMap.set(groupKey, {
          sequence: row.sequence,
          destinationAddress: row.destinationAddress,
          bairro: row.bairro,
          city: row.city,
          zipcode: row.zipcode,
          latitude: row.latitude,
          longitude: row.longitude
        });
      }
    }

    return Array.from(groupedMap.values());
  }

  /**
   * Gera arquivo Excel a partir dos dados agrupados
   * @param data - Dados agrupados
   * @param fileName - Nome do arquivo
   * @returns Buffer do arquivo Excel
   */
  static generateExcelFile(data: GroupedData[], fileName: string): Buffer {
    // Criar workbook
    const workbook = XLSX.utils.book_new();
    
    // Mapear dados para formato do Excel
    const worksheetData = data.map(row => ({
      'Sequencia': row.sequence,
      'Destination Address': row.destinationAddress,
      'Bairro': row.bairro,
      'City': row.city,
      'Zipcode/Postal code': row.zipcode,
      'Latitude': row.latitude,
      'Longitude': row.longitude
    }));

    // Criar worksheet
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    
    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');
    
    // Gerar buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    return buffer;
  }

  /**
   * Valida se o arquivo possui as colunas necessárias
   * @param data - Array de ExcelRow
   * @returns true se válido, false caso contrário
   */
  static validateExcelData(data: ExcelRow[]): { valid: boolean; message?: string } {
    if (!data || data.length === 0) {
      return { valid: false, message: 'Arquivo vazio ou sem dados' };
    }

    const firstRow = data[0];
    const requiredFields = ['latitude', 'longitude', 'destinationAddress'];
    
    for (const field of requiredFields) {
      if (!firstRow[field as keyof ExcelRow]) {
        return { 
          valid: false, 
          message: `Campo obrigatório "${field}" não encontrado no arquivo` 
        };
      }
    }

    return { valid: true };
  }
}