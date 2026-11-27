const fmt = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' })
export const formatPrice = (n: number) => fmt.format(n)