// ============================================================
// CraveBox – Exact Currency Arithmetic in Integer Pence
// Prevents floating-point precision issues (e.g. 0.1 + 0.2)
// ============================================================

export function poundsToPence(pounds: number): number {
  return Math.round(pounds * 100);
}

export function penceToPounds(pence: number): number {
  return pence / 100;
}

export function formatGBPFromPence(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

export function formatGBP(pounds: number): string {
  return formatGBPFromPence(poundsToPence(pounds));
}

export interface LineItemPricing {
  unitPence: number;
  totalPence: number;
  unitPounds: number;
  totalPounds: number;
}

export function calculateItemPricing(
  basePricePounds: number,
  sizePricePounds: number = 0,
  extras: { price: number }[] = [],
  quantity: number = 1
): LineItemPricing {
  const basePence = poundsToPence(basePricePounds);
  const sizePence = poundsToPence(sizePricePounds);
  const extrasPence = extras.reduce((sum, e) => sum + poundsToPence(e.price), 0);
  
  const unitPence = basePence + sizePence + extrasPence;
  const totalPence = unitPence * Math.max(1, quantity);

  return {
    unitPence,
    totalPence,
    unitPounds: penceToPounds(unitPence),
    totalPounds: penceToPounds(totalPence),
  };
}
