export interface NfceItemInput {
  name: string;
  price: number;
  quantity: number;
  ncm: string;
  cest?: string;
  cfop: string;
  cst?: string;
  csosn?: string;
  barcode?: string;
  origin: number;
  unit: string;
}

export interface NfceOrderInput {
  id: string;
  series: string;
  number: string;
  cnpj: string;
  companyName: string;
  stateRegistration: string;
  crt: string; // 1: Simples Nacional, 2: Simples Nac. - Excesso, 3: Regime Normal
  uf: string;
  city: string;
  ibgeCityCode: string;
  customerName?: string;
  customerDocument?: string; // CPF or CNPJ
  items: NfceItemInput[];
  paymentMethod: 'cash' | 'card' | 'pix' | 'other';
}

export class NfceXmlBuilder {
  /**
   * Generates a structured XML payload compliant with NFe/NFC-e Layout 4.00.
   */
  buildNfceXml(order: NfceOrderInput): { xml: string; accessKey: string } {
    const environmentCode = process.env.FISCAL_ENVIRONMENT === 'production' ? '1' : '2'; // 1: Produção, 2: Homologação
    const cUF = '51'; // Mato Grosso IBGE code
    const tpImp = '4'; // DANFE NFC-e
    const tpEmis = '1'; // Normal Emission
    const tpAmb = environmentCode;

    // Generate access key
    const yearMonth = new Date()
      .toISOString()
      .substring(2, 7)
      .replace('-', ''); // AAMM format
    const mod = '65'; // NFC-e model
    const seriesPad = order.series.padStart(3, '0');
    const numberPad = order.number.padStart(9, '0');
    
    // Random 8 digit numeric code (cNF)
    const cNF = Math.floor(10000000 + Math.random() * 90000000).toString();
    const keyWithoutDV = `${cUF}${yearMonth}${order.cnpj.replace(/\D/g, '')}${mod}${seriesPad}${numberPad}${tpEmis}${cNF}`;

    // Calculate check digit (cDV) via Module 11
    let sum = 0;
    let weight = 2;
    for (let i = keyWithoutDV.length - 1; i >= 0; i--) {
      sum += parseInt(keyWithoutDV.charAt(i), 10) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    const remainder = sum % 11;
    const cDV = remainder === 0 || remainder === 1 ? 0 : 11 - remainder;
    const accessKey = `${keyWithoutDV}${cDV}`;

    // Compile items xml blocks
    const itemsXml = order.items
      .map((item, idx) => {
        const itemNumber = idx + 1;
        const totalItem = (item.price * item.quantity).toFixed(2);

        // Conditional tax nodes depending on Company CRT (Simples Nacional vs Normal Regime)
        const taxNode =
          order.crt === '1'
            ? `<ICMSSN102>
                <orig>${item.origin}</orig>
                <CSOSN>${item.csosn || '102'}</CSOSN>
               </ICMSSN102>`
            : `<ICMS00>
                <orig>${item.origin}</orig>
                <CST>${item.cst || '00'}</CST>
                <modBC>3</modBC>
                <vBC>${totalItem}</vBC>
                <pICMS>17.00</pICMS>
                <vICMS>${(parseFloat(totalItem) * 0.17).toFixed(2)}</vICMS>
               </ICMS00>`;

        return `      <det nItem="${itemNumber}">
        <prod>
          <cProd>${itemNumber}</cProd>
          <cEAN>${item.barcode && item.barcode.length >= 8 ? item.barcode : 'SEM GTIN'}</cEAN>
          <xProd>${item.name}</xProd>
          <NCM>${item.ncm}</NCM>
          ${item.cest ? `<CEST>${item.cest}</CEST>` : ''}
          <CFOP>${item.cfop}</CFOP>
          <uCom>${item.unit}</uCom>
          <qCom>${item.quantity.toFixed(4)}</qCom>
          <vUnCom>${item.price.toFixed(10)}</vUnCom>
          <vProd>${totalItem}</vProd>
          <cEANTrib>${item.barcode && item.barcode.length >= 8 ? item.barcode : 'SEM GTIN'}</cEANTrib>
          <uTrib>${item.unit}</uTrib>
          <qTrib>${item.quantity.toFixed(4)}</qTrib>
          <vUnTrib>${item.price.toFixed(10)}</vUnTrib>
          <indTot>1</indTot>
        </prod>
        <imposto>
          <ICMS>
            ${taxNode}
          </ICMS>
          <PIS>
            <PISAliq>
              <CST>01</CST>
              <vBC>${totalItem}</vBC>
              <pPIS>1.65</pPIS>
              <vPIS>${(parseFloat(totalItem) * 0.0165).toFixed(2)}</vPIS>
            </PISAliq>
          </PIS>
          <COFINS>
            <COFINSAliq>
              <CST>01</CST>
              <vBC>${totalItem}</vBC>
              <pCOFINS>7.60</pCOFINS>
              <vCOFINS>${(parseFloat(totalItem) * 0.076).toFixed(2)}</vCOFINS>
            </COFINSAliq>
          </COFINS>
        </imposto>
      </det>`;
      })
      .join('\n');

    const totalInvoice = order.items
      .reduce((acc, curr) => acc + curr.price * curr.quantity, 0)
      .toFixed(2);

    const xml = `<infNFe Id="NFe${accessKey}" versao="4.00">
    <ide>
      <cUF>${cUF}</cUF>
      <cNF>${cNF}</cNF>
      <natOp>Venda de mercadoria</natOp>
      <mod>${mod}</mod>
      <serie>${order.series}</serie>
      <nNF>${order.number}</nNF>
      <dhEmi>${new Date().toISOString()}</dhEmi>
      <tpNF>1</tpNF>
      <idDest>1</idDest>
      <cMunFG>${order.ibgeCityCode}</cMunFG>
      <tpImp>${tpImp}</tpImp>
      <tpEmis>${tpEmis}</tpEmis>
      <cDV>${cDV}</cDV>
      <tpAmb>${tpAmb}</tpAmb>
      <finNFe>1</finNFe>
      <indFinal>1</indFinal>
      <indPres>1</indPres>
      <procEmi>0</procEmi>
      <verProc>1.0</verProc>
    </ide>
    <emit>
      <CNPJ>${order.cnpj.replace(/\D/g, '')}</CNPJ>
      <xNome>${order.companyName}</xNome>
      <enderEmit>
        <xLgr>Avenida Brasil</xLgr>
        <nro>1000</nro>
        <xBairro>Centro</xBairro>
        <cMun>${order.ibgeCityCode}</cMun>
        <xMun>${order.city}</xMun>
        <UF>${order.uf}</UF>
        <CEP>78300000</CEP>
        <cPais>1058</cPais>
        <xPais>BRASIL</xPais>
      </enderEmit>
      <IE>${order.stateRegistration.replace(/\D/g, '')}</IE>
      <CRT>${order.crt}</CRT>
    </emit>
    ${
      order.customerDocument
        ? `
    <dest>
      <CPF>${order.customerDocument.replace(/\D/g, '')}</CPF>
      <xNome>${order.customerName || 'Consumidor Final'}</xNome>
      <indIEDest>9</indIEDest>
    </dest>
    `
        : ''
    }
    ${itemsXml}
    <total>
      <ICMSTot>
        <vBC>${totalInvoice}</vBC>
        <vICMS>${(parseFloat(totalInvoice) * 0.17).toFixed(2)}</vICMS>
        <vICMSDeson>0.00</vICMSDeson>
        <vFCP>0.00</vFCP>
        <vBCST>0.00</vBCST>
        <vST>0.00</vST>
        <vFCPST>0.00</vFCPST>
        <vFCPSTRet>0.00</vFCPSTRet>
        <vProd>${totalInvoice}</vProd>
        <vFrete>0.00</vFrete>
        <vSeg>0.00</vSeg>
        <vDesc>0.00</vDesc>
        <vII>0.00</vII>
        <vIPI>0.00</vIPI>
        <vIPIDevol>0.00</vIPIDevol>
        <vPIS>${(parseFloat(totalInvoice) * 0.0165).toFixed(2)}</vPIS>
        <vCOFINS>${(parseFloat(totalInvoice) * 0.076).toFixed(2)}</vCOFINS>
        <vOutro>0.00</vOutro>
        <vNF>${totalInvoice}</vNF>
      </ICMSTot>
    </total>
    <transp>
      <modFrete>9</modFrete>
    </transp>
    <pag>
      <detPag>
        <tPag>${
          order.paymentMethod === 'card'
            ? '03'
            : order.paymentMethod === 'pix'
            ? '17'
            : '01'
        }</tPag>
        <vPag>${totalInvoice}</vPag>
      </detPag>
    </pag>
  </infNFe>`;

    return { xml, accessKey };
  }
}
