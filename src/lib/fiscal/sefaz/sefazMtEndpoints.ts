export interface SefazEndpoints {
  authorization: string;
  authorizationReturn: string;
  consultation: string;
  status: string;
  inutilization: string;
  events: string;
}

export const SEFAZ_MT_ENDPOINTS: {
  homologation: SefazEndpoints;
  production: SefazEndpoints;
} = {
  homologation: {
    authorization: 'https://homologacao.sefaz.mt.gov.br/nfcews/services/NfeAutorizacao4',
    authorizationReturn: 'https://homologacao.sefaz.mt.gov.br/nfcews/services/NfeRetAutorizacao4',
    consultation: 'https://homologacao.sefaz.mt.gov.br/nfcews/services/NfeConsulta4',
    status: 'https://homologacao.sefaz.mt.gov.br/nfcews/services/NfeStatusServico4',
    inutilization: 'https://homologacao.sefaz.mt.gov.br/nfcews/services/NfeInutilizacao4',
    events: 'https://homologacao.sefaz.mt.gov.br/nfcews/services/RecepcaoEvento4',
  },
  production: {
    authorization: 'https://nfce.sefaz.mt.gov.br/nfcews/services/NfeAutorizacao4',
    authorizationReturn: 'https://nfce.sefaz.mt.gov.br/nfcews/services/NfeRetAutorizacao4',
    consultation: 'https://nfce.sefaz.mt.gov.br/nfcews/services/NfeConsulta4',
    status: 'https://nfce.sefaz.mt.gov.br/nfcews/services/NfeStatusServico4',
    inutilization: 'https://nfce.sefaz.mt.gov.br/nfcews/services/NfeInutilizacao4',
    events: 'https://nfce.sefaz.mt.gov.br/nfcews/services/RecepcaoEvento4',
  },
};
