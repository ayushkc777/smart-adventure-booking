export function formatCurrency(amount) {
  return `NPR ${new Intl.NumberFormat('en-NP', {
    maximumFractionDigits: 0,
  }).format(amount)}`
}

export function average(values) {
  if (!values.length) return 0
  return values.reduce((total, value) => total + value, 0) / values.length
}
