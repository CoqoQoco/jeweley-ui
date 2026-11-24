const firstValue = (value) => (Array.isArray(value) ? value[0] : value)

// query ของ /oauth/authorize เป็น snake_case ตามมาตรฐาน OAuth (API redirect มาแบบเดิม) — รับ camelCase ด้วยเผื่อส่งต่อจากที่อื่น
const pick = (query, snake, camel) => {
  const value = firstValue(query?.[snake] ?? query?.[camel])
  return value == null ? '' : String(value)
}

export function buildConsentRequest(query = {}) {
  return {
    responseType: pick(query, 'response_type', 'responseType'),
    clientId: pick(query, 'client_id', 'clientId'),
    redirectUri: pick(query, 'redirect_uri', 'redirectUri'),
    scope: pick(query, 'scope', 'scope'),
    state: pick(query, 'state', 'state'),
    codeChallenge: pick(query, 'code_challenge', 'codeChallenge'),
    codeChallengeMethod: pick(query, 'code_challenge_method', 'codeChallengeMethod'),
    resource: pick(query, 'resource', 'resource')
  }
}

export function isConsentRequestComplete(request) {
  return !!(request?.clientId && request?.redirectUri)
}

const isAvailable = (scope) => scope.available !== false

export function buildInitialChecked(scopes = []) {
  const checked = {}
  scopes.forEach((scope) => {
    checked[scope.code] = isAvailable(scope) && (!!scope.required || !!scope.defaultChecked)
  })
  return checked
}

export function buildApprovedScopes(scopes = [], checked = {}) {
  return scopes
    .filter((scope) => isAvailable(scope) && (scope.required || checked[scope.code]))
    .map((scope) => scope.code)
}

export function splitScopesByKind(scopes = []) {
  const groups = { module: [], data: [] }
  scopes.forEach((scope) => {
    const key = String(scope.kind || '').toUpperCase() === 'DATA' ? 'data' : 'module'
    groups[key].push(scope)
  })
  return groups
}

// 400 = คำขอไม่ถูกต้อง/หมดอายุ · 503 = ระบบยังไม่เปิดใช้ · 401 = session หมด (axios-helper พาไป login แล้วกลับหน้านี้เอง)
export function resolveErrorState(error) {
  const status = error?.response?.status
  if (status === 400) return 'invalid'
  if (status === 503) return 'unavailable'
  if (status === 401) return 'session'
  return 'unknown'
}

export function extractRedirectUrl(response) {
  const url = response?.redirectUrl
  return typeof url === 'string' && url ? url : ''
}

export function isFramed(win = window) {
  try {
    return win.top !== win.self
  } catch {
    return true
  }
}

// host เต็ม (รวม port) ของ redirect URI ทุกตัว ไม่ซ้ำ — parse ไม่ได้หรือ host ว่าง (custom scheme เช่น com.app:/cb) ให้แสดง URI ดิบ
export function getRedirectHosts(redirectUris = []) {
  const hosts = (Array.isArray(redirectUris) ? redirectUris : []).map((uri) => {
    try {
      return new URL(uri).host || String(uri)
    } catch {
      return String(uri)
    }
  })
  return [...new Set(hosts)]
}

// redirectUrl ที่ API คืนมาต้องขึ้นต้นด้วย redirectUri ที่ตรวจแล้วตอน consent เท่านั้น ไม่งั้นห้ามพาไป
export function isSafeRedirect(redirectUrl, redirectUri) {
  return !!redirectUrl && !!redirectUri && String(redirectUrl).startsWith(String(redirectUri))
}

// ผลหลัง Approve/Deny: redirectUrl ว่าง/null (เช่น Deny ของ client ที่ยังไม่ verified) = แสดงสถานะในหน้าเองโดยไม่ redirect
// มี redirectUrl แต่ไม่ขึ้นต้นด้วย redirectUri ที่ตรวจแล้ว = ผิดปกติ ห้ามไป
export function resolveFinishResult(response, redirectUri) {
  const url = extractRedirectUrl(response)
  if (!url) return { ok: true, redirectUrl: '' }
  if (!isSafeRedirect(url, redirectUri)) return { ok: false, redirectUrl: '' }
  return { ok: true, redirectUrl: url }
}

// ข้อความสถานะหลังอนุญาต/ปฏิเสธ: อ้างปุ่ม "กลับไปที่แอป" ได้เฉพาะเมื่อมี redirectUrl (มีปุ่มจริง)
export function resolveDoneMessageKey(state, redirectUrl) {
  const base = state === 'approved' ? 'approved' : 'denied'
  return redirectUrl ? `${base}Body` : `${base}DoneBody`
}
