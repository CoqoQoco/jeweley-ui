import { roundHalfUp } from '@/services/utils/money.js'
import { isAlloyDescription } from '@/services/helper/breakdown-alloy-detect.js'

const DIAMOND_PATTERN = /diamond|เพชร/i
const KARAT_PATTERN = /(\d{1,2})\s*K\b/i

function round2(value) {
  return roundHalfUp(value, 2)
}

function groupOf(t) {
  return String(t?.nameGroup || '').toLowerCase()
}

// alloy-ish ไม่คิด Gold Loss ซ้ำ — ใช้กติกาเดียวกับ breakdown-pdf-builder เดิม
function shouldApplyGoldLoss(t) {
  if (isAlloyDescription(t.nameDescription)) return false
  return t.applyGoldLoss ?? groupOf(t) === 'gold'
}

export function isStoneAsOptions(item) {
  return item?.stoneAsOptions !== false
}

// '18K' จาก productionTypeSize ก่อน แล้วค่อยหาจากคำอธิบายแถวทอง — ไม่เจอคืน ''
export function resolveItemKarat(item) {
  const fromSize = String(item?.productionTypeSize || '').trim().match(/^(\d{1,2})\s*K$/i)
  if (fromSize) return `${Number(fromSize[1])}K`
  const rows = Array.isArray(item?.priceTransactions) ? item.priceTransactions : []
  for (const t of rows) {
    if (groupOf(t) !== 'gold' || isAlloyDescription(t.nameDescription)) continue
    const m = String(t.nameDescription || '').match(KARAT_PATTERN)
    if (m) return `${Number(m[1])}K`
  }
  return ''
}

// ทุกชิ้นกะรัตเดียวกัน → '18K GOLD' ไม่งั้น 'GOLD'
export function resolveGoldGroupLabel(items) {
  const karats = new Set((items || []).map(resolveItemKarat))
  if (karats.size === 1) {
    const [only] = [...karats]
    if (only) return `${only} GOLD`
  }
  return 'GOLD'
}

/**
 * คำนวณโมเดลต่อชิ้นของเอกสาร Break Down Price (ไม่ผูก Vue — ใช้ร่วม PDF/Excel)
 * ทุกค่าที่พิมพ์ปัด half-up 2 ตำแหน่ง และยอดรวมคิดจากค่าที่ปัดแล้ว เพื่อให้ลูกค้ากดเครื่องคิดเลขจากกระดาษได้เลขตรงกัน
 *
 * ค่า default ค่าแรง (laborAllSettingUsd / laborWcpfrUsd) เป็น USD — แปลงเป็นสกุลใบเสนอราคาด้วย usdRate/currencyMultiplier
 * (usdRate ไม่ส่ง = ใช้ currencyMultiplier เหมือน alloy-calculator ซึ่งใบ USD จะได้ค่า USD ตรงๆ)
 * ค่าฝังรวม "All Setting" ใช้ D + max(# of pc ของพลอยสี) เมื่อโหมดตัวเลือก และ D + ผลรวม pc เมื่อไม่ใช่
 * แต่ถ้ามีแถว Setting/Embed จริงจะใช้ค่าที่กรอกแทน
 */
