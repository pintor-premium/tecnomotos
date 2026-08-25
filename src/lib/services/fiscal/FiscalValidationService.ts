import { NfceInputData } from './FiscalService';

export interface FiscalValidationError {
  code: string;
  message: string;
  field?: string;
}

export class FiscalValidationService {
  /**
   * Performs deep tax validations on invoice input data and company settings.
   * If any error block is returned, the system will prevent transmission.
   */
  validate(
    companySettings: {
      cnpj?: string | null;
      state_registration?: string | null;
      uf?: string | null;
      crt?: string | null;
      environment?: string | null;
    },
    data: NfceInputData,
    certificateProvider: {
      hasCertificate: boolean;
    }
  ): FiscalValidationError[] {
    const errors: FiscalValidationError[] = [];

    // 1. Emitter settings check
    if (!companySettings.cnpj) {
      errors.push({
        code: 'CONFIG_CNPJ_MISSING',
        message: 'Configuração da Empresa: CNPJ do emitente não configurado.',
        field: 'cnpj',
      });
    }
    if (!companySettings.state_registration) {
      errors.push({
        code: 'CONFIG_IE_MISSING',
        message: 'Configuração da Empresa: Inscrição Estadual (IE) não configurada.',
        field: 'state_registration',
      });
    }
    if (!companySettings.uf || companySettings.uf !== 'MT') {
      errors.push({
        code: 'CONFIG_UF_INVALID',
        message: 'Configuração da Empresa: Apenas a UF "MT" é suportada para a SEFAZ-MT.',
        field: 'uf',
      });
    }
    if (!companySettings.crt) {
      errors.push({
        code: 'CONFIG_CRT_MISSING',
        message: 'Configuração da Empresa: Código de Regime Tributário (CRT) não configurado.',
        field: 'crt',
      });
    }

    // 2. Digital certificate check (only applicable for homologation or production)
    if (!certificateProvider.hasCertificate && companySettings.environment !== 'mock') {
      errors.push({
        code: 'CERTIFICATE_MISSING',
        message: 'Certificado Digital: Certificado digital não configurado no servidor.',
        field: 'certificate',
      });
    }

    // 3. CSC checks (only applicable for homologation or production)
    const csc = process.env.FISCAL_CSC;
    const cscId = process.env.FISCAL_CSC_ID;
    if ((!csc || !cscId) && companySettings.environment !== 'mock') {
      errors.push({
        code: 'CSC_MISSING',
        message: 'Configuração Fiscal: CSC (Token SEFAZ) ou CSC ID não configurados nas variáveis de ambiente.',
        field: 'csc',
      });
    }

    // 4. Numbering sequence checks
    if (!data.series || parseInt(data.series, 10) <= 0) {
      errors.push({
        code: 'SERIES_INVALID',
        message: 'Dados da Nota: Série da NFC-e inválida.',
        field: 'series',
      });
    }
    if (!data.number || parseInt(data.number, 10) <= 0) {
      errors.push({
        code: 'NUMBER_INVALID',
        message: 'Dados da Nota: Número da NFC-e inválido.',
        field: 'number',
      });
    }

    // 5. Invoice items check
    if (!data.items || data.items.length === 0) {
      errors.push({
        code: 'ITEMS_EMPTY',
        message: 'Produtos: A NFC-e deve conter ao menos um item de produto.',
        field: 'items',
      });
    } else {
      data.items.forEach((item, index) => {
        const itemIndex = index + 1;
        const name = item.name || 'Sem Descrição';

        if (!item.name) {
          errors.push({
            code: 'ITEM_NAME_MISSING',
            message: `Item #${itemIndex}: Nome ou descrição do produto é obrigatório.`,
            field: `items.${index}.name`,
          });
        }
        if (!item.ncm) {
          errors.push({
            code: 'ITEM_NCM_MISSING',
            message: `Item #${itemIndex} (${name}): Produto sem NCM fiscal configurado.`,
            field: `items.${index}.ncm`,
          });
        } else if (item.ncm.length < 8) {
          errors.push({
            code: 'ITEM_NCM_INVALID',
            message: `Item #${itemIndex} (${name}): NCM inválido (${item.ncm}). Deve conter 8 dígitos.`,
            field: `items.${index}.ncm`,
          });
        }
        if (!item.cfop) {
          errors.push({
            code: 'ITEM_CFOP_MISSING',
            message: `Item #${itemIndex} (${name}): CFOP não configurado.`,
            field: `items.${index}.cfop`,
          });
        }
        if (item.price <= 0) {
          errors.push({
            code: 'ITEM_PRICE_INVALID',
            message: `Item #${itemIndex} (${name}): O valor unitário deve ser maior que zero.`,
            field: `items.${index}.price`,
          });
        }
        if (item.quantity <= 0) {
          errors.push({
            code: 'ITEM_QUANTITY_INVALID',
            message: `Item #${itemIndex} (${name}): A quantidade deve ser maior que zero.`,
            field: `items.${index}.quantity`,
          });
        }
        if (!item.unit) {
          errors.push({
            code: 'ITEM_UNIT_MISSING',
            message: `Item #${itemIndex} (${name}): Unidade de medida (ex: UN, PC, KG) é obrigatória.`,
            field: `items.${index}.unit`,
          });
        }

        // CST / CSOSN Compatibility checks based on CRT
        if (companySettings.crt === '1') {
          // Simples Nacional: CSOSN is mandatory, CST is invalid
          if (!item.csosn) {
            errors.push({
              code: 'ITEM_CSOSN_MISSING',
              message: `Item #${itemIndex} (${name}): CSOSN é obrigatório para emitentes do Simples Nacional.`,
              field: `items.${index}.csosn`,
            });
          }
        } else if (companySettings.crt === '3') {
          // Regime Normal: CST is mandatory, CSOSN is invalid
          if (!item.cst) {
            errors.push({
              code: 'ITEM_CST_MISSING',
              message: `Item #${itemIndex} (${name}): CST é obrigatório para emitentes do Regime Normal.`,
              field: `items.${index}.cst`,
            });
          }
        }
      });
    }

    // 6. Payment terms checks
    if (!data.paymentMethod) {
      errors.push({
        code: 'PAYMENT_METHOD_MISSING',
        message: 'Forma de Pagamento: A forma de pagamento é obrigatória.',
        field: 'paymentMethod',
      });
    }

    console.log(`[FiscalValidationService] Document checks complete. Errors: ${errors.length}`);
    return errors;
  }
}
