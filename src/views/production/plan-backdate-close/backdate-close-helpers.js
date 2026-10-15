const COPY_SUFFIX = /\s*-\s*copy(\s*\(\d+\))?/gi
const PDF_EXT = /\.pdf\b/gi
const BROWSER_DUP_SUFFIX = /\s*\(\d+\)/g
const JOB_WITH_SPACES = /^\d+\s*-\s*\d+$/

export const REASON_CODES = [
  'NOT_FOUND',
  'ALREADY_COMPLETED',
  'MELTED',
  'CVD',
  'DUPLICATE',
  'INVALID_FORMAT'
]

export function parseJobNumbers(text) {
  if (!text) return { jobs: [], duplicateCount: 0 }

  const cleaned = String(text).replace(PDF_EXT, '').replace(COPY_SUFFIX, '').replace(BROWSER_DUP_SUFFIX, '')
  const seen = new Set()
  const jobs = []
  let duplicateCount = 0

  const push = (raw) => {
    const job = raw.replace(/\s*-\s*/g, '-').trim()
    if (!job) return
    if (seen.has(job)) {
      duplicateCount += 1
      return
    }
    seen.add(job)
    jobs.push(job)
  }

  cleaned.split(/\r?\n/).forEach((line) => {
    line.split(/[,;\t]/).forEach((segment) => {
      const part = segment.trim()
      if (!part) return
      if (JOB_WITH_SPACES.test(part)) {
        push(part)
      } else {
        part.split(/\s+/).forEach(push)
      }
    })
  })

  return { jobs, duplicateCount }
}

export function summarizePreview(items = []) {
  const byReason = {}
  let closable = 0
  items.forEach((item) => {
    if (item.canClose) {
      closable += 1
    } else {
      const code = item.reasonCode || 'UNKNOWN'
      byReason[code] = (byReason[code] || 0) + 1
    }
  })
  return { total: items.length, closable, skipped: items.length - closable, byReason }
}

export function filterPreview(items = [], mode = 'all') {
  if (mode === 'closable') return items.filter((item) => item.canClose)
  if (mode === 'skipped') return items.filter((item) => !item.canClose)
  return items
}

export function getClosableIds(items = []) {
  return items.filter((item) => item.canClose && item.id != null).map((item) => item.id)
}

export function buildClosePayload(items, remark) {
  return { planIds: getClosableIds(items), remark: String(remark || '').trim() }
}

export function formatJobNumber(item) {
  if (!item || item.woNumber == null || item.woNumber === '') return item?.wo || ''
  return `${item.wo}-${item.woNumber}`
}
