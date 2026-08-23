export interface NfceItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  ncm: string;       // Nomenclatura Comum do Mercosul
  cest?: string;     // Código Especificador da Substituição Tributária
  cfop: string;      // Código Fiscal de Operações e Prestações
  cst?: string;      // Código de Situação Tributária (regime normal)
  csosn?: string;    // Código de Situação da Operação no Simples Nacional
  ean?: string;      // Código de barras
  origin: number;    // Origem da mercadoria (0: Nacional, 1: Estrangeira etc)
  unit: string;      // Unidade de medida (UN, KG, L, etc)
}

export interface NfceInputData {
  items: NfceItem[];
  customerDocument?: string;
  customerName?: string;
  paymentMethod: 'cash' | 'card' | 'pix' | 'other';
}

export interface NfceResult {
  success: boolean;
  documentId: string;
  invoiceNumber?: string;
  series?: string;
  status: 'EMITTED' | 'ERROR';
  errorMessage?: string;
}

export interface NfceSendResult {
  success: boolean;
  xmlUrl?: string;
  danfeUrl?: string;
  status: string;
}

export interface NfceStatusResult {
  id: string;
  status: string;
  invoiceNumber: string;
  series: string;
}

export interface NfceCancelResult {
  success: boolean;
  cancelledAt?: string;
  status: string;
}

export abstract class FiscalService {
  abstract createNfce(orderId: string, data: NfceInputData): Promise<NfceResult>;

  abstract sendNfce(documentId: string): Promise<NfceSendResult>;

  abstract getNfceStatus(documentId: string): Promise<NfceStatusResult>;

  abstract cancelNfce(documentId: string, reason: string): Promise<NfceCancelResult>;
}
