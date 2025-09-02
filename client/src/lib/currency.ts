export const formatAED = (amount: number): string => {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const parseAED = (amountString: string): number => {
  // Remove currency symbols and parse
  const cleaned = amountString.replace(/[AED\s,]/g, '');
  return parseFloat(cleaned) || 0;
};

export const formatAEDSimple = (amount: number): string => {
  return `AED ${amount.toFixed(2)}`;
};
