import mongoose, { Schema, Document } from 'mongoose';

// Interface do documento MongoDB
export interface IProcessedData extends Document {
  userId: string;
  routeName: string;
  processedAt: Date;
  originalFileName: string;
  totalRows: number;
  groupedRows: number;
  filePath: string; // Caminho do arquivo Excel processado no disco
  fileSize?: number; // Tamanho do arquivo em bytes (opcional)
  createdAt: Date; // Timestamp de criação (auto-gerenciado pelo Mongoose)
  updatedAt: Date; // Timestamp de atualização (auto-gerenciado pelo Mongoose)
}

// Schema do MongoDB
const ProcessedDataSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  routeName: {
    type: String,
    required: true,
    trim: true
  },
  processedAt: {
    type: Date,
    default: Date.now
  },
  originalFileName: {
    type: String,
    required: true
  },
  totalRows: {
    type: Number,
    required: true
  },
  groupedRows: {
    type: Number,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: false
  }
}, {
  timestamps: true // Adiciona createdAt e updatedAt automaticamente
});

// Índices para otimizar buscas
ProcessedDataSchema.index({ userId: 1, routeName: 1, processedAt: -1 });

export default mongoose.model<IProcessedData>('ProcessedData', ProcessedDataSchema);