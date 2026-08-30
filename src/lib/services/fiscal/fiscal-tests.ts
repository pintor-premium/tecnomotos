import { createFiscalProvider, getFiscalRuntimeConfig } from './FiscalProviderFactory';
import { mapFiscalPaymentMethod } from './FiscalPaymentMapper';
import { MockFiscalProvider } from './providers/MockFiscalProvider';
import { validateNfceSale } from './validateNfceSale';
import { FiscalCompanySettings, FiscalSale } from './types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }

  console.log(`  [OK] ${message}`);
}

async function runAllTests() {
  console.log('==================================================');
  console.log('EXECUTANDO TESTES DO MODULO FISCAL FOCUS NFE');
  console.log('==================================================\n');

  const originalProvider = process.env.FISCAL_PROVIDER;
  const originalEnvironment = process.env.FISCAL_ENVIRONMENT;
  const originalProductionEnabled = process.env.FISCAL_PRODUCTION_ENABLED;

  try {
    process.env.FISCAL_PROVIDER = 'mock';
    process.env.FISCAL_ENVIRONMENT = 'mock';
    process.env.FISCAL_PRODUCTION_ENABLED = 'false';

    const company: FiscalCompanySettings = {
      companyName: 'TECNOMOTOS',
      cnpj: '22010781000138',
      uf: 'MT',
      city: 'Tangara da Serra',
      ibgeCityCode: '5107958',
      crt: '1',
      nfceSeries: '1'
    };

    const sale: FiscalSale = {
      id: 'order-test',
      customerEmail: 'cliente@exemplo.com',
      totalAmount: 100,
      paymentMethod: 'pix',
      items: [{
        id: 'item-1',
        name: 'Produto fiscal completo',
        quantity: 1,
        unitPrice: 100,
        ncm: '87141000',
        cfop: '5102',
        csosn: '102',
        origin: 0,
        unit: 'UN'
      }]
    };

    console.log('1. Validando mapeamento de pagamentos...');
    assert(mapFiscalPaymentMethod('pix') === '17', 'PIX deve ser mapeado para codigo fiscal 17');
    assert(mapFiscalPaymentMethod('cash') === '01', 'Dinheiro deve ser mapeado para codigo fiscal 01');
    assert(mapFiscalPaymentMethod('credit_card') === '03', 'Credito deve ser mapeado para codigo fiscal 03');
    assert(mapFiscalPaymentMethod('debit_card') === '04', 'Debito deve ser mapeado para codigo fiscal 04');

    console.log('\n2. Validando venda NFC-e...');
    assert(validateNfceSale(company, sale).length === 0, 'Venda fiscal completa deve passar na validacao');
    assert(
      validateNfceSale(company, { ...sale, items: [{ ...sale.items[0], ncm: '' }] }).some((message) => message.includes('NCM')),
      'Produto sem NCM deve bloquear emissao'
    );

    console.log('\n3. Validando provider mock...');
    const mockProvider = new MockFiscalProvider();
    const result = await mockProvider.issueNfce({
      operationId: '12345678-1234-1234-1234-123456789012',
      reference: 'tecnomotos-nfce-order-test',
      environment: 'mock',
      company,
      sale
    });
    assert(result.status === 'authorized', 'MockFiscalProvider deve autorizar sem chamada externa');
    assert(String(result.accessKey).startsWith('MOCK-NFCE-'), 'Mock nao deve gerar chave fiscal real');

    console.log('\n4. Validando factory e bloqueio de producao...');
    const config = getFiscalRuntimeConfig();
    assert(config.provider === 'mock', 'FISCAL_PROVIDER deve permanecer mock por padrao de teste');
    assert(createFiscalProvider().name === 'mock', 'Factory deve criar MockFiscalProvider em modo mock');

    process.env.FISCAL_PROVIDER = 'focusnfe';
    process.env.FISCAL_ENVIRONMENT = 'production';
    process.env.FISCAL_PRODUCTION_ENABLED = 'false';

    let blockedProduction = false;
    try {
      getFiscalRuntimeConfig();
    } catch (error) {
      blockedProduction = error instanceof Error && error.message.includes('Producao fiscal bloqueada');
    }
    assert(blockedProduction, 'Producao Focus deve exigir FISCAL_PRODUCTION_ENABLED=true');

    console.log('\n==================================================');
    console.log('TESTES FISCAIS PASSARAM COM SUCESSO');
    console.log('==================================================');
  } finally {
    process.env.FISCAL_PROVIDER = originalProvider;
    process.env.FISCAL_ENVIRONMENT = originalEnvironment;
    process.env.FISCAL_PRODUCTION_ENABLED = originalProductionEnabled;
  }
}

runAllTests().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Erro desconhecido nos testes fiscais');
  process.exit(1);
});
