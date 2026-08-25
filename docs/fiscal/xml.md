# Estrutura XML da NFC-e

O XML gerado pela classe `NfceXmlBuilder` segue rigorosamente o layout estabelecido no Manual de Orientação do Contribuinte (MOC) vigente.

## Elementos Principais
* `<infNFe>`: Contém a identificação única do documento fiscal com o atributo `Id="NFe[ChaveDeAcesso]"`.
* `<ide>`: Dados de identificação da nota (série, número, ambiente, data de emissão, etc).
* `<emit>`: Identificação da TECNOMOTOS (CNPJ, Inscrição Estadual, Município e CRT).
* `<dest>`: Bloco opcional para identificação do consumidor (CPF/CNPJ).
* `<det>`: Detalhamento dos itens vendidos, contendo o NCM de 8 dígitos, CFOP e tributação compatível (CSOSN para Simples Nacional, CST para Regime Normal).
* `<total>`: Somatória dos valores da nota e impostos correspondentes.
* `<pag>`: Detalhes sobre a forma de pagamento (Dinheiro, Cartão, PIX, etc).
