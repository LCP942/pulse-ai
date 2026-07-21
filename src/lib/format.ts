/**
 * Prices are whole USD amounts everywhere in the app; cents only appear if a
 * tier ever carries a fractional price, in which case both digits render
 * rather than a raw `$79.5` interpolation.
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: Number.isInteger(price) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(price)
}
