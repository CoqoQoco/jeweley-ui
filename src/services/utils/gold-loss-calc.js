export function calculateGoldLossMetrics(goldWeightSend, goldWeightCheck, lossPercent, goldLossPrice) {
  const send = Number(goldWeightSend) || 0
  const check = Number(goldWeightCheck) || 0
  const pct = Number(lossPercent) || 0
  const price = Number(goldLossPrice) || 0
  const rawLoss = send - check
  const weightLossAllowed = check * (pct / 100)
  const weightLossActual = Math.round((weightLossAllowed - rawLoss) * 10000) / 10000
  const moneyDiff = Math.round(weightLossActual * 100) / 100 * price
  return { weightLossAllowed, weightLossActual, moneyDiff }
}
