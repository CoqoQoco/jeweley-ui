// worker-profile-helpers.js — pure logic ของ "โปรไฟล์ช่างรายบุคคล" (modal เจาะข้อมูลช่าง) ที่ใช้ร่วมกันทั้งหมวด "ทองและ Loss" และ "ช่างและค่าแรง"
// ห้าม import Vue/i18n ที่นี่
//
// ช่าง = { workerType (80 ช่างฝัง / 50 ช่างแต่ง / null = แผนกอื่นที่ไม่มีใบ gold loss), workerCode, workerName, deptKey, employmentType? }
// แท็บย่อยในโปรไฟล์: loss (Loss ทอง — เฉพาะ workerType 80/50) · wages (ค่าแรง) · jobs (ใบงาน: งานที่ยังไม่บันทึกค่าแรง)
//
// เปิดได้จาก: (a) ตาราง "อันดับช่าง" หมวดทอง (แถวมี workerType) (b) ตารางช่างในรายละเอียดแผนกหมวดทอง (อนุมานประเภทจากแผนกที่เลือก — เฉพาะ
// setting→80 / trim→50 เหมือนเดิม) (c) ตารางช่างหมวด "ช่างและค่าแรง" (ทุกแผนก — แผนกที่ไม่มีใบ gold loss ไม่มีแท็บ Loss ทอง)
import { LENS_WORKER_TYPE } from './gold-lens-helpers.js'

export const DEPT_WORKER_TYPE = { setting: 80, trim: 50 }
export const WORKER_TYPE_DEPT = { 80: 'setting', 50: 'trim' }

export const PROFILE_TABS = ['loss', 'wages', 'jobs']
// งานที่ยังไม่บันทึกค่าแรงโชว์สูงสุดกี่แถว (endpoint ไม่มีตัวกรองช่าง → ดึงทั้งแผนกแล้วกรองฝั่งหน้าจอ)
export const UNPAID_JOBS_DISPLAY_LIMIT = 50

export function resolveWorkerTypeFromDept(deptKey) {
  return DEPT_WORKER_TYPE[deptKey] ?? null
}

// ข้อมูลช่างจากตารางหมวดทอง — คืน null เมื่อประเภทช่างหาไม่ได้หรือไม่มีรหัสช่าง (ไม่เปิดโปรไฟล์)
export function buildWorkerModalPayload(row, deptKey = null) {
  const workerCode = row?.workerCode
  if (!workerCode) return null
  const workerType = row.workerType != null ? Number(row.workerType) : resolveWorkerTypeFromDept(deptKey)
  if (!Number.isFinite(workerType) || workerType <= 0) return null
  return { workerType, workerCode, workerName: row.workerName || '', deptKey: WORKER_TYPE_DEPT[workerType] || deptKey || null }
}

// ช่างที่ derive ประเภทจากแผนกได้ไหม (ใช้กับ actionWhen ของคอลัมน์รหัสช่างในรายละเอียดแผนก)
export function canOpenStageWorker(row, deptKey) {
  return buildWorkerModalPayload(row, deptKey) !== null
}

// ข้อมูลช่างจากตารางหมวด "ช่างและค่าแรง" (แถว Workers: code/name/deptKey/employmentType) — ทุกแผนกเปิดได้
export function buildWorkersTablePayload(row) {
  if (!row?.code || !row?.deptKey) return null
  return {
    workerType: resolveWorkerTypeFromDept(row.deptKey),
    workerCode: row.code,
    workerName: row.name || '',
    deptKey: row.deptKey,
    employmentType: row.employmentType || null
  }
}

// แท็บที่ช่างคนนี้มีให้ดู (ซ่อนแท็บที่ไม่เกี่ยวข้อง ไม่แสดงเปล่า) — ช่างฝัง/ช่างแต่ง: Loss ทอง ก่อน · แผนกอื่น: ค่าแรง ก่อน
export function resolveProfileTabs(worker) {
  const tabs = []
  if (worker?.workerType) tabs.push('loss')
  if (worker?.deptKey) tabs.push('wages', 'jobs')
  return tabs
}

export function resolveFirstProfileTab(worker) {
  return resolveProfileTabs(worker)[0] || null
}

// filter ที่แท็บ Loss ทองส่งให้ source ของมันเอง: ช่วงเวลา/metal/เกณฑ์วันตามหน้า + ล็อกประเภทช่างด้วย lens (config ของหมวดทองแปล lens →
// workerTypes ให้เอง) + ช่างคนเดียว (workerCodes) — ค่า workerTypes/workerCodes จากแผงตัวกรองของหน้าไม่ถูกนำมาใช้
// defaults = ค่าที่หน้าหมวดอื่น (เช่นช่างและค่าแรง) ไม่มี: metal / olderThanDays
export function buildWorkerModalFilter(pageFilter, worker, defaults = {}) {
  const lens = Object.keys(LENS_WORKER_TYPE).find((key) => LENS_WORKER_TYPE[key] === worker.workerType) || 'all'
  return {
    ...defaults,
    ...pageFilter,
    metal: pageFilter?.metal || defaults.metal,
    olderThanDays: pageFilter?.olderThanDays ?? defaults.olderThanDays,
    lens,
    workerTypes: [],
    workerCodes: [worker.workerCode]
  }
}

