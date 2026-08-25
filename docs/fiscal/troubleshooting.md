# Resolução de Problemas (Troubleshooting)

Guia para solução de problemas e rejeições fiscais da SEFAZ-MT.

## 1. Rejeições Comuns da SEFAZ
* **Rejeição 203: Emissor não habilitado para emissão de NF-e**: O CNPJ informado não está credenciado na SEFAZ-MT para emissão de NFC-e. Verifique se o credenciamento está ativo.
* **Rejeição 461: Informado percentual de Gás Natural menor que o permitido**: Ocorre quando o NCM do produto refere-se a combustíveis e as tags específicas não foram detalhadas.
* **Rejeição 778: Informado NCM inexistente**: O código NCM de 8 dígitos cadastrado no produto não está presente na tabela oficial de NCMs da receita federal. Corrija o NCM no cadastro de produtos.

## 2. Erros de Certificado
* **Erro: Certificado ausente ou expirado**: Certifique-se de que a string Base64 informada em `FISCAL_CERTIFICATE_BASE64` contém o arquivo pfx completo e de que a senha em `FISCAL_CERTIFICATE_PASSWORD` está correta.