export function buildBreakdownPriceItem(item, config = {}) {
  const multiplier = Number(config.currencyMultiplier) || 1
  const usdRate = Number(config.usdRate) || multiplier
  const profitPercent = Number.isFinite(Number(config.profitPercent)) ? Number(config.profitPercent) : 15
  const goldLossPercent = Number(config.goldLossPercent ?? 12)
  const laborAllSettingUsd = Number(config.laborAllSettingUsd ?? 0.5)
  const laborWcpfrUsd = Number(config.laborWcpfrUsd ?? 11)

  const toDisplay = (thb) => (Number(thb) || 0) / multiplier
  const usdToDisplay = (usd) => round2(((Number(usd) || 0) * usdRate) / multiplier)

  const rows = Array.isArray(item?.priceTransactions) ? item.priceTransactions : []
  const goldList = rows.filter((t) => groupOf(t) === 'gold')
  const gemList = rows.filter((t) => groupOf(t) === 'gem')
  const embedList = rows.filter((t) => ['embed', 'setting'].includes(groupOf(t)))
  const workList = rows.filter((t) => groupOf(t) === 'worker')
  const otherList = rows.filter((t) => !['gold', 'gem', 'embed', 'setting', 'worker'].includes(groupOf(t)))

  // GOLD
  let weightSum = 0
  let valueSum = 0
  const goldPrices = []
  goldList.forEach((g) => {
    const qtyWeight = Number(g.qtyWeight) || 0
    const raw = shouldApplyGoldLoss(g) ? qtyWeight * (1 + goldLossPercent / 100) : qtyWeight
    const weight = round2(raw)
    const weightPrice = round2(toDisplay(g.qtyWeightPrice))
    const unitPrice = round2(toDisplay(g.qtyPrice))
    weightSum += weight
    goldPrices.push(weightPrice)
    valueSum += round2((Number(g.qty) || 0) * unitPrice + weight * weightPrice)
  })
  const goldWeight = round2(weightSum)
  const goldValue = round2(valueSum)
  const goldPricePerGram =
    goldList.length === 1 ? goldPrices[0] : goldWeight > 0 ? round2(goldValue / goldWeight) : 0
  const gold = { weight: goldWeight, pricePerGram: goldPricePerGram, value: goldValue }

  // DIAMOND / STONE
  const buildGem = (t) => {
    const pcs = Number(t.qty) || 0
    const ct = round2(Number(t.qtyWeight) || 0)
    const charge = round2(toDisplay(t.totalPrice))
    const given = round2(toDisplay(t.qtyWeightPrice))
    const pricePerCt = given > 0 ? given : ct > 0 ? round2(charge / ct) : 0
    return { name: t.nameDescription || '-', pcs, ct, pricePerCt, charge }
  }
  const gems = gemList.map(buildGem)
  const diamondRows = gems.filter((_, i) => DIAMOND_PATTERN.test(gemList[i].nameDescription || ''))
  const stones = gems.filter((_, i) => !DIAMOND_PATTERN.test(gemList[i].nameDescription || ''))

  const diamondCharge = round2(diamondRows.reduce((s, d) => s + d.charge, 0))
  const diamondCt = round2(diamondRows.reduce((s, d) => s + d.ct, 0))
  const diamond = {
    pcs: diamondRows.reduce((s, d) => s + d.pcs, 0),
    ct: diamondCt,
    pricePerCt:
      diamondRows.length === 1 ? diamondRows[0].pricePerCt : diamondCt > 0 ? round2(diamondCharge / diamondCt) : 0,
    charge: diamondCharge
  }

  // LABOR
  const labor = []
  const pushLaborRow = (t) => {
    const total = round2(toDisplay(t.totalPrice))
    const unit = round2(toDisplay(t.qtyPrice))
    labor.push({ name: t.nameDescription || '-', pricePerPc: unit > 0 ? unit : total, total, isDefault: false })
  }
  embedList.forEach(pushLaborRow)
  if (!embedList.length) {
    const stonePcs = stones.map((s) => s.pcs)
    const stonePcsBasis = isStoneAsOptions(item)
      ? stonePcs.reduce((m, v) => Math.max(m, v), 0)
      : stonePcs.reduce((s, v) => s + v, 0)
    const unit = usdToDisplay(laborAllSettingUsd)
    labor.push({
      name: 'All Setting',
      pricePerPc: unit,
      total: round2(unit * (diamond.pcs + stonePcsBasis)),
      isDefault: true
    })
  }
  workList.forEach(pushLaborRow)
  if (!workList.length) {
    const unit = usdToDisplay(laborWcpfrUsd)
    labor.push({ name: 'W.C.P.F.R', pricePerPc: unit, total: unit, isDefault: true })
  }
  otherList.forEach(pushLaborRow)
  const laborTotal = round2(labor.reduce((s, l) => s + l.total, 0))

  // TOTALS
  const qty = Number(item?.qty) || 1
  const profitFactor = 1 + profitPercent / 100
  const buildTotal = (stoneCharge) => {
    const K = round2(stoneCharge)
    const N = round2(gold.value + diamond.charge + K + laborTotal)
    const O = round2(N * profitFactor)
    const Q = round2(O * qty)
    return { K, N, O, P: qty, Q }
  }

  const asOptions = isStoneAsOptions(item) && stones.length > 0
  const options = asOptions ? stones.map((stone) => ({ stone, ...buildTotal(stone.charge) })) : []
  const single = asOptions ? null : buildTotal(stones.reduce((s, st) => s + st.charge, 0))

  return {
    qty,
    karat: resolveItemKarat(item),
    gold,
    diamond,
    stones,
    labor,
    laborTotal,
    mode: asOptions ? 'options' : 'single',
    options,
    single
  }
}

export function buildBreakdownPriceModel(items, config = {}) {
  return (items || []).map((item) => buildBreakdownPriceItem(item, config))
}

// จำนวนแถวของบล็อกชิ้นหนึ่ง = max(แถวพลอย, แถวค่าแรง + 1 แถว Total Labor Price, 1)
export function getBlockRowCount(model) {
  return Math.max(model.stones.length, model.labor.length + 1, 1)
}
