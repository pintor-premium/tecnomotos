# Representação Gráfica (DANFE NFC-e)

O DANFE (Documento Auxiliar da Nota Fiscal de Consumidor Eletrônica) é a representação simplificada impressa da NFC-e.

## Requisitos do Layout
O DANFE da TECNOMOTOS inclui:
1. **Dados do Estabelecimento**: Razão Social, CNPJ, Endereço, IE.
2. **Dados da Venda**: Relação de itens com descrição, quantidade, valor unitário e total.
3. **Resumo Financeiro**: Valor total da venda, descontos e forma de pagamento.
4. **Protocolo de Autorização**: Número gerado pela SEFAZ-MT.
5. **Chave de Acesso e QR Code**: URL formatada no padrão 2.00 contendo o token SHA-1 gerado pelo `QrCodePayloadBuilder` para consulta pública direta nos servidores do estado.
