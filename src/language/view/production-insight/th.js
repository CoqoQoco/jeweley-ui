export default {
  filter: {
    button: 'ตัวกรอง',
    title: 'ตัวกรองข้อมูล',
    globalLabel: 'ใช้กับทุกหมวด',
    apply: 'ใช้ตัวกรอง',
    clearAll: 'ล้างทั้งหมด',
    chipDimmedHint: 'ไม่มีผลกับหมวดนี้'
  },

  nav: {
    ariaLabel: 'เมนูหมวดย่อยผลิต',
    wip: 'งานค้างและคอขวด',
    delivery: 'ส่งงานตรงเวลา',
    capacity: 'กำลังการผลิต',
    gold: 'ทองและ Loss',
    workers: 'ช่างและค่าแรง',
    materials: 'วัตถุดิบที่กระทบการผลิต'
  },

  status: {
    critical: 'วิกฤต',
    warning: 'ต้องระวัง',
    ok: 'ปกติ'
  },

  section: {
    problems: 'ปัญหาที่เกิดแล้ว',
    forecasts: 'คาดการณ์ปัญหาที่จะเกิด',
    actions: 'วิธีแก้ / สิ่งที่ควรทำ'
  },

  findingEmpty: 'ไม่พบปัญหา',
  actionEmpty: 'ยังไม่มีวิธีแก้ที่แนะนำ',
  relatedPrefix: 'แก้ปัญหา:',

  ownerRole: {
    deptHead: 'หัวหน้าแผนก',
    planner: 'ผู้วางแผนผลิต',
    productionManager: 'ผู้จัดการฝ่ายผลิต',
    goldControl: 'ควบคุมทอง'
  },

  wip: {
    filterSectionTitle: 'เฉพาะหมวด "งานค้างและคอขวด"',
    filterDept: 'แผนก',
    filterStaleDays: 'ไม่ขยับเกิน (วัน)',
    filterRiskWindowDays: 'เตือนล่วงหน้า (วัน)',
    flowTitle: 'งานเข้า-ออกแต่ละแผนก (90 วัน)',
    flowInflow: 'งานเข้า',
    flowOutflow: 'งานออก',
    flowNet: 'สุทธิ',
    stalePlansTitle: 'ใบงานค้าง',
    dueRiskTitle: 'งานเสี่ยงเลยกำหนด',
    dueRiskModeLabel: 'มุมมอง',
    dueRiskModeOverdue: 'เลยกำหนด',
    dueRiskModeDueSoon: 'ครบกำหนดใน {days} วัน',
    dueRiskColDueDate: 'ครบกำหนดส่ง',
    dueRiskColDaysToDue: 'เหลือ (วัน)',
    colLastAction: 'อัปเดตล่าสุด',
    colWorkers: 'ช่าง',
    lastActionCreated: 'สร้างใบงาน'
  },

  // code -> ข้อความเต็ม (พร้อม params) — ใช้กับ insight-tab-layout prop i18nPrefix (default namespace นี้)
  rules: {
    WIP_STALE: 'งานค้างไม่ขยับนานเกินกำหนด {count} ใบ ({percent}% จากงานเปิดอยู่ {openCount} ใบ)',
    WIP_OVERDUE: 'งานเลยกำหนดส่งแล้ว {count} ใบ ({percent}% จากงานเปิดอยู่ {openCount} ใบ)',
    WIP_DEPT_STALE_TOP: 'แผนก{deptKey}มีงานค้างมากที่สุด {count} ใบ ({share}% ของงานค้างทั้งหมด)',
    WIP_MELTED_OPEN: 'งานหลอมที่ยังเปิดอยู่ {count} ใบ',
    FC_BECOMING_STALE: 'คาดว่าจะมีงานค้างเพิ่มอีก {count} ใบ ภายใน {days} วันข้างหน้า',
    FC_DUE_SOON_AT_RISK: 'งานที่ครบกำหนดส่งใน {days} วัน แต่ยังอยู่ขั้นต้น มีความเสี่ยงเลยกำหนด {count} ใบ',
    FC_BOTTLENECK: 'แผนก{deptKey}มีงานเข้า {inflow} ออก {outflow} (สุทธิ {net}) เสี่ยงเป็นคอขวด',
    ACT_CLOSE_STALE: 'ตรวจสอบและเร่งปิดงานค้างไม่ขยับ {count} ใบ',
    ACT_PRIORITIZE_DUE: 'จัดลำดับความสำคัญงานเลยกำหนด {overdue} ใบ และใกล้ครบกำหนด {dueSoon} ใบ',
    ACT_STAGE_SLA: 'กำหนด SLA ให้ชัดเจนสำหรับแผนก{deptKey}',
    ACT_CLOSE_MELTED: 'ปิดงานหลอมที่ค้างอยู่ {count} ใบ',

    // หมวดที่ยังไม่ implement — ใช้ code ชั่วคราวคู่กับ severity 'info' แสดงเป็น bullet ข้อความล้วน
    // (รอ API จริงของแต่ละหมวดแล้วเปลี่ยน code เป็นของจริงพร้อม params)
    DELIVERY_PLACEHOLDER_OVERDUE: 'เลยกำหนดส่ง',
    DELIVERY_PLACEHOLDER_DUE_SOON: 'ครบกำหนดใน 14 วันแต่ยังอยู่ขั้นต้น',
    CAPACITY_PLACEHOLDER_BELOW_AVG: 'ปิดงานเดือนนี้ต่ำกว่าค่าเฉลี่ย',
    CAPACITY_PLACEHOLDER_MONTH_END_FORECAST: 'ประมาณการปิดงานสิ้นเดือน',
    GOLD_PLACEHOLDER_OVER_ALLOWED_WORKER: 'ช่างที่เสียทองเกินเกณฑ์',
    GOLD_PLACEHOLDER_UNRETURNED_CASTING: 'เล่มหล่อที่ยังไม่คืนทอง',
    GOLD_PLACEHOLDER_RISING_TREND: 'ช่างที่ % loss สูงขึ้น 3 เดือนติด',
    WORKERS_PLACEHOLDER_NO_WAGE: 'รายการที่ไม่มีค่าแรง',
    WORKERS_PLACEHOLDER_RISING_COST_PER_PIECE: 'ค่าแรงต่อชิ้นสูงขึ้น',
    MATERIALS_PLACEHOLDER_GEM_LOW_STOCK: 'พลอยใกล้หมดเทียบงานที่รอคัดพลอย',
    MATERIALS_PLACEHOLDER_NEGATIVE_GOLD: 'ทองวัตถุดิบในระบบติดลบ'
  },

  // code -> ป้ายสั้น ไม่มี param — ใช้แสดง "แก้ปัญหา: ..." ใต้แต่ละ action
  codeLabel: {
    WIP_STALE: 'งานค้างไม่ขยับ',
    WIP_OVERDUE: 'งานเลยกำหนดส่ง',
    WIP_DEPT_STALE_TOP: 'แผนกที่ค้างมากที่สุด',
    WIP_MELTED_OPEN: 'งานหลอมค้าง',
    FC_BECOMING_STALE: 'แนวโน้มงานค้างเพิ่ม',
    FC_DUE_SOON_AT_RISK: 'เสี่ยงเลยกำหนดส่ง',
    FC_BOTTLENECK: 'คอขวดการผลิต'
  },

  placeholder: {
    message: 'กำลังจัดทำ — ยังดูข้อมูลได้ที่หน้าเดิมครับ',
    reportTitle: 'ข้อมูลอยู่ที่หน้าเดิม',
    link: {
      delivery: 'ไปที่แดชบอร์ดงานผลิต',
      capacity: 'ไปที่แดชบอร์ดงานผลิต',
      gold: 'ไปที่แดชบอร์ด Gold Loss',
      workers: 'ไปที่รายงานค่าแรงช่าง',
      materials: 'ไปที่แดชบอร์ดคลังอัญมณี'
    }
  }
}
