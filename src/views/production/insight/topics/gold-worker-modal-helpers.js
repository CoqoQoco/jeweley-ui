// gold-worker-modal-helpers.js — pure logic ของ modal เจาะข้อมูลช่าง (หมวด "ทองและ Loss") — ห้าม import Vue/i18n
//
// เปิดได้จาก 2 ที่: (a) ตาราง "อันดับช่าง" (แถวมี workerType/workerCode/workerName) (b) ตารางช่างในรายละเอียดแผนก
// (แถวไม่มีประเภทช่าง → อนุมานจากแผนกที่เลือก: setting→80 ช่างฝัง, trim→50 ช่างแต่ง) — แผนก rawPolish/plating/อื่นๆ
// ไม่มีประเภทช่างที่ออก slip จึงไม่เปิด modal (คืน null)
import { LENS_WORKER_TYPE } from './gold-lens-helpers.js'

export const DEPT_WORKER_TYPE = { setting: 80, trim: 50 }

export function resolveWorkerTypeFromDept(deptKey) {
  return DEPT_WORKER_TYPE[deptKey] ?? null
}

// ข้อมูลช่างที่ modal ใช้ — คืน null เมื่อประเภทช่างหาไม่ได้หรือไม่มีรหัสช่าง (ไม่เปิด modal)
export function buildWorkerModalPayload(row, deptKey = null) {
  const workerCode = row?.workerCode
  if (!workerCode) return null
  const workerType = row.workerType != null ? Number(row.workerType) : resolveWorkerTypeFromDept(deptKey)
  if (!Number.isFinite(workerType) || workerType <= 0) return null
  return { workerType, workerCode, workerName: row.workerName || '' }
}

// ช่างที่ derive ประเภทจากแผนกได้ไหม (ใช้กับ actionWhen ของคอลัมน์รหัสช่างในรายละเอียดแผนก)
export function canOpenStageWorker(row, deptKey) {
  return buildWorkerModalPayload(row, deptKey) !== null
}

// filter ที่ modal ส่งให้ source ของมันเอง: ช่วงเวลา/โลหะ/เกณฑ์วันตามหน้า + ล็อกประเภทช่างด้วย lens (config เดิมแปล lens → workerTypes
// ให้เอง) + ช่างคนเดียว (workerCodes) — ค่า workerTypes/workerCodes จากแผงตัวกรองของหน้าไม่ถูกนำมาใช้
export function buildWorkerModalFilter(pageFilter, worker) {
  const lens = Object.keys(LENS_WORKER_TYPE).find((key) => LENS_WORKER_TYPE[key] === worker.workerType) || 'all'
  return { ...pageFilter, lens, workerTypes: [], workerCodes: [worker.workerCode] }
}

// patch ของ filter ทั้งหน้า (gold filter) เมื่อกด "ตั้งเป็นตัวกรองทั้งหน้า" — workerTypes ในแผงตัวกรองเป็น string
export function buildWorkerFilterPatch(worker) {
  return { workerTypes: [String(worker.workerType)], workerCodes: [worker.workerCode] }
}
