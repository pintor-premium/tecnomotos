import { NfceXmlBuilder } from '../../fiscal/sefaz/xmlBuilder';
import { FiscalValidationService } from './FiscalValidationService';
import { QrCodePayloadBuilder } from './QrCodeService';
import { MockFiscalService } from './MockFiscalService';
import { SefazMtFiscalService } from './SefazMtFiscalService';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  [OK] ${message}`);
}

async function runAllTests() {
  console.log('==================================================');
  console.log('EXECUTANDO SUÍTE DE TESTES UNITÁRIOS DO MÓDULO FISCAL');
  console.log('==================================================\n');

  try {
    // ----------------------------------------------------
    // TEST 1: NfceXmlBuilder & Key Modulo 11
    // ----------------------------------------------------
    console.log('1. Testando NfceXmlBuilder e Chave de Acesso...');
    const builder = new NfceXmlBuilder();
    const orderInput = {
      id: 'order_123',
      series: '1',
      number: '123',
      cnpj: '12.345.678/0001-90',
      companyName: 'TECNOMOTOS TEST LTDA',
      stateRegistration: '123456789',
      crt: '1',
      uf: 'MT',
      city: 'Tangará da Serra',
      ibgeCityCode: '5107958',
      items: [
        {
          id: 'p-1',
          name: 'Pneu Pirelli Diablo',
          price: 550.00,
          quantity: 1,
          ncm: '4011.40.00',
          cfop: '5102',
          csosn: '102',
          origin: 0,
          unit: 'UN'
        }
      ],
      paymentMethod: 'pix' as const
    };

    const { xml, accessKey } = builder.buildNfceXml(orderInput);
    assert(xml.includes('<xProd>Pneu Pirelli Diablo</xProd>'), 'XML deve conter a descrição do produto');
    assert(xml.includes('<NCM>4011.40.00</NCM>'), 'XML deve conter o NCM do produto');
    assert(accessKey.length === 44, 'A chave de acesso deve ter exatamente 44 caracteres');
    assert(xml.includes(`Id="NFe${accessKey}"`), 'A chave de acesso deve estar associada ao atributo Id');

    // ----------------------------------------------------
    // TEST 2: FiscalValidationService (Regras de Validação)
    // ----------------------------------------------------
    console.log('\n2. Testando FiscalValidationService...');
    const validator = new FiscalValidationService();

    // Test 2.1: Missing NCM
    const missingNcmInput = {
      items: [
        {
          id: '1',
          name: 'Pneu Sem NCM',
          price: 500,
          quantity: 1,
          ncm: '', // Empty NCM
          cfop: '5102',
          csosn: '102',
          origin: 0,
          unit: 'UN'
        }
      ],
      paymentMethod: 'pix' as const,
      series: '1',
      number: '100'
    };
    const errorsNcm = validator.validate(
      { cnpj: '00000000000000', state_registration: '12345', uf: 'MT', crt: '1', environment: 'mock' },
      missingNcmInput,
      { hasCertificate: false }
    );
    assert(errorsNcm.some(e => e.code === 'ITEM_NCM_MISSING'), 'Deve rejeitar produto sem NCM');

    // Test 2.2: Missing CFOP
    const missingCfopInput = {
      items: [
        {
          id: '1',
          name: 'Pneu Sem CFOP',
          price: 500,
          quantity: 1,
          ncm: '4011.40.00',
          cfop: '', // Empty CFOP
          csosn: '102',
          origin: 0,
          unit: 'UN'
        }
      ],
      paymentMethod: 'pix' as const,
      series: '1',
      number: '100'
    };
    const errorsCfop = validator.validate(
      { cnpj: '00000000000000', state_registration: '12345', uf: 'MT', crt: '1', environment: 'mock' },
      missingCfopInput,
      { hasCertificate: false }
    );
    assert(errorsCfop.some(e => e.code === 'ITEM_CFOP_MISSING'), 'Deve rejeitar produto sem CFOP');

    // Test 2.3: Incompatible CST/CSOSN vs CRT
    const incompatibleInput = {
      items: [
        {
          id: '1',
          name: 'Produto Simples Nacional Sem CSOSN',
          price: 500,
          quantity: 1,
          ncm: '4011.40.00',
          cfop: '5102',
          origin: 0,
          unit: 'UN'
          // CSOSN is missing
        }
      ],
      paymentMethod: 'pix' as const,
      series: '1',
      number: '100'
    };
    const errorsCompat = validator.validate(
      { cnpj: '00000000000000', state_registration: '12345', uf: 'MT', crt: '1', environment: 'mock' },
      incompatibleInput,
      { hasCertificate: false }
    );
    assert(errorsCompat.some(e => e.code === 'ITEM_CSOSN_MISSING'), 'Deve exigir CSOSN para CRT=1 (Simples Nacional)');

    // Test 2.4: Emitter state missing
    const missingEmt = validator.validate(
      { cnpj: '', state_registration: '', uf: '', crt: '', environment: 'homologation' },
      orderInput,
      { hasCertificate: false }
    );
    assert(missingEmt.some(e => e.code === 'CONFIG_CNPJ_MISSING'), 'Deve alertar sobre CNPJ ausente');
    assert(missingEmt.some(e => e.code === 'CONFIG_IE_MISSING'), 'Deve alertar sobre IE ausente');
    assert(missingEmt.some(e => e.code === 'CERTIFICATE_MISSING'), 'Deve alertar sobre Certificado digital ausente em homologação');

    // ----------------------------------------------------
    // TEST 3: QrCodePayloadBuilder
    // ----------------------------------------------------
    console.log('\n3. Testando QrCodePayloadBuilder...');
    const qrBuilder = new QrCodePayloadBuilder();
    const qrPayload = qrBuilder.buildPayload({
      chNFe: accessKey,
      tpAmb: '2',
      vNF: 550.00,
      dhEmi: new Date().toISOString(),
      cscId: '000001',
      csc: 'TEST-CSC-KEY-TOKEN'
    });
    assert(qrPayload.includes('chNFe='), 'QR Code deve conter a chave de acesso');
    assert(qrPayload.includes('tpAmb=2'), 'QR Code deve conter o tipo de ambiente');
    assert(qrPayload.includes('cIdToken=000001'), 'QR Code deve conter o identificador do token CSC');

    // ----------------------------------------------------
    // TEST 4: MockFiscalService execution
    // ----------------------------------------------------
    console.log('\n4. Testando MockFiscalService...');
    const mockService = new MockFiscalService();
    const mockCreate = await mockService.createNfce('order_mock', orderInput);
    assert(mockCreate.success, 'Mock createNfce deve retornar sucesso');
    assert(mockCreate.status === 'DRAFT', 'Mock inicial deve retornar como DRAFT');
    
    const mockSend = await mockService.sendNfce(mockCreate.documentId);
    assert(mockSend.success, 'Mock sendNfce deve retornar sucesso');
    assert(mockSend.status === 'AUTHORIZED', 'Mock retornado deve conter status AUTHORIZED');
    assert(mockSend.protocol !== undefined, 'Mock deve conter número de protocolo Sefaz');

    // ----------------------------------------------------
    // TEST 5: SefazMtFiscalService (Integration blocks)
    // ----------------------------------------------------
    console.log('\n5. Testando SefazMtFiscalService e Bloqueio de Produção...');
    const sefazService = new SefazMtFiscalService();
    
    // Simulate setting environment to production inside process.env
    const prevEnv = process.env.FISCAL_ENVIRONMENT;
    process.env.FISCAL_ENVIRONMENT = 'production';
    
    const sefazProdService = new SefazMtFiscalService();
    let threwError = false;
    try {
      await sefazProdService.createNfce('order_prod', orderInput);
    } catch (e: unknown) {
      threwError = true;
      const errMsg = e instanceof Error ? e.message : '';
      assert(errMsg.includes('ambiente de produção fiscal (validade jurídica) está desabilitado'), 'SefazMtFiscalService em produção deve explodir erro de proteção');
    }
    assert(threwError, 'Deve lançar erro ao tentar emitir nota em produção');
    
    // Revert env
    process.env.FISCAL_ENVIRONMENT = prevEnv;

    console.log('\n==================================================');
    console.log('TODOS OS TESTES UNITÁRIOS PASSARAM COM SUCESSO!');
    console.log('==================================================');
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('\nErro ao executar testes:', errMsg);
    process.exit(1);
  }
}

// Run if called directly
runAllTests();
