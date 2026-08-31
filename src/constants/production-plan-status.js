/**
 * production-plan-status.js
 * Mirrors jewelry-api ProductionPlanStatus.cs
 * (jewelry.Model/Constant/ProductionPlanStatus.cs)
 */
export const ProductionPlanStatus = {
  Designed: 10,
  WaitCasting: 49,
  Casting: 50,
  WatingScrubb: 59,
  Scrubb: 60,
  WaitGems: 69,
  Gems: 70,
  WaitEmbedd: 79,
  Embedd: 80,
  WaitCVD: 84,
  CVD: 85,
  WaitPlated: 89,
  Plated: 90,
  WaitPrice: 94,
  Price: 95,
  Completed: 100,
  Melted: 500
}

/**
 * สถานะ WO ที่เลือกได้ในหน้า "สร้างใบเบิกผสมทอง" (plan-gold) — ทุกสถานะยกเว้น
 * Completed(100) และ Melted(500)
 *
 * เหตุผลที่ไม่กรองแค่ Designed(10): backend (ProductionPlanCostService.CreateGoldCost)
 * รองรับ 2 เส้นทาง — Designed จะถูกย้ายเป็น Casting ผ่าน ProductionPlanTransfer,
 * ส่วนสถานะระหว่างทาง (WaitCasting..Price) จะเข้า AppendMissingGoldDetailIfNeeded() แทน
 * มีแต่ Completed ที่ตกท่อเงียบ (ไม่ error แต่ไม่ทำอะไร) ส่วน Melted คืองานที่ถูกหลอมทิ้งไปแล้ว
 * จึงตัดออกทั้งคู่ ไม่ใช่กรองเหลือแค่ Designed
 */
export const GOLD_SLIP_SELECTABLE_STATUSES = Object.values(ProductionPlanStatus).filter(
  (status) => status !== ProductionPlanStatus.Completed && status !== ProductionPlanStatus.Melted
)
