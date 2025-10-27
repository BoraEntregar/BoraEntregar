import mongoose, { Schema, Document } from 'mongoose';
import { GroupedData } from '../types/excel.types';

// Interface do documento MongoDB
export interface IProcessedData extends Document {
  routeName: string;
  processedAt: Date;
  originalFileName: string;
  totalRows: number;
  groupedRows: number;
  data: GroupedData[];
}

// Schema do MongoDB
const ProcessedDataSchema: Schema = new Schema({
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
  data: [{
    sequence: { type: String, required: true },
    destinationAddress: { type: String, required: true },
    bairro: { type: String },
    city: { type: String },
    zipcode: { type: String },
    latitude: { type: String, required: true },
    longitude: { type: String, required: true }
  }]
}, {
  timestamps: true // Adiciona createdAt e updatedAt automaticamente
});

// Índices para otimizar buscas
ProcessedDataSchema.index({ routeName: 1, processedAt: -1 });

export default mongoose.model<IProcessedData>('ProcessedData', ProcessedDataSchema);