import https from 'https';
import { A1CertificateProvider } from './A1CertificateProvider';

/**
 * Sends a SOAP 1.2 request to a SEFAZ Web Service endpoint.
 * This runs strictly on the backend.
 */
export async function sendSoapRequest(url: string, soapAction: string, xmlBody: string): Promise<string> {
  const provider = new A1CertificateProvider();
  
  // Sefaz MT requires a mutual SSL connection using the contributor's digital certificate.
  // In a production HTTPS agent setup:
  const agentOptions: https.AgentOptions = {
    rejectUnauthorized: true,
  };
  
  try {
    const certs = await provider.getCertificateData();
    agentOptions.cert = certs.certPem;
    agentOptions.key = certs.keyPem;
  } catch (err) {
    if (process.env.FISCAL_ENVIRONMENT === 'mock') {
      console.log('[SoapClient Mock] Certificate not configured. Skipping SSL client cert assignment.');
    } else {
      throw err;
    }
  }

  // Standard SOAP 1.2 envelope wrap
  const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    ${xmlBody}
  </soap12:Body>
</soap12:Envelope>`;

  console.log(`[SoapClient] Post to: ${url} | Action: ${soapAction}`);

  // In Mock environment, bypass the real HTTP request to avoid SSL handshakes
  if (process.env.FISCAL_ENVIRONMENT === 'mock') {
    return `<?xml version="1.0" encoding="UTF-8"?>
    <soap12:Envelope xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <nfeResultMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NfeStatusServico4">
          <retConsStatServ versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
            <tpAmb>2</tpAmb>
            <verAplic>MT_4.0.0</verAplic>
            <cStat>107</cStat>
            <xMotivo>Servico em Operacao</xMotivo>
            <cUF>51</cUF>
            <dhRecbto>${new Date().toISOString()}</dhRecbto>
          </retConsStatServ>
        </nfeResultMsg>
      </soap12:Body>
    </soap12:Envelope>`;
  }

  // Using native global fetch which is supported in Node 18+ and Next.js out of the box
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/soap+xml; charset=utf-8',
      'SOAPAction': soapAction,
    },
    body: soapEnvelope,
  });

  if (!response.ok) {
    throw new Error(`Erro na comunicacao SOAP com SEFAZ: HTTP status ${response.status}`);
  }

  return response.text();
}
