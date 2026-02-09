/**
 * decimal.js
 * Helper functions for decimal number operations
 */

/**
 * Format number to decimal with fixed positions
 * @param {number|string} value - The number to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted number string
 */
const formatDecimal = (value, decimals = 2) => {
  if (value === null || value === undefined || value === '') {
    return ''
  }

  const parsedValue = parseFloat(value)
  if (isNaN(parsedValue)) {
    return ''
  }

  return parsedValue.toFixed(decimals)
}

/**
 * Format number to display with thousand separators
 * @param {number|string} value - The number to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @param {string} thousandSeparator - Separator for thousands (default: ',')
 * @param {string} decimalSeparator - Separator for decimal point (default: '.')
 * @returns {string} Formatted number with thousand separators
 */
const formatNumber = (value, decimals = 2, thousandSeparator = ',', decimalSeparator = '.') => {
  if (value === null || value === undefined || value === '') {
    return ''
  }

  const parsedValue = parseFloat(value)
  if (isNaN(parsedValue)) {
    return ''
  }

  const fixed = parsedValue.toFixed(decimals)
  const [intPart, decPart] = fixed.split('.')

  // Format the integer part with thousand separators
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator)

  // Return formatted number with decimal part if it exists
  return decPart ? `${formattedInt}${decimalSeparator}${decPart}` : formattedInt
}

/**
 * Sum an array of numbers with precision
 * @param {Array<number|string>} values - Array of values to sum
 * @param {number} decimals - Number of decimal places for the result (default: 2)
 * @returns {number} The sum with specified precision
 */
const sumDecimal = (values, decimals = 2) => {
  if (!Array.isArray(values)) {
    return 0
  }

  const sum = values.reduce((acc, val) => {
    const num = parseFloat(val)
    return acc + (isNaN(num) ? 0 : num)
  }, 0)

  const factor = Math.pow(10, decimals)
  return Math.round(sum * factor) / factor
}

/**
 * Round a number to specific decimal places
 * @param {number|string} value - Value to round
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {number} Rounded number
 */
const roundDecimal = (value, decimals = 2) => {
  if (value === null || value === undefined || value === '') {
    return 0
  }

  const parsedValue = parseFloat(value)
  if (isNaN(parsedValue)) {
    return 0
  }

  const factor = Math.pow(10, decimals)
  return Math.round(parsedValue * factor) / factor
}

/**
 * Add two numbers with precision
 * @param {number|string} a - First number
 * @param {number|string} b - Second number
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {number} Sum with specified precision
 */
const addDecimal = (a, b, decimals = 2) => {
  const numA = parseFloat(a) || 0
  const numB = parseFloat(b) || 0

  const factor = Math.pow(10, decimals)
  return Math.round((numA + numB) * factor) / factor
}

/**
 * Subtract two numbers with precision
 * @param {number|string} a - First number
 * @param {number|string} b - Second number to subtract from first
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {number} Difference with specified precision
 */
const subtractDecimal = (a, b, decimals = 2) => {
  const numA = parseFloat(a) || 0
  const numB = parseFloat(b) || 0

  const factor = Math.pow(10, decimals)
  return Math.round((numA - numB) * factor) / factor
}

/**
 * Multiply two numbers with precision
 * @param {number|string} a - First number
 * @param {number|string} b - Second number
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {number} Product with specified precision
 */
const multiplyDecimal = (a, b, decimals = 2) => {
  const numA = parseFloat(a) || 0
  const numB = parseFloat(b) || 0

  const factor = Math.pow(10, decimals)
  return Math.round(numA * numB * factor) / factor
}

/**
 * Divide two numbers with precision
 * @param {number|string} a - Numerator
 * @param {number|string} b - Denominator
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {number} Quotient with specified precision or 0 if division by zero
 */
const divideDecimal = (a, b, decimals = 2) => {
  const numA = parseFloat(a) || 0
  const numB = parseFloat(b) || 0

  if (numB === 0) {
    return 0
  }

  const factor = Math.pow(10, decimals)
  return Math.round((numA / numB) * factor) / factor
}

/**
 * Convert string to decimal number
 * @param {string} value - String value to convert
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {number} Converted decimal number
 */
const parseDecimal = (value, decimals = 2) => {
  if (typeof value !== 'string') {
    return roundDecimal(value, decimals)
  }

  // Remove thousand separators and replace decimal separator if needed
  const cleanValue = value.replace(/,/g, '').replace(/\s/g, '')
  const parsedValue = parseFloat(cleanValue)

  if (isNaN(parsedValue)) {
    return 0
  }

  return roundDecimal(parsedValue, decimals)
}

export {
  formatDecimal,
  formatNumber,
  sumDecimal,
  roundDecimal,
  addDecimal,
  subtractDecimal,
  multiplyDecimal,
  divideDecimal,
  parseDecimal
}
