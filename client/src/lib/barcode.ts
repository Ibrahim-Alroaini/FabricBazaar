export const generateBarcode = (): string => {
  const patterns = [
    "||||| |||| ||||",
    "|||| ||| |||||",
    "||| |||| ||||||",
    "|||| ||| |||| ||",
    "|| |||| ||||| |",
    "||| || ||| ||||",
    "|||| || ||| |||",
    "|| ||| |||| |||"
  ];
  
  return patterns[Math.floor(Math.random() * patterns.length)];
};

export const generateQRCode = (data: string): string => {
  // In a real implementation, you would use a QR code library
  // For now, return a placeholder pattern
  return `QR:${data}`;
};

export const validateBarcode = (barcode: string): boolean => {
  return /^[\|\s]+$/.test(barcode) && barcode.length > 10;
};
