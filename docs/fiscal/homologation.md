# Ambiente de Homologação (Testes SEFAZ)

O ambiente de homologação (`FISCAL_ENVIRONMENT=homologation`) é utilizado para validar a comunicação e assinar documentos com a SEFAZ-MT sem validade jurídica.

## Requisitos
* Variável de ambiente `FISCAL_ENVIRONMENT=homologation`.
* Certificado digital A1 configurado nas variáveis de ambiente da Vercel.
* CSC de homologação obtido no portal da SEFAZ-MT.
* CPF fictício para testes nas notas.
* Produtos com NCM reais válidos.
