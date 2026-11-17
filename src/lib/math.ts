// Precise Decimal Math Helpers using Integer Paisa / Fixed Precision
// Avoids 0.1 + 0.2 !== 0.3 IEEE floating point errors

export function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function round3(num: number): number {
  return Math.round((num + Number.EPSILON) * 1000) / 1000;
}

export function toPaisa(rupees: number): number {
  return Math.round(rupees * 100);
}

export function fromPaisa(paisa: number): number {
  return round2(paisa / 100);
}

export function calcGst(taxable: number, gstRate: number, isInterstate: boolean) {
  const taxablePaisa = toPaisa(taxable);
  const totalTaxPaisa = Math.round((taxablePaisa * gstRate) / 100);
  
  if (isInterstate) {
    return {
      taxable: fromPaisa(taxablePaisa),
      cgst: 0,
      sgst: 0,
      igst: fromPaisa(totalTaxPaisa),
      total: fromPaisa(taxablePaisa + totalTaxPaisa),
    };
  } else {
    // 50% CGST, 50% SGST
    const halfTaxPaisa = Math.round(totalTaxPaisa / 2);
    const sgstPaisa = totalTaxPaisa - halfTaxPaisa; // perfectly balance odd paisa
    return {
      taxable: fromPaisa(taxablePaisa),
      cgst: fromPaisa(halfTaxPaisa),
      sgst: fromPaisa(sgstPaisa),
      igst: 0,
      total: fromPaisa(taxablePaisa + totalTaxPaisa),
    };
  }
}
