import {
  FiscalService,
  NfceInputData,
  NfceResult,
  NfceSendResult,
  NfceStatusResult,
  NfceCancelResult,
} from './FiscalService';

export class MockFiscalService extends FiscalService {
  private environment: string;

  constructor() {
    super();
    this.environment = process.env.FISCAL_ENVIRONMENT || 'mock';
  }

  async createNfce(orderId: string, data: NfceInputData): Promise<NfceResult> {
    console.log(`[Fiscal Mock] Creating NFC-e for Order: ${orderId}. Items count: ${data.items.length}`);
    data.items.forEach((item) => {
      console.log(
        `[Fiscal Mock] Item: ${item.name} | Qtd: ${item.quantity} | NCM: ${item.ncm} | CFOP: ${item.cfop} | Origem: ${item.origin} | Unidade: ${item.unit}`
      );
    });

    if (this.environment !== 'mock') {
      console.warn(
        `[Fiscal Warning] Fiscal environment is set to "${this.environment}". Real invoice emission is not supported yet.`
      );
    }

    const documentId = `doc_${Math.random().toString(36).substring(2, 15)}`;
    const invoiceNumber = Math.floor(100000 + Math.random() * 900000).toString();
    const series = '1';

    return {
      success: true,
      documentId,
      invoiceNumber,
      series,
      status: 'EMITTED',
    };
  }

  async sendNfce(documentId: string): Promise<NfceSendResult> {
    console.log(`[Fiscal Mock] Sending NFC-e document: ${documentId} to Sefaz`);

    return {
      success: true,
      status: 'AUTORIZADO',
      xmlUrl: `https://api.tecnomotos.com.br/fiscal/xml/${documentId}.xml`,
      danfeUrl: `https://api.tecnomotos.com.br/fiscal/danfe/${documentId}.pdf`,
    };
  }

  async getNfceStatus(documentId: string): Promise<NfceStatusResult> {
    console.log(`[Fiscal Mock] Fetching NFC-e status for document: ${documentId}`);

    return {
      id: documentId,
      status: 'AUTORIZADO',
      invoiceNumber: '123456',
      series: '1',
    };
  }

  async cancelNfce(documentId: string, reason: string): Promise<NfceCancelResult> {
    console.log(`[Fiscal Mock] Cancelling NFC-e document: ${documentId}. Reason: ${reason}`);

    return {
      success: true,
      status: 'CANCELADO',
      cancelledAt: new Date().toISOString(),
    };
  }
}
