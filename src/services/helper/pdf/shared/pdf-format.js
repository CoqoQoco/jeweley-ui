export function roundToTwo(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0)
}

export function formatPrice(price) {
  if (typeof price !== 'number' || isNaN(price)) return '0.00'
  return price.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

export function numberToWords(num) {
  const units = [
    '',
    'ONE',
    'TWO',
    'THREE',
    'FOUR',
    'FIVE',
    'SIX',
    'SEVEN',
    'EIGHT',
    'NINE',
    'TEN',
    'ELEVEN',
    'TWELVE',
    'THIRTEEN',
    'FOURTEEN',
    'FIFTEEN',
    'SIXTEEN',
    'SEVENTEEN',
    'EIGHTEEN',
    'NINETEEN'
  ]
  const tens = [
    '',
    '',
    'TWENTY',
    'THIRTY',
    'FORTY',
    'FIFTY',
    'SIXTY',
    'SEVENTY',
    'EIGHTY',
    'NINETY'
  ]

  if (num === 0) return 'ZERO'

  function convertLessThanThousand(num) {
    if (num === 0) return ''
    if (num < 20) return units[num]

    const unit = num % 10
    const ten = Math.floor(num / 10) % 10
    const hundred = Math.floor(num / 100) % 10

    let result = ''
    if (hundred > 0) {
      result += units[hundred] + ' HUNDRED'
      if (ten > 0 || unit > 0) result += ' '
    }

    if (ten > 1) {
      result += tens[ten]
      if (unit > 0) result += '-' + units[unit]
    } else {
      result += units[ten * 10 + unit]
    }

    return result
  }

  let words = ''
  const billion = Math.floor(num / 1000000000)
  const million = Math.floor((num % 1000000000) / 1000000)
  const thousand = Math.floor((num % 1000000) / 1000)
  const remainder = num % 1000

  if (billion > 0) {
    words += convertLessThanThousand(billion) + ' BILLION'
    if (million > 0 || thousand > 0 || remainder > 0) words += ' '
  }

  if (million > 0) {
    words += convertLessThanThousand(million) + ' MILLION'
    if (thousand > 0 || remainder > 0) words += ' '
  }

  if (thousand > 0) {
    words += convertLessThanThousand(thousand) + ' THOUSAND'
    if (remainder > 0) words += ' '
  }

  if (remainder > 0) {
    words += convertLessThanThousand(remainder)
  }

  return words
}

export function convertNumberToWords(number, currencyUnit = 'THB') {
  const prefix = currencyUnit ? `(${currencyUnit})` : ''
  const numInWords = prefix + ' ' + numberToWords(Math.floor(number)) + ' ONLY'
  return numInWords
}
