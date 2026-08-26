import api from '@/axios/axios-helper.js'

export const BREAKDOWN_SETTING_DEFAULT = {
  goldLossPercent: 12,
  settingDiamondRate: 15,
  settingStoneRate: 25,
  alloyFactor18K: 0.24,
  alloyFactor14K: 0.41,
  alloyFactor9K: 0.625,
  alloyRateYgWgUsd: 0.6,
  alloyRatePgUsd: 2.0
}

export async function getBreakdownSetting() {
  try {
    const data = await api.jewelry.get('PrintLayout/breakdown')
    if (!data || !data.layoutJson) return { ...BREAKDOWN_SETTING_DEFAULT }
    const saved = JSON.parse(data.layoutJson)
    return { ...BREAKDOWN_SETTING_DEFAULT, ...saved }
  } catch {
    return { ...BREAKDOWN_SETTING_DEFAULT }
  }
}

export async function saveBreakdownSetting(obj) {
  await api.jewelry.post('PrintLayout/breakdown', { layoutJson: JSON.stringify(obj) })
}
