export interface NfceItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  ncm: string;
  cest?: string;
  cfop: string;
  cst?: string;
  csosn?: string;
  barcode?: string;
  origin: number;
  unit: string;
}

export interface NfceInputData {
  items: NfceItem[];
  customerDocument?: string;
  customerName?: string;
  paymentMethod: 'cash' | 'card' | 'pix' | 'other';
  series?: string;
  number?: string;
}

export interface NfceResult {
  success: boolean;
  documentId: string;
  invoiceNumber?: string;
  series?: string;
  accessKey?: string;
  xml?: string;
  status: 'DRAFT' | 'PROCESSING' | 'AUTHORIZED' | 'REJECTED' | 'CANCELLED' | 'DENIED' | 'CONTINGENCY' | 'ERROR';
  errorMessage?: string;
}

export interface NfceSendResult {
  success: boolean;
  xmlUrl?: string;
  danfeUrl?: string;
  status: string;
  protocol?: string;
  sefazCode?: string;
  sefazMessage?: string;
  signedXml?: string;
  authorizedXml?: string;
}

export interface NfceStatusResult {
  id?: string;
  status: string;
  invoiceNumber?: string;
  series?: string;
  accessKey?: string;
  protocol?: string;
  sefazCode: string;
  sefazMessage: string;
  authorizedAt?: string;
}

export interface NfceCancelResult {
  success: boolean;
  cancelledAt?: string;
  status: string;
  protocol?: string;
  sefazCode: string;
  sefazMessage: string;
}

export interface InvalidateNumberResult {
  success: boolean;
  protocol?: string;
  sefazCode: string;
  sefazMessage: string;
}

export interface SefazStatusResult {
  status: 'ONLINE' | 'OFFLINE' | 'UNAVAILABLE' | 'UNKNOWN';
  lastCheck: string;
  environment: string;
}

export abstract class FiscalService {
  /**
   * Builds the initial NFC-e layout and saves a DRAFT in the database.
   */
  abstract createNfce(orderId: string, data: NfceInputData): Promise<NfceResult>;

  /**
   * Signs the generated NFC-e XML.
   */
  abstract signNfce(xml: string, tagToSign: string): Promise<string>;

  /**
   * Signs and sends the NFC-e payload to SEFAZ Web Services.
   */
  abstract sendNfce(documentId: string): Promise<NfceSendResult>;

  /**
   * Queries Sefaz for an active document protocol by its Access Key.
   */
  abstract queryNfce(accessKey: string): Promise<NfceStatusResult>;

  /**
   * Fetch status of the current document locally.
   */
  abstract getNfceStatus(documentId: string): Promise<NfceStatusResult>;

  /**
   * Submits a cancellation event to SEFAZ MT.
   */
  abstract cancelNfce(documentId: string, reason: string): Promise<NfceCancelResult>;

  /**
   * Invalidates a gap in sequence numbers at Sefaz (Inutilização de Número).
   */
  abstract invalidateNfceNumber(
    series: string,
    startNumber: number,
    endNumber: number,
    justification: string
  ): Promise<InvalidateNumberResult>;

  /**
   * Queries Sefaz MT operational status.
   */
  abstract getServiceStatus(): Promise<SefazStatusResult>;

  /**
   * Processes future events (letter of correction, contingency triggers etc).
   */
  abstract processEvent(
    documentId: string,
    eventType: string,
    payload: Record<string, unknown>
  ): Promise<{ success: boolean; protocol?: string; sefazCode: string; sefazMessage: string }>;
}
