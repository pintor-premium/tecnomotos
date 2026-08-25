# Integração SEFAZ-MT

Detalhamento técnico da comunicação com os servidores da Secretaria de Estado de Fazenda do Mato Grosso (SEFAZ-MT).

## 1. Web Services Utilizados (NFC-e v4.00)
A comunicação ocorre exclusivamente através de requisições HTTPS POST com envelopes SOAP 1.2 direcionados aos endpoints centrais configurados em `SEFAZ_MT_ENDPOINTS`:

* **Autorização**: `https://homologacao.sefaz.mt.gov.br/nfcews/services/NfeAutorizacao4`
* **Retorno Autorização**: `https://homologacao.sefaz.mt.gov.br/nfcews/services/NfeRetAutorizacao4`
* **Inutilização**: `https://homologacao.sefaz.mt.gov.br/nfcews/services/NfeInutilizacao4`
* **Consulta**: `https://homologacao.sefaz.mt.gov.br/nfcews/services/NfeConsulta4`
* **Status de Serviço**: `https://homologacao.sefaz.mt.gov.br/nfcews/services/NfeStatusServico4`
* **Recepção Eventos**: `https://homologacao.sefaz.mt.gov.br/nfcews/services/RecepcaoEvento4`

## 2. Padrão de Comunicação
Toda chamada deve ser assinada digitalmente utilizando certificados padrão ICP-Brasil A1 através do canal HTTPS mútuo (SSL Client Certificate).
