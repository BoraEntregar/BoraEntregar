import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { excelService } from '../services/api';
import toast from 'react-hot-toast';
import type { ProcessExcelResponse } from '../types';

interface FileUploadProps {
  onSuccess: (data: ProcessExcelResponse['data']) => void;
}

export default function FileUpload({ onSuccess }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [routeName, setRouteName] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const isValidExcelFile = (file: File): boolean => {
    // Validar por extensão (case insensitive)
    const hasValidExtension = /\.(xlsx|xls)$/i.test(file.name);

    // Validar por MIME type
    const validMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ];
    const hasValidMimeType = validMimeTypes.includes(file.type);

    return hasValidExtension || hasValidMimeType;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Validar tipo de arquivo
      if (!isValidExcelFile(selectedFile)) {
        toast.error('Por favor, selecione um arquivo Excel (.xlsx ou .xls)');
        return;
      }

      // Validar tamanho (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('O arquivo não pode ter mais de 10MB');
        return;
      }

      setFile(selectedFile);
      toast.success(`Arquivo "${selectedFile.name}" selecionado`);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];

      // Validar tipo de arquivo
      if (!isValidExcelFile(droppedFile)) {
        toast.error('Por favor, selecione um arquivo Excel (.xlsx ou .xls)');
        return;
      }

      // Validar tamanho (10MB)
      if (droppedFile.size > 10 * 1024 * 1024) {
        toast.error('O arquivo não pode ter mais de 10MB');
        return;
      }

      setFile(droppedFile);
      toast.success(`Arquivo "${droppedFile.name}" selecionado`);
    }
  };

  const handleBrowseClick = () => {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error('Por favor, selecione um arquivo');
      return;
    }

    if (!routeName.trim()) {
      toast.error('Por favor, informe o nome da rota');
      return;
    }

    setLoading(true);

    try {
      const response = await excelService.processExcel(file, routeName.trim());

      if (response.success && response.data) {
        toast.success(response.message || 'Arquivo processado com sucesso!');
        onSuccess(response.data);

        // Limpar formulário
        setFile(null);
        setRouteName('');

        // Limpar input de arquivo
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        toast.error('Erro ao processar arquivo');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao processar arquivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="file-upload-container">
      <h2>Upload de Arquivo Excel</h2>

      <form onSubmit={handleSubmit} className="upload-form">
        {/* Campo de nome da rota */}
        <div className="form-group">
          <label htmlFor="route-name">Nome da Rota *</label>
          <input
            type="text"
            id="route-name"
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
            placeholder="Ex: Rota Centro - 26/10/2024"
            disabled={loading}
            required
          />
        </div>

        {/* Área de drag and drop */}
        <div
          className={`drop-zone ${dragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-input"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            disabled={loading}
            style={{ display: 'none' }}
          />

          <label htmlFor="file-input" className="drop-zone-label">
            {file ? (
              <>
                <svg className="icon check" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="file-name">{file.name}</p>
                <p className="file-size">{(file.size / 1024).toFixed(2)} KB</p>
                <p className="click-text">Clique ou arraste para trocar o arquivo</p>
              </>
            ) : (
              <>
                <svg className="icon upload" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p>Arraste e solte seu arquivo Excel aqui</p>
                <p className="or">ou</p>
                <button type="button" className="btn-browse" onClick={handleBrowseClick}>
                  Procurar arquivo
                </button>
                <p className="file-info">Formatos aceitos: .xlsx, .xls (máx. 10MB)</p>
              </>
            )}
          </label>
        </div>

        {/* Botão de submit */}
        <button
          type="submit"
          className="btn-submit"
          disabled={loading || !file || !routeName.trim()}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Processando...
            </>
          ) : (
            <>
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Processar Arquivo
            </>
          )}
        </button>
      </form>
    </div>
  );
}
