export interface CertificateData {
  certPem: string;
  keyPem: string;
}

export abstract class CertificateProvider {
  /**
   * Retrieves decrypted certificate and private key in PEM format.
   * Securely runs only on the server-side backend.
   */
  abstract getCertificateData(): Promise<CertificateData>;
}