// filter ของเพื่อนร่วมประเภท (ทุกคนในประเภทเดียวกัน ไม่จำกัดรหัส) — ใช้คำนวณอันดับเมื่อหน้าไม่มีรายชื่อช่างโหลดอยู่แล้ว
export function buildPeersFilter(modalFilter) {
  return { ...modalFilter, workerCodes: [] }
}

// patch ของ filter ทั้งหน้า (gold filter) เมื่อกด "ตั้งเป็นตัวกรองทั้งหน้า" — workerTypes ในแผงตัวกรองเป็น string
export function buildWorkerFilterPatch(worker) {
  return { workerTypes: [String(worker.workerType)], workerCodes: [worker.workerCode] }
}

// ---- อันดับ Loss ในเพื่อนร่วมประเภท (จาก Gold.workers ที่โหลดอยู่แล้ว) ----

function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  if (!sorted.length) return null
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

// อันดับ 1 = %Loss สูงสุดในประเภท · คืน null เมื่อเทียบไม่ได้ (เพื่อนน้อยกว่า 2 คน / ไม่เจอช่างในรายชื่อ / ไม่มี %Loss)
export function computeLossRank(peers, workerType, workerCode) {
  const same = (peers || []).filter((p) => Number(p.workerType) === Number(workerType) && p.lossPercent != null)
  if (same.length < 2) return null
  const ranked = [...same].sort((a, b) => b.lossPercent - a.lossPercent || String(a.workerCode).localeCompare(String(b.workerCode)))
  const index = ranked.findIndex((p) => p.workerCode === workerCode)
  if (index === -1) return null
  const medianPercent = median(same.map((p) => p.lossPercent))
  return { rank: index + 1, total: ranked.length, lossPercent: ranked[index].lossPercent, medianPercent, deltaPercent: ranked[index].lossPercent - medianPercent }
}

// ---- ค่าแรง (Workers row + WorkerMonthly) ----

// สถิติค่าแรงของช่าง: avg/เดือน = ค่าแรงรวม ÷ จำนวนเดือน(bucket) ของ WorkerMonthly · สัดส่วนค่าแรงในแผนก = ค่าแรงช่าง ÷ ค่าแรงรวมของทุกแถวแผนกเดียวกัน
// (คำนวณฝั่งหน้าจอ — API ให้ shareOfDeptJobs ซึ่งเป็นสัดส่วน "จำนวนงาน" ไม่ใช่ค่าแรง)
export function computeWageStats(row, deptRows, monthlySeries) {
  if (!row) return null
  const months = (monthlySeries || []).length
  const deptWages = (deptRows || []).reduce((sum, r) => sum + (r.wages || 0), 0)
  return {
    wages: row.wages ?? null,
    jobs: row.jobs ?? null,
    plans: row.plans ?? null,
    wagePerJob: row.wagePerJob ?? null,
    avgWagesPerMonth: months > 0 && row.wages != null ? row.wages / months : null,
    deptWageSharePercent: deptWages > 0 && row.wages != null ? (row.wages / deptWages) * 100 : null,
    shareOfDeptJobs: row.shareOfDeptJobs ?? null,
    isRateOutlier: !!row.isRateOutlier,
    isConcentrated: !!row.isConcentrated,
    employmentType: row.employmentType || null
  }
}

// แถว Workers ของช่างคนนี้ (รหัส + แผนก — ช่างคนเดียวอาจทำหลายแผนก)
export function findWorkerRow(workers, worker) {
  return (workers || []).find((w) => w.code === worker.workerCode && w.deptKey === worker.deptKey) || null
}

// ---- body ของ request ที่แท็บค่าแรง/ใบงานยิง (ช่วงเวลาตามหน้า, metal ถูกเติมที่ store ถ้าไม่ระบุ) ----

export function buildWorkersRequestBody(pageFilter, worker, isoOrNull) {
  return { start: isoOrNull(pageFilter.start), end: isoOrNull(pageFilter.end), departmentKeys: [worker.deptKey] }
}

export function buildWorkerMonthlyRequestBody(pageFilter, worker, isoOrNull) {
  return { code: worker.workerCode, deptKey: worker.deptKey, start: isoOrNull(pageFilter.start), end: isoOrNull(pageFilter.end) }
}

// UnpaidPieceJobs ไม่มีตัวกรองช่างฝั่ง server (Request: Metal/Start/End/DepartmentKeys + paging) → ดึงทั้งแผนก (take 0 = ทุกแถว) แล้วกรองด้วยรหัสช่างฝั่งหน้าจอ
export function buildUnpaidJobsRequestBody(pageFilter, worker, isoOrNull) {
  return { start: isoOrNull(pageFilter.start), end: isoOrNull(pageFilter.end), departmentKeys: [worker.deptKey], take: 0, skip: 0, sort: [] }
}

export function filterUnpaidJobsForWorker(items, worker, limit = UNPAID_JOBS_DISPLAY_LIMIT) {
  const mine = (items || []).filter((item) => item.workerCode === worker.workerCode)
  return { total: mine.length, rows: mine.slice(0, limit).map((row, index) => ({ ...row, rowKey: `${row.planId}-${index}` })) }
}
