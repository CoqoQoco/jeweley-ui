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
    planLinkNoPermission: 'ต้องมีสิทธิ์แก้ไขงานผลิตหรือดูภาพรวมผู้บริหารจึงเปิดรายละเอียดได้',

    trendCardsTitle: 'พัฒนาการงานค้างแยกแผนก',
    trendCardsHint: 'คลิกการ์ดเพื่อดูงานเข้า-ออกของแผนกนั้นด้านล่าง',
    trendCardRange: 'ต้นช่วง {start} → ปลายช่วง {end}',
    trendCardSelectedTag: 'กำลังดูรายละเอียด ↓',
    trendPointWeek: 'สัปดาห์ถึง {date}: {wip} ใบ',
    trendPointMonth: 'เดือน {date}: {wip} ใบ',
    trendPointStart: 'ต้นช่วง {date}',
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
    trendColNet: 'สุทธิ',

    leadTimeTitle: 'เวลาผลิตรายแผนก',
    leadTimeColDept: 'แผนก',
    leadTimeColShareHeader: 'สัดส่วน',
    leadTimeColStandard: 'มาตรฐาน',
    leadTimeStandardDraftChip: 'ร่าง',
    leadTimeColMedianTotal: 'ค่ากลาง (รวม)',
    leadTimeColWait: 'รอ',
    leadTimeColWork: 'ทำ',
    leadTimeColP90: 'P90',
    leadTimeColVsStandard: 'เทียบมาตรฐาน',
    leadTimeChipPass: 'ผ่าน',
    leadTimeChipOver: 'เกิน {percent}%',
    leadTimeColExited: 'ใบที่ออก',
    leadTimeColAbnormal: 'ค้างนานผิดปกติ',
    leadTimeColCurrentWaiting: 'รออยู่ตอนนี้',
    leadTimeColTrend: 'แนวโน้ม',
    leadTimeDaysUnit: 'วัน',
    leadTimeDetailTitle: 'แนวโน้ม lead time แผนก {name}',
    leadTimeSeriesMedian: 'ค่ากลาง',
    leadTimeSeriesP90: 'P90',
    leadTimeSeriesStandard: 'มาตรฐาน',
    leadTimeSeriesWait: 'รอ',
    leadTimeSeriesWork: 'ทำ',
    leadTimeSelectHint: 'คลิกแถวในตารางเพื่อดูแนวโน้มแผนกนั้น',
    leadTimeNoSplitDataTip: 'ยังไม่มีข้อมูลแยกรอ/ทำ — ระบบเริ่มบันทึกเวลารับงานตั้งแต่ {date}',
    leadTimeNoSplitDataTipUnknown: 'ยังไม่มีข้อมูลแยกรอ/ทำ — เริ่มบันทึกหลังอัปเดตระบบ',
    leadTimeChartNoWaitWorkHint: 'ยังไม่มีข้อมูลแยกรอ/ทำในช่วงที่เลือก — ระบบเพิ่งเริ่มบันทึกเวลารับงานแยกรอ/ทำ',
    planUnit: 'ใบ',

    capacityTitle: 'ผลต่อกำลังการผลิต',
    capacityColNow: 'ตอนนี้',
    capacityColAtStandard: 'ถ้าได้ตามมาตรฐาน',
    capacityTotalLeadDays: 'เวลาผลิตรวม (วัน)',
    capacityThroughput: 'กำลังผลิต (ใบ/เดือน)',
    capacityBottleneck: 'คอขวด',
    capacityDeptTableTitle: 'รายละเอียดแยกแผนก',
    capacityColDeptExited: 'ใบที่ออก',
    capacityColDeptExitedPerDay: 'ออกจริง (ใบ/วัน)',
    capacityColDeptMedianTotal: 'เวลาจริง (ค่ากลาง)',
    capacityColDeptStandard: 'มาตรฐาน',
    capacityColDeptAtStandardPerDay: 'ถ้าได้ตามมาตรฐาน (ใบ/วัน)',
    capacityBottleneckChip: 'คอขวด',

    abnormalDwellTitle: 'ใบที่อยู่ในแผนกนานผิดปกติ',
    abnormalDwellColDays: 'อยู่ในแผนก (วัน)',
    abnormalDwellColStandard: 'มาตรฐาน',
    abnormalDwellFilterChip: 'กรองเฉพาะแผนก {name}',
    abnormalDwellClearFilter: 'ล้างตัวกรองแผนก',
    abnormalDwellStaleExcludedNote: 'ไม่รวมใบงานที่ไม่ขยับสถานะเกิน 180 วัน — ดูได้ที่ตาราง "ใบงานค้าง" ด้านบน',

    standardsButton: 'กำหนดมาตรฐาน',
    standardsPanelTitle: 'กำหนดมาตรฐานเวลาผลิต',
    standardsReadOnlyNote: 'ดูค่ามาตรฐานปัจจุบันได้ทุกคน — ต้องมีสิทธิ์แก้ไขมาตรฐานจึงจะเปลี่ยนค่าได้',
    standardsReferenceText: 'ค่ากลางจริง {median} วัน · P90 {p90} วัน',
    standardsRemarkLabel: 'หมายเหตุการเปลี่ยนแปลง',
    standardsRemarkPlaceholder: 'เช่น ปรับตามข้อมูลไตรมาสล่าสุด',
    standardsRemarkRequired: 'กรุณาระบุหมายเหตุก่อนบันทึก',
    standardsSaveBtn: 'บันทึกมาตรฐาน',
    standardsCancelDraftBtn: 'ยกเลิกร่าง',
    standardsSaveSuccess: 'บันทึกมาตรฐานสำเร็จ',
    standardsHistoryLink: 'ประวัติ',
    standardsHistoryTitle: 'ประวัติมาตรฐาน แผนก{name}',
    standardsHistoryColDate: 'วันที่มีผล',
    standardsHistoryColDays: 'จำนวนวัน',
    standardsHistoryColBy: 'ผู้บันทึก',
    standardsHistoryColRemark: 'หมายเหตุ',
    standardsHistoryEmpty: 'ยังไม่มีประวัติการเปลี่ยนมาตรฐาน'
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
    STAGE_OVER_STANDARD: 'แผนก{deptKey}ใช้เวลาเฉลี่ย {medianDays} วัน เกินมาตรฐาน {standardDays} วัน อยู่ {percent}%',
    STAGE_ABNORMAL_DWELL: 'มีใบงานค้างในแผนก{deptKey}นานผิดปกติ {count} ใบ (เกิน {thresholdDays} วัน)',
    STAGE_WAIT_DOMINANT: 'แผนก{deptKey}เวลาส่วนใหญ่หมดไปกับการรอ {waitDays} วัน เทียบเวลาทำจริง {workDays} วัน (รอ {waitShare}% ของเวลาทั้งหมด)',
    FC_STAGE_LEADTIME_RISING: 'เวลาผลิตแผนก{deptKey}มีแนวโน้มเพิ่มขึ้นจาก {fromDays} เป็น {toDays} วัน ในช่วง {buckets} รอบล่าสุด',
    ACT_REDUCE_WAIT: 'ลดเวลารอในแผนก{deptKey} เช่น จัดคิวงานใหม่หรือเพิ่มกำลังคน',
    ACT_REVIEW_ABNORMAL: 'ตรวจสอบใบงานที่ค้างนานผิดปกติ {count} ใบ',

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
    WIP_DEPT_GROWING: 'แผนกที่งานค้างโตเร็ว',
    STAGE_OVER_STANDARD: 'เวลาผลิตเกินมาตรฐาน',
    STAGE_ABNORMAL_DWELL: 'ค้างนานผิดปกติ',
    STAGE_WAIT_DOMINANT: 'เวลาส่วนใหญ่หมดไปกับการรอ',
    FC_STAGE_LEADTIME_RISING: 'แนวโน้มเวลาผลิตเพิ่มขึ้น'
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
    filterCustomRange: 'กำหนดวันเริ่มต้น-สิ้นสุดเอง แทนปุ่มลัด 1M/3M/6M/1Y',

    STAGE_OVER_STANDARD: 'เทียบค่ากลางเวลาที่ใช้จริงในแผนกกับมาตรฐานที่ตั้งไว้\nด่วนเมื่อเกินมาตรฐาน ≥50%',
    STAGE_ABNORMAL_DWELL: 'ใบงานที่อยู่ในแผนกนานเกินเกณฑ์ผิดปกติ (หลายเท่าของมาตรฐาน) ตอนนี้',
    STAGE_WAIT_DOMINANT: 'เวลารอ (ยังไม่มีใครทำ) มากกว่าเวลาทำงานจริงในแผนกนี้\nด่วนเมื่อสัดส่วนรอสูงมาก',
    FC_STAGE_LEADTIME_RISING: 'ประมาณการจากแนวโน้มค่ากลางเวลาผลิตที่เพิ่มขึ้นต่อเนื่องหลายช่วงล่าสุด',

    leadTimeTitle: 'เวลารอ (สถานะ 49/59/69/79/89/94) เทียบเวลาทำจริง (สถานะ 50/60/70/80/90/95)\nแผนกออกแบบนับเป็นเวลาทำทั้งหมด',
    leadTimeColDept: 'แผนกที่ใบงานอยู่ในตอนนี้ (7 แผนกหลักของสายการผลิต)',
    leadTimeColStandard: 'จำนวนวันมาตรฐานที่ตั้งไว้ต่อแผนก (รวมเวลารอ+ทำ) · ชิป "ร่าง" = กำลังดูค่าที่ยังไม่บันทึก',
    leadTimeColMedianTotal: 'ค่ากลาง (median) ของเวลาที่ใบงานอยู่ในแผนกนี้ทั้งหมด (รอ+ทำ)',
    leadTimeColWait: 'เวลารอ — นับจากสถานะ 49/59/69/79/89/94 (ยังไม่มีใครทำ)',
    leadTimeColWork: 'เวลาทำจริง — นับจากสถานะ 50/60/70/80/90/95',
    leadTimeColP90: '90% ของใบงานใช้เวลาไม่เกินนี้ — ทนต่อรายที่นานผิดปกติได้ดีกว่าค่ากลาง',
    leadTimeColVsStandard: 'ค่ากลางเทียบมาตรฐาน — ผ่าน = อยู่ในเกณฑ์ · เกิน % = เกินมาตรฐานเท่าไหร่',
    leadTimeColExited: 'จำนวนใบงานที่ออกจากแผนกนี้ในช่วงที่เลือก (ใช้คำนวณค่ากลาง/P90)',
    leadTimeColAbnormal: 'ใบงานที่ค้างอยู่ในแผนกนี้นานผิดปกติ ณ ตอนนี้ (ไม่ใช่ของช่วงที่เลือก)\nคลิกตัวเลขเพื่อดูรายชื่อด้านล่าง',
    leadTimeColCurrentWaiting: 'จำนวนใบงานที่อยู่ในสถานะรอของแผนกนี้ ณ ตอนนี้ (ไม่ใช่ของช่วงที่เลือก)',
    leadTimeColTrend: 'ค่ากลางเวลาผลิตของแผนกนี้ในแต่ละช่วงย่อยย้อนหลัง',
    leadTimeColShare: 'แถบเข้ม = สัดส่วนเวลารอ · แถบอ่อน = สัดส่วนเวลาทำจริง ของแถวนี้',
    leadTimeDetailChart: 'เส้นทึบ = ค่ากลาง · เส้นประ = P90 · เส้นระดับ = มาตรฐาน · แท่ง = งานเข้า/ออก',

    capacityTitle: 'เปรียบเทียบผลลัพธ์ถ้าทุกแผนกทำได้ตามมาตรฐานที่ตั้งไว้ กับสถานการณ์จริงตอนนี้',
    capacityModelExplanation: 'กำลังผลิตวัดจากจำนวนใบที่ออกจากแผนกจริงต่อวัน · ถ้าแผนกใช้เวลาเกินมาตรฐาน คาดว่าเร่งให้ได้ตามมาตรฐานจะปล่อยงานได้มากขึ้นตามสัดส่วน เวลาจริง ÷ มาตรฐาน · คอขวด = แผนกที่ปล่อยงานได้น้อยที่สุด',

    abnormalDwellColDays: 'จำนวนวันที่ใบงานอยู่ในแผนกนี้ต่อเนื่อง นับถึงวันนี้',
    abnormalDwellColStandard: 'มาตรฐานเวลาของแผนกนี้ — ใบนี้อยู่นานเกินหลายเท่าของค่านี้',

    standardsButton: 'ตั้งจำนวนวันมาตรฐานต่อแผนก ใช้เป็นเกณฑ์เทียบทั้งหน้านี้',
    standardsReferenceText: 'ค่ากลาง/P90 จริงจากข้อมูลช่วงที่เลือก ช่วยตัดสินใจตั้งมาตรฐาน'
  }
}
