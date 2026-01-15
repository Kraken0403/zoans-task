// src/invoices/pdf/utils.ts
import { toWords } from 'number-to-words'

export function formatDate(date?: Date | string | null) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-GB') // DD/MM/YYYY
}

export function formatCurrency(n: number | string) {
  return Number(n).toFixed(2)
}

export function amountInWords(amount: number) {
  const rupees = Math.floor(amount)
  return `${toWords(rupees)} rupees only`
    .replace(/\b\w/g, c => c.toUpperCase())
}
