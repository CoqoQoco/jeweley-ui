import api from '@/axios/axios-helper.js'

export const BREAKDOWN_SETTING_DEFAULT = {
  goldLossPercent: 12,
  settingDiamondRate: 15,
  settingStoneRate: 25
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
