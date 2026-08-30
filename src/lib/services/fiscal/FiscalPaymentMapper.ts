const paymentMap: Record<string, string> = {
  cash: '01',
  dinheiro: '01',
  pix: '17',
  card: '03',
  credit_card: '03',
  credito: '03',
  cartao_credito: '03',
  debit_card: '04',
  debito: '04',
  cartao_debito: '04',
  other: '99',
  outros: '99'
};

export function mapFiscalPaymentMethod(paymentMethod: string) {
  const normalized = paymentMethod.trim().toLowerCase();
  const code = paymentMap[normalized];

  if (!code) {
    throw new Error(`Forma de pagamento fiscal nao mapeada: ${paymentMethod}.`);
  }

  return code;
}
