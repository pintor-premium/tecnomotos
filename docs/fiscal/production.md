# Ambiente de Produção (Emissão Legal)

O ambiente de produção (`FISCAL_ENVIRONMENT=production`) transmite notas com plena validade jurídica e deve ser operado com extrema cautela.

## Bloqueios de Proteção
Por segurança, a ativação do ambiente de produção está desabilitada nesta fase de fundação.
Qualquer tentativa de requisição no `SefazMtFiscalService` com `FISCAL_ENVIRONMENT=production` lançará um erro imediato para impedir faturamentos acidentais.

## Requisitos futuros para Ativação
Quando a empresa decidir ativar a produção, serão necessários:
1. Credenciamento definitivo como emitente de NFC-e na SEFAZ-MT.
2. Emissão do CSC definitivo de produção.
3. Importação do certificado digital A1 corporativo oficial.
4. Homologação final com o contador da TECNOMOTOS.
