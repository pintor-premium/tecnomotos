# Certificado Digital ICP-Brasil A1

Procedimentos de segurança e carregamento do certificado digital A1.

## 1. Armazenamento Seguro
* O arquivo do certificado digital (`.pfx` ou `.p12`) deve ser convertido para uma string **Base64** e salvo na variável de ambiente:
  `FISCAL_CERTIFICATE_BASE64`
* A senha correspondente para extração da chave privada deve ser salva na variável:
  `FISCAL_CERTIFICATE_PASSWORD`
* **IMPORTANTE**: NUNCA envie estes segredos para o frontend nem inclua o arquivo do certificado no repositório do Git.
