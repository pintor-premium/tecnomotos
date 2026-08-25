export interface XmlValidationError {
  field: string;
  message: string;
}

/**
 * Validates NFe/NFC-e XML structure before sending it to SEFAZ.
 * Ensures the presence of mandatory tags and formats.
 */
export function validateNfceXml(xml: string): XmlValidationError[] {
  const errors: XmlValidationError[] = [];

  // Verify emitter details
  if (!xml.includes('<emit>')) {
    errors.push({ field: 'emit', message: 'Dados cadastrais do emitente não encontrados no documento fiscal.' });
  }
  
  if (xml.includes('<CNPJ></CNPJ>') || !xml.includes('<CNPJ>')) {
    errors.push({ field: 'cnpj', message: 'CNPJ do emitente é obrigatório.' });
  }

  if (xml.includes('<IE></IE>') || !xml.includes('<IE>')) {
    errors.push({ field: 'stateRegistration', message: 'Inscrição Estadual (IE) do emitente é obrigatória.' });
  }

  if (xml.includes('<CRT></CRT>') || !xml.includes('<CRT>')) {
    errors.push({ field: 'crt', message: 'Código de Regime Tributário (CRT) do emitente é obrigatório.' });
  }

  // Verify items NCM codes
  const ncmMatches = xml.match(/<NCM>(.*?)<\/NCM>/g);
  if (!ncmMatches || ncmMatches.length === 0) {
    errors.push({ field: 'ncm', message: 'Produto sem NCM fiscal configurado.' });
  } else {
    ncmMatches.forEach((ncmTag) => {
      const ncmValue = ncmTag.replace('<NCM>', '').replace('</NCM>', '').trim();
      if (ncmValue.length < 8) {
        errors.push({ field: 'ncm', message: `NCM inválido (${ncmValue}). Deve conter 8 dígitos.` });
      }
    });
  }

  // Verify items CFOP codes
  const cfopMatches = xml.match(/<CFOP>(.*?)<\/CFOP>/g);
  if (!cfopMatches || cfopMatches.length === 0) {
    errors.push({ field: 'cfop', message: 'CFOP é obrigatório em todos os produtos.' });
  }

  console.log(`[XmlValidator] XML validation checks complete. Total issues found: ${errors.length}`);
  return errors;
}
