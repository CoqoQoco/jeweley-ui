/**
 * API mock สำหรับ E2E
 *
 * local API ต่อ DB production -- ห้ามมี request ใดหลุดไป API จริง ดังนั้น installApiMocks ดัก
 * catch-all '**\/*' แล้วแยกตาม origin:
 *   - origin ของ dev server (baseURL)  → ปล่อยผ่าน (Vite module / asset) ยกเว้น path /jwapi/*
 *     (Vite proxy ไป API จริง) ซึ่งจัดการเหมือน API: mock ตอบ / ไม่มี → abort + unmocked
 *   - origin อื่นทั้งหมด (API :2001, printer :7003, VITE_JEWELRY_API_URL, Azure ฯลฯ)
 *       · path ตรงกับ mock ที่ลงทะเบียน → fulfill ด้วย JSON
 *       · ไม่ตรง → route.abort() + บันทึกลง ctrl.unmocked (ต้อง assert ว่างท้ายเทส)
 *
 * แอปเรียกแบบ POST/GET `<api>/<Controller>/<Action>` (ไม่มี prefix /api) เช่น Invoice/Get
 * key ของ mock คือ path ไม่มี slash นำหน้า ไม่สนตัวพิมพ์ เช่น 'Invoice/Get'
 *
 * ค่าของ mock: object (JSON 200) | { status, body } | (request, ctx) => ค่าสองแบบแรก
 */

export const SHELL_DEFAULTS = {
  // ข้อมูลที่ app shell (layout / dashboard) ยิงตอน mount
  'Ticket/CountOpen': { count: 0 },
  'Ticket/CountMyUnread': { count: 0 },
  'Ticket/MyTicket': { data: [], total: 0 },
  'Permission/MyPermissions': [],
  'ProductionPrePlan/WaitingCount': { count: 0 },
  'Notification/MyCount': { total: 0, list: [] },
  'Announcement/Feed': { data: [], total: 0 }
}

const norm = (p) => p.replace(/^\/+/, '').replace(/\/+$/, '').toLowerCase()

export const DEV_PROXY_PREFIX = 'jwapi/'
const LOOPBACK = new Set(['localhost', '127.0.0.1', '[::1]'])

/** devOrigin: opts.devOrigin > baseURL ของ project > http://localhost:2002 */
export function resolveDevOrigin(optDevOrigin, baseURL) {
  return new URL(optDevOrigin || baseURL || 'http://localhost:2002').origin
}

/** origin ของ dev server -- เทียบ host:port ไม่สน protocol (http/https/ws) และถือ loopback เป็นอันเดียวกัน */
export function isDevOrigin(url, devOrigin) {
  const dev = new URL(devOrigin)
  if (url.port !== dev.port) return false
  if (url.hostname === dev.hostname) return true
  return LOOPBACK.has(url.hostname) && LOOPBACK.has(dev.hostname)
}

/** path บน dev origin ที่ขึ้นต้น /jwapi/ = Vite proxy ไป API จริง -- คืน key ที่ตัด prefix แล้ว หรือ null */
export function devProxyKey(pathname) {
  const key = norm(pathname)
  return key.startsWith(DEV_PROXY_PREFIX) ? key.slice(DEV_PROXY_PREFIX.length) : null
}

async function projectBaseURL() {
  try {
    const { test } = await import('@playwright/test')
    return test.info().project.use.baseURL
  } catch {
    return undefined
  }
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {Object} [mocks]  key = 'Controller/Action'
 * @param {Object} [opts]
 * @param {boolean} [opts.useShellDefaults=true]
 * @param {string} [opts.devOrigin]  default = baseURL ของ project (fallback http://localhost:2002)
 * @returns {Promise<{ calls: Array, unmocked: Array, assertNoLeak: Function, callsTo: Function }>}
 */
export async function installApiMocks(page, mocks = {}, opts = {}) {
  const table = new Map()
  const source = { ...(opts.useShellDefaults === false ? {} : SHELL_DEFAULTS), ...mocks }
  for (const [k, v] of Object.entries(source)) table.set(norm(k), v)

  const ctrl = {
    calls: [],
    unmocked: [],
    callsTo(key) {
      return ctrl.calls.filter((c) => c.key === norm(key))
    },
    assertNoLeak() {
      if (ctrl.unmocked.length) {
        const list = ctrl.unmocked.map((u) => `${u.method} ${u.url}`).join('\n  ')
        throw new Error(`พบ request ที่ไม่ได้ mock (${ctrl.unmocked.length}):\n  ${list}`)
      }
    }
  }

  const devOrigin = resolveDevOrigin(opts.devOrigin, await projectBaseURL())

  await page.route('**/*', async (route) => {
    const request = route.request()
    const url = new URL(request.url())

    if (!/^https?:$/.test(url.protocol)) return route.continue()

    const proxyKey = isDevOrigin(url, devOrigin) ? devProxyKey(url.pathname) : null
    if (isDevOrigin(url, devOrigin) && proxyKey === null) return route.continue()

    // CORS preflight ของ origin อื่น: ตอบรับเองเพื่อให้ request จริงตามมาให้ mock ดัก
    if (request.method() === 'OPTIONS') {
      return route.fulfill({
        status: 204,
        headers: {
          'access-control-allow-origin': request.headers()['origin'] || '*',
          'access-control-allow-methods': '*',
          'access-control-allow-headers': request.headers()['access-control-request-headers'] || '*'
        }
      })
    }

    const key = proxyKey ?? norm(url.pathname)
    const handler = table.get(key)
    if (handler === undefined) {
      ctrl.unmocked.push({ method: request.method(), url: request.url() })
      return route.abort('failed')
    }

    let body = null
    try {
      body = request.postDataJSON()
    } catch {
      body = request.postData()
    }
    ctrl.calls.push({ key, method: request.method(), body, query: url.search })

    let result = typeof handler === 'function' ? await handler(request, { body, url }) : handler
    let status = 200
    if (result && typeof result === 'object' && 'status' in result && 'body' in result) {
      status = result.status
      result = result.body
    }

    await route.fulfill({
      status,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': request.headers()['origin'] || '*' },
      body: JSON.stringify(result)
    })
  })

  return ctrl
}

export default installApiMocks
