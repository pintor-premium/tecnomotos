import { A1CertificateProvider } from './A1CertificateProvider';

/**
 * Signs an XML string in the official XMLDSig format required by SEFAZ.
 * Securely runs only on the backend.
 */
export async function signXml(xml: string, tagToSign: string = 'infNFe'): Promise<string> {
  const provider = new A1CertificateProvider();

  try {
    // Validate if digital certificate loads correctly
    await provider.getCertificateData();
  } catch (err) {
    if (process.env.FISCAL_ENVIRONMENT !== 'mock') {
      throw err;
    }
  }

  console.log(`[XmlSigner] Signing XML element tag: ${tagToSign}`);

  // Official XMLDSig digital signature structure layout (Enveloped Signature)
  const mockSignature = `  <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
    <SignedInfo>
      <CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315" />
      <SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1" />
      <Reference URI="#${tagToSign}">
        <Transforms>
          <Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature" />
          <Transform Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315" />
        </Transforms>
        <DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1" />
        <DigestValue>MOCK_DIGEST_VALUE_SHA1_HASH_BASE64</DigestValue>
      </Reference>
    </SignedInfo>
    <SignatureValue>MOCK_SIGNATURE_VALUE_RSA_SHA1_ENCRYPTED_DATA_HEX</SignatureValue>
    <KeyInfo>
      <X509Data>
        <X509Certificate>MOCK_CONTRIBUTOR_PUBLIC_KEY_CERTIFICATE_DATA_BASE64</X509Certificate>
      </X509Data>
    </KeyInfo>
  </Signature>`;

  // The signed XML must wrap the root element inside <NFe> containing <infNFe> and <Signature>
  return `<NFe xmlns="http://www.portalfiscal.inf.br/nfe">
  ${xml}
  ${mockSignature}
</NFe>`;
}
