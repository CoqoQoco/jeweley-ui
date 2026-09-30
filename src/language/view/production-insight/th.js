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
    filterGrowthThreshold: 'เกณฑ์งานค้างเพิ่มเร็ว (%)',
    filterCustomRangeLabel: 'ช่วงเวลากำหนดเอง',
    rangeAriaLabel: 'เลือกช่วงเวลา',
    flowTitle: 'งานเข้า-ออกแต่ละแผนก (90 วัน)',
    flowTitleRanged: 'งานเข้า-ออกแต่ละแผนก ({range})',
    flowInflow: 'งานเข้า',
    flowOutflow: 'งานออก',
    flowNet: 'สุทธิ',
    asOfTodayNote: 'ณ วันนี้ — ไม่ขึ้นกับช่วงเวลา',
    stalePlansTitle: 'ใบงานค้าง',
    dueRiskTitle: 'งานเสี่ยงเลยกำหนด',
    dueRiskModeLabel: 'มุมมอง',
    dueRiskModeOverdue: 'เลยกำหนด',
    dueRiskModeDueSoon: 'ครบกำหนดใน {days} วัน',
    dueRiskColDueDate: 'ครบกำหนดส่ง',
    dueRiskColDaysToDue: 'เหลือ (วัน)',
    colLastAction: 'อัปเดตล่าสุด',
    colWorkers: 'ช่าง',
    lastActionCreated: 'สร้างใบงาน',
    planLinkTitle: 'เปิดรายละเอียดใบงาน (แท็บใหม่)',
    planLinkNoPermission: 'ต้องมีสิทธิ์แก้ไขงานผลิตจึงเปิดรายละเอียดได้',

    trendCardsTitle: 'พัฒนาการงานค้างแยกแผนก',
    trendCardsHint: 'คลิกการ์ดเพื่อดูงานเข้า-ออกของแผนกนั้นด้านล่าง',
    trendCardRange: 'ต้นช่วง {start} → ปลายช่วง {end}',
    trendCardSelectedTag: 'กำลังดูรายละเอียด ↓',
    trendPointWeek: 'สัปดาห์ถึง {date}: {wip} ใบ',
    trendPointMonth: 'เดือน {date}: {wip} ใบ',
    bucketWeekly: 'รายสัปดาห์',
    bucketMonthly: 'รายเดือน',
    trendTotalLabel: 'รวม',
    trendDetailTitleDept: 'แผนก {name} · {range}',
    trendDetailTitleTotal: 'ภาพรวมทุกแผนก · {range}',
    trendSeriesWip: 'งานค้าง',
    trendSeriesInflow: 'งานเข้า',
    trendSeriesOutflow: 'งานออก',
    trendSummary: {
      inflowGreater: 'เข้า {inflow} · ออก {outflow} · สุทธิ {net} → งานค้างเพิ่มขึ้นเพราะรับงานเข้าเร็วกว่าที่ปิดได้',
      outflowGreater: 'เข้า {inflow} · ออก {outflow} · สุทธิ {net} → งานค้างลดลงเพราะปิดงานได้เร็วกว่าที่รับเข้า',
      equal: 'เข้า {inflow} · ออก {outflow} · สุทธิ {net} → งานเข้าออกสมดุลกัน งานค้างไม่เปลี่ยนแปลงมาก'
    },
    trendTableTitle: 'ตารางเปรียบเทียบแยกแผนก',
    trendColDept: 'แผนก',
    trendColStart: 'ต้นช่วง',
    trendColEnd: 'ปลายช่วง',
    trendColChange: 'เปลี่ยน',
    trendColChangePercent: '%',
    trendColInflow: 'งานเข้า',
    trendColOutflow: 'งานออก',
    trendColNet: 'สุทธิ'
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
    WIP_DEPT_GROWING: 'งานค้างแผนก{deptKey} เพิ่มขึ้น {deltaPercent}% ({startWip}→{endWip}) เกินเกณฑ์ {thresholdPercent}%',

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
    FC_BOTTLENECK: 'คอขวดการผลิต',
    WIP_DEPT_GROWING: 'แผนกที่งานค้างโตเร็ว'
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
  },

  // ข้อความอธิบาย (ⓘ InfoTipGeneric) — พูดกับเจ้าของกิจการตรงๆ สั้น กระชับ ≤2 บรรทัดเท่าที่ทำได้
  help: {
    sectionProblems: 'ตรวจจากข้อมูล ณ วันนี้ ตามกฎที่ตั้งไว้',
    sectionForecasts: 'สิ่งที่จะเกิดถ้าอัตราปัจจุบันยังเหมือนเดิม คำนวณจากแนวโน้มและวันกำหนดส่ง',
    sectionActions: 'ข้อเสนอที่ผูกกับปัญหา/คาดการณ์ด้านบน พร้อมผู้รับผิดชอบ',
    statusMeaning: 'วิกฤต = ด่วน ต้องรีบจัดการ\nต้องระวัง = ควรดูแลเร็วๆ นี้ · ปกติ = ไม่มีปัญหาเร่งด่วน',

    // finding แต่ละ code — วิธีคำนวณ/เกณฑ์ด่วน (ดู resolveHelpKey ใน insight-helpers.js ว่า code ไหนมีบ้าง)
    WIP_STALE: 'ไม่มีการย้ายสถานะเกิน {staleDays} วัน\nด่วนเมื่อ ≥10% ของงานค้างทั้งหมด',
    WIP_OVERDUE: 'เลยวันส่งงานลูกค้าและยังไม่เสร็จ ไม่นับสถานะ เสร็จ/หลอม/รอ CVD/CVD\nด่วนเมื่อ ≥20%',
    WIP_DEPT_STALE_TOP: 'แผนกที่มีจำนวนงานค้างไม่ขยับมากที่สุดในตอนนี้',
    WIP_MELTED_OPEN: 'สถานะหลอมแต่ใบงานยังไม่ถูกปิด',
    WIP_DEPT_GROWING: 'งานค้างปลายช่วงเทียบต้นช่วงเพิ่มเกินเกณฑ์ {thresholdPercent}%\nด่วนเมื่อเกิน 2 เท่าของเกณฑ์',
    FC_BECOMING_STALE: 'ประมาณการจากแนวโน้มที่งานกลายเป็นงานค้างในช่วงที่ผ่านมา ({days} วันข้างหน้า)',
    FC_DUE_SOON_AT_RISK: 'ครบกำหนดใน {days} วันแต่ยังไม่ถึงขั้นขัดชุบ',
    FC_BOTTLENECK: 'แผนกที่งานเข้ามากกว่างานออกมากที่สุดในช่วงที่เลือก',

    rangeControl: 'ช่วงเวลามีผลกับพัฒนาการ งานเข้า-ออก คอขวด และกฎงานค้างเพิ่มเร็ว\nไม่มีผลกับกล่อง ณ วันนี้',

    trendCardsTitle: 'เส้น = จำนวนงานค้างของแผนก ณ สิ้นแต่ละสัปดาห์/เดือน (ไม่นับใบที่ยกเลิก) · เส้นประ = ระดับต้นช่วง\n▲ แดง = เพิ่ม (แย่ลง) · ▼ เขียว = ลด',
    trendDetailChart: 'เส้น = งานค้าง ณ สิ้นแต่ละช่วง · แท่งบวก = งานเข้าแผนก · แท่งลบ = งานออกจากแผนก',

    trendColStart: 'จำนวนงานค้างในแผนกนี้ ณ วันเริ่มต้นช่วงที่เลือก',
    trendColEnd: 'จำนวนงานค้างในแผนกนี้ ณ วันสิ้นสุดช่วงที่เลือก',
    trendColChange: 'ปลายช่วง − ต้นช่วง (จำนวนใบงาน)',
    trendColChangePercent: 'เปลี่ยนคิดเป็นเปอร์เซ็นต์จากต้นช่วง',
    trendColInflow: 'แถวแผนก = ย้ายเข้าแผนกนี้ · แถวรวม = เปิดใบงานใหม่',
    trendColOutflow: 'แถวแผนก = ย้ายออกจากแผนกนี้ · แถวรวม = เสร็จหรือหลอม',
    trendColNet: 'เข้า − ออก · บวก = งานสะสมเพิ่ม',

    departmentWipChart: 'ขยับ ≤30 / 30–180 / >180 วัน นับจากวันที่ย้ายสถานะล่าสุดของใบงาน',
    flowChart: 'งานเข้า = ย้ายเข้าแผนกในช่วงที่เลือก · งานออก = ย้ายออก\nใบงานที่ประวัติเก่ากว่าช่วงอาจถูกนับเป็นงานเข้าเกินจริงเล็กน้อย',

    staleColDays: 'จำนวนวันตั้งแต่อัปเดตล่าสุด',
    staleColLastAction: 'ผู้ที่ย้ายสถานะครั้งล่าสุดและสถานะที่ย้ายไป',
    staleColWorkers: 'ช่างที่รับงานในขั้นตอนล่าสุด',

    dueRiskModeOverdue: 'งานที่เกินวันส่งลูกค้าแล้วและยังไม่เสร็จ',
    dueRiskModeDueSoon: 'งานที่จะครบกำหนดส่งภายใน {days} วันข้างหน้า แต่ยังไม่เสร็จ',

    filterGrowthThreshold: 'ถ้างานค้างปลายช่วงเพิ่มจากต้นช่วงเกิน % นี้ จะแจ้งเป็นปัญหา',
    filterCustomRange: 'กำหนดวันเริ่มต้น-สิ้นสุดเอง แทนปุ่มลัด 1M/3M/6M/1Y'
  }
}
