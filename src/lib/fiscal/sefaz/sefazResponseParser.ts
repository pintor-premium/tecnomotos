export interface SefazParsedResponse {
  cStat: string;
  xMotivo: string;
  nProt?: string;
  dhRecbto?: string;
  chNFe?: string;
}

/**
 * Parses the SEFAZ SOAP response XML to extract tax event results.
 * Avoids heavy XML DOM parser dependencies for server-side performance.
 */
export function parseSefazResponse(xml: string): SefazParsedResponse {
  console.log('[SefazResponseParser] Parsing SOAP response envelope.');

  // Extract status code (cStat)
  const cStatMatch = xml.match(/<cStat>(.*?)<\/cStat>/);
  const cStat = cStatMatch ? cStatMatch[1] : '999';

  // Extract explanation message (xMotivo)
  const xMotivoMatch = xml.match(/<xMotivo>(.*?)<\/xMotivo>/);
  const xMotivo = xMotivoMatch ? xMotivoMatch[1] : 'Erro desconhecido na resposta da SEFAZ';

  // Extract protocol number (nProt)
  const nProtMatch = xml.match(/<nProt>(.*?)<\/nProt>/);
  const nProt = nProtMatch ? nProtMatch[1] : undefined;

  // Extract receive timestamp (dhRecbto)
  const dhRecbtoMatch = xml.match(/<dhRecbto>(.*?)<\/dhRecbto>/);
  const dhRecbto = dhRecbtoMatch ? dhRecbtoMatch[1] : undefined;

  // Extract invoice access key (chNFe)
  const chNFeMatch = xml.match(/<chNFe>(.*?)<\/chNFe>/);
  const chNFe = chNFeMatch ? chNFeMatch[1] : undefined;

  return {
    cStat,
    xMotivo,
    nProt,
    dhRecbto,
    chNFe,
  };
}
