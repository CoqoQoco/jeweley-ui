/**
 * gold-loss-tang-calc.js
 * Pure functions for Gold Loss ช่างแต่ง (stage 50) aggregate slip calculation.
 * Rounding: Math.round(x * 1e4) / 1e4  === MidpointRounding.ToPositiveInfinity for 4dp
 *           Math.round(x * 1e2) / 1e2  === MidpointRounding.ToPositiveInfinity for 2dp
 *
 * allowedLoss uses jobReturnedSum (job returned only, excludes extra returned lines)
 * net = returnedTotal - issuedTotal  (negative when returned < issued)
 *
 * Verified: issuedTotal=131.42 (jobIssuedSum), jobReturnedSum=103.33, extraReturnedSum=26.37
 *   → returnedTotal=129.70, rawLoss=1.72, allowedLoss=round4(103.33×3/100)=3.0999,
 *     diffLoss=round4(3.0999-1.72)=1.3799, money=round2(1.3799)×40=1.38×40=55.20,
 *     net=129.70-131.42=-1.72
 */

/**
 * Round to 4 decimal places (ToPositiveInfinity)
 * @param {number} value
 * @returns {number}
 */
export function round4(value) {
  return Math.round(value * 1e4) / 1e4
}

/**
 * Round to 2 decimal places (ToPositiveInfinity)
 * @param {number} value
 * @returns {number}
 */
export function round2(value) {
  return Math.round(value * 1e2) / 1e2
}

/**
 * Calculate aggregate gold loss totals for tang slip.
 *
 * @param {Array} selectedJobs - jobs selected by user (each has goldWeightSend, goldWeightCheck)
 * @param {Array} issuedLines - additional issued lines [{name, weight}]
 * @param {Array} returnedLines - additional returned lines [{name, weight}]
 * @param {number|string} lossPercent - allowed loss percentage
 * @param {number|string} pricePerGram - price per gram
 * @returns {{ issuedTotal, returnedTotal, rawLoss, net, allowedLoss, diffLoss, money }}
 */
export function calcGoldLossTang(selectedJobs, issuedLines, returnedLines, lossPercent, pricePerGram) {
  const jobsArray = Array.isArray(selectedJobs) ? selectedJobs : []
  const issuedArray = Array.isArray(issuedLines) ? issuedLines : []
  const returnedArray = Array.isArray(returnedLines) ? returnedLines : []

  const lossPercentNum = parseFloat(lossPercent) || 0
  const pricePerGramNum = parseFloat(pricePerGram) || 0

  const jobIssuedSum = jobsArray.reduce((sum, j) => sum + (parseFloat(j.goldWeightSend) || 0), 0)
  const extraIssuedSum = issuedArray.reduce((sum, l) => sum + (parseFloat(l.weight) || 0), 0)
  const issuedTotal = jobIssuedSum + extraIssuedSum

  const jobReturnedSum = jobsArray.reduce((sum, j) => sum + (parseFloat(j.goldWeightCheck) || 0), 0)
  const extraReturnedSum = returnedArray.reduce((sum, l) => sum + (parseFloat(l.weight) || 0), 0)
  const returnedTotal = jobReturnedSum + extraReturnedSum

  const rawLoss = issuedTotal - returnedTotal

  const net = returnedTotal - issuedTotal

  const allowedLoss = round4(jobReturnedSum * lossPercentNum / 100)

  const diffLoss = round4(allowedLoss - rawLoss)

  const money = round2(diffLoss) * pricePerGramNum

  return {
    issuedTotal,
    returnedTotal,
    rawLoss,
    net,
    allowedLoss,
    diffLoss,
    money
  }
}

/**
 * Format a signed number: +1.2345 or -1.2345
 * @param {number} val
 * @param {number} decimals
 * @returns {string}
 */
export function fmtSign(val, decimals = 4) {
  if (val == null) return '0.0000'
  const v = Number(val)
  const abs = Math.abs(v).toFixed(decimals)
  if (v > 0) return `+${abs}`
  if (v < 0) return `-${abs}`
  return abs
}

/**
 * Format number with 2 decimal places + thousand separator
 * @param {number} val
 * @returns {string}
 */
export function fmt2(val) {
  if (val == null) return '0.00'
  return Number(val).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * Format number with 4 decimal places
 * @param {number} val
 * @returns {string}
 */
export function fmt4(val) {
  if (val == null) return '0.0000'
  return Number(val).toFixed(4)
}
