# NFC-e (Nota Fiscal de Consumidor Eletrônica - Modelo 65)

Este documento descreve o funcionamento e requisitos para emissão de NFC-e na TECNOMOTOS.

## 1. Regras Gerais de Validação
Antes de enviar qualquer documento à SEFAZ-MT, o sistema executa o `FiscalValidationService`. Ele impede o envio caso as seguintes pendências sejam detectadas:
* **NCM Inexistente/Inválido**: O produto deve possuir um NCM de 8 dígitos cadastrado.
* **IE/CNPJ**: Dados cadastrais da empresa emitente devem estar completos.
* **CRT/CSOSN**: Emitente enquadrado no Simples Nacional (CRT 1) deve declarar obrigatoriamente tags de CSOSN nos itens. Caso enquadrado no Regime Normal (CRT 3), deve informar CST.
* **CSC e CSC ID**: O token de autenticação de QR Code gerado no site da SEFAZ deve estar configurado nas variáveis do servidor.

## 2. Numeração Sequencial Segura
A sequência numérica fiscal da TECNOMOTOS é incrementada de forma atômica no banco de dados utilizando a função PostgreSQL `get_and_increment_nfce_number()`. Isso previne concorrência, impedindo que dois checkouts paralelos recebam a mesma numeração e gerem rejeição na SEFAZ.
