# CSC (Código de Segurança do Contribuinte)

O CSC (Código de Segurança do Contribuinte) é um token alfanumérico de uso exclusivo do emitente e da SEFAZ, utilizado para gerar o hash do QR Code da NFC-e, garantindo a sua autenticidade.

## Configuração das Variáveis de Ambiente
O CSC deve ser configurado no arquivo `.env` do servidor (ou configurações de variáveis da Vercel):
* `FISCAL_CSC`: A chave alfanumérica (ex: `12345678-ABCD-EF01-2345-6789ABCDEF01`).
* `FISCAL_CSC_ID`: O identificador do token fornecido pela SEFAZ-MT (ex: `000001`).

*Nota: Utilize valores de homologação durante os testes e valores reais de produção somente quando a aplicação for homologada.*
