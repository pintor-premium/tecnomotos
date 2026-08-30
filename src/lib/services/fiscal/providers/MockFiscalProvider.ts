import { FiscalProvider, NfceIssueInput, ProviderFiscalResult } from '../types';

export class MockFiscalProvider implements FiscalProvider {
  readonly name = 'mock' as const;

  async issueNfce(input: NfceIssueInput): Promise<ProviderFiscalResult> {
    const sequence = input.operationId.slice(0, 8).toUpperCase();

    return {
      status: 'authorized',
      providerStatus: 'mock_authorized',
      providerDocumentId: `MOCK-NFCE-${sequence}`,
      number: `MOCK-${sequence}`,
      series: input.company.nfceSeries || '1',
      accessKey: `MOCK-NFCE-${sequence}`,
      protocol: `MOCK-PROTOCOL-${sequence}`,
      xmlUrl: `/api/fiscal/mock/xml/${input.reference}`,
      danfceUrl: `/api/fiscal/mock/danfce/${input.reference}`,
      qrCodeUrl: `/api/fiscal/mock/qrcode/${input.reference}`,
      authorizedAt: new Date().toISOString(),
      raw: {
        reference: input.reference,
        provider: this.name,
        itemCount: input.sale.items.length
      }
    };
  }

  async getNfce(reference: string): Promise<ProviderFiscalResult> {
    return {
      status: 'authorized',
      providerStatus: 'mock_authorized',
      providerDocumentId: `MOCK-NFCE-${reference}`,
      protocol: `MOCK-PROTOCOL-${reference.slice(-8).toUpperCase()}`,
      authorizedAt: new Date().toISOString(),
      raw: { reference, provider: this.name }
    };
  }

  async cancelNfce(reference: string, reason: string): Promise<ProviderFiscalResult> {
    return {
      status: 'cancelled',
      providerStatus: 'mock_cancelled',
      protocol: `MOCK-CANCEL-${reference.slice(-8).toUpperCase()}`,
      cancelledAt: new Date().toISOString(),
      raw: { reference, reasonLength: reason.length, provider: this.name }
    };
  }

  async getServiceStatus() {
    return {
      status: 'ONLINE' as const,
      environment: 'mock' as const,
      lastCheck: new Date().toISOString()
    };
  }
}
