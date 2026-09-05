const formatter = new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  maximumFractionDigits: 0,
});

export function formatPrice(amount: number, currency: string = 'KES') {
  if (currency !== 'KES') {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return formatter.format(amount);
}
