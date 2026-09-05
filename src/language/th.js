// ALL
import breadcrumb from './breadcrumb/th.js'
import alerts from './alerts/th.js'
import button from './button/th.js'
import common from './common/th.js'
import sidebar from './sidebar/th.js'

//view
import pickinglist from './view/pickinglist/th.js'
import catalog from './view/catalog/th.js'
import customer from './view/customer/th.js'
import master from './view/master/th.js'
import stock from './view/stock/th.js'
import receiptStock from './view/receipt-stock/th.js'
import productionLang from './view/production/th.js'
import saleLang from './view/sale/th.js'
import moldLang from './view/mold/th.js'
import workerLang from './view/worker/th.js'
import productionCostLang from './view/production-cost/th.js'
import settingLang from './view/setting/th.js'
import reportProductionLang from './view/report-production/th.js'
import ticketLang from './view/ticket/th.js'
import graphLang from './view/graph/th.js'
import downloadsLang from './view/downloads/th.js'
import reportLang from './view/report/th.js'
import printStationLang from './view/print-station/th.js'
import * as mobileLang from './view/mobile/th.js'
export default {
  breadcrumb: { ...breadcrumb },
  alert: { ...alerts },
  button: { ...button },
  common: { ...common },
  sidebar: { ...sidebar },
  setting: { ...settingLang },
  reportProduction: { ...reportProductionLang },
  view: {
    pickinglist: { ...pickinglist },
    catalog: { ...catalog },
    customer: { ...customer },
    master: { ...master },
    receiptStock: { ...receiptStock },
    production: {
      ...productionLang,
      dashboard: {
        title: 'แดชบอร์ดงานผลิต',
        summaryTab: 'สรุปภาพรวม',
        lastUpdate: 'อัปเดตล่าสุด',
        totalPlans: 'แผนงานทั้งหมด',
        allActivePlans: 'แผนงานที่ยังไม่สำเร็จ 100 %',
        inProcess: 'กำลังผลิต',
        currentlyWorking: 'อยู่ระหว่างการดำเนินงาน',
        completedYesterday: 'เสร็จเมื่อวาน',
        yesterdayFinished: 'งานที่เสร็จสิ้นเมื่อวาน',
        overduePlans: 'เกินกำหนด',
        behindSchedule: 'งานที่เกินกำหนดส่ง',
        activeProjects: 'โปรเจคที่ใช้งาน',
        currentlyActive: 'โปรเจคที่กำลังดำเนินการ',
        completedToday: 'เสร็จวันนี้',
        finishedToday: 'งานที่เสร็จสิ้นวันนี้',
        pendingApproval: 'รอการอนุมัติ',
        waitingApproval: 'รอการตรวจสอบอนุมัติ',
        completionRate: 'อัตราการเสร็จสิ้น',
        overallProgress: 'ความคืบหน้าโดยรวม',
        statusChart: 'สถิติสถานะงานผลิต',
        productionStatus: 'สถานะงานผลิต',
        statusTrends: 'แนวโน้มสถานะ',
        productTypeSummary: 'สรุปตามประเภทสินค้า',
        customerTypeSummary: 'สรุปตามประเภทลูกค้า',
        productType: 'ประเภทสินค้า',
        count: 'จำนวน',
        quantity: 'ปริมาณ',
        weight: 'น้ำหนัก',
        customerType: 'ประเภทลูกค้า',
        orders: 'คำสั่ง',
        totalQty: 'ปริมาณรวม',
        loadingChart: 'กำลังโหลดข้อมูล...',
        noData: 'ไม่มีข้อมูลแสดง',
        noTrends: 'ไม่มีข้อมูลแนวโน้ม',
        noProductData: 'ไม่มีข้อมูลสินค้า',
        noCustomerData: 'ไม่มีข้อมูลลูกค้า',
        recentActivities: 'กิจกรรมล่าสุด',
        noRecentActivities: 'ไม่มีกิจกรรมล่าสุด',
        workOrder: 'เลขที่ใบงาน',
        product: 'สินค้า',
        customer: 'ลูกค้า',
        status: 'สถานะ',
        goldType: 'ประเภททอง',
        updatedBy: 'อัปเดตโดย',
        viewDetails: 'ดูรายละเอียด',
        daily: 'รายวัน',
        monthly: 'รายเดือน',
        capacityTab: 'กำลังการผลิต',
        monthlyReport: 'รายงานรายเดือน',
        monthlyComingSoon: 'รายงานรายเดือน เร็วๆ นี้',
        filterDateFrom: 'สร้างตั้งแต่',
        filterDateTo: 'ถึง',
        loadError: 'ไม่สามารถโหลดข้อมูลแดชบอร์ดได้ครับ กรุณาลองใหม่อีกครั้ง',

        // shared filter bar (both tabs)
        filterTitle: 'ตัวกรองข้อมูล',
        filterDesc: 'กรองข้อมูลแดชบอร์ดตามเงื่อนไขที่ต้องการครับ',
        filterText: 'ค้นหา (WO / แม่พิมพ์ / รหัสสินค้า / รหัสลูกค้า)',
        filterMold: 'แม่พิมพ์',
        filterProductNumber: 'รหัสสินค้า',
        filterGold: 'ชนิดทอง',
        filterGoldSize: 'ขนาดทอง',
        filterCustomerCode: 'รหัสลูกค้า',
        filterDateRange: 'ช่วงวันที่',
        filterOverPlanOnly: 'เฉพาะงานเกินกำหนด',
        selectYear: 'เลือกปี',

        // recent activities columns
        colType: 'ประเภท',
        colActivity: 'กิจกรรม',
        colDate: 'วันที่',
        colDetail: 'รายละเอียด',

        // summary table columns
        colProductType: 'ประเภทสินค้า',
        colOrderCount: 'จำนวนคำสั่ง',
        colPieceCount: 'จำนวนชิ้น',
        colCustomerType: 'ประเภทลูกค้า',

        // scrap weight labels
        scrapWeightTitle: 'น้ำหนักขี้เบ้าทองรายเดือน ({year})',
        loading: 'กำลังโหลดข้อมูล...',
        scrapMelt: 'ขี้เบ้าหลอม',
        scrapCast: 'ขี้เบ้าหล่อ',
        yearly: 'รายปี',
        exportExcel: 'ส่งออกข้อมูล Excel',
        exporting: 'กำลังส่งออก...',
        excel: 'Excel',
        exportNoDataMsg: 'ไม่มีข้อมูลสำหรับส่งออก',
        exportSuccessMsg: 'ส่งออกข้อมูล Excel เรียบร้อยแล้ว',
        exportErrorMsg: 'ไม่สามารถส่งออกข้อมูล Excel ได้',
        weightUnit: 'กรัม',
        weightUnitShort: 'ก.',
        yearSummaryTitle: 'สรุปข้อมูลรายปี {year} - แยกตามประเภทและขนาดทอง',
        weightPerYear: 'กรัม/ปี',
        monthsWithData: 'เดือนที่มีข้อมูล',
        avgPerMonth: 'เฉลี่ยต่อเดือน',
        ofTotal: 'ของยอดรวม',

        // monthly success report
        selectMonth: 'เลือกเดือน',
        placeholderMonth: 'เลือกเดือนและปี',
        selectedMonth: 'เดือนที่เลือก:',
        goldType2: 'ประเภททอง:',
        productType2: 'ประเภทสินค้า:',
        customerType2: 'ประเภทลูกค้า:',
        chartTitleGold: 'สรุปแผนงานที่สำเร็จ - ตามประเภททอง',
        chartTitleProduct: 'สรุปแผนงานที่สำเร็จ - ตามประเภทสินค้า',
        chartTitleCustomer: 'สรุปแผนงานที่สำเร็จ - ตามประเภทลูกค้า',
        tableDetailGold: 'รายละเอียดตามประเภททอง',
        tableDetailProduct: 'รายละเอียดตามประเภทสินค้า',
        tableDetailCustomer: 'รายละเอียดตามประเภทลูกค้า',
        countLabel: 'จำนวน',
        colGoldType: 'ประเภททอง',
        colProductCount: 'จำนวนแผนงาน',
        colOrderCount2: 'จำนวนสั่งผลิต',
        colPercent: 'เปอร์เซ็นต์',
        unitPiece: 'ชิ้น',
        validationSelectMonth: 'กรุณาเลือกเดือนและปี',

        // Forecast layer (frontend-only estimate — run-rate)
        forecast: {
          title: 'ประมาณการยอดงานเสร็จสิ้นเดือน (ค่าประมาณการ ไม่ใช่ข้อมูลจริง)',
          quantityLabel: 'ยอดงานเสร็จสิ้นเดือนโดยประมาณ ({month})',
          actualSeries: 'ยอดเสร็จจริงสะสม (ถึงวันนี้)',
          forecastSeries: 'ประมาณการยอดเสร็จสะสม (คาดการณ์)',
          assumption: 'อิง run-rate จากข้อมูล {days} วันของเดือนนี้ — เป็นค่าประมาณการ ไม่ใช่ตัวเลขจริง',
          notEnoughData: 'ข้อมูลไม่พอสำหรับประมาณการ',
          chartEmpty: 'ยังไม่มีข้อมูลงานเสร็จเดือนนี้'
        },

        // Capacity report tab
        capacity: {
          controlsTitle: 'ตัวกรองรายงานกำลังการผลิต',
          bucketLabel: 'มุมมอง',
          bucketWeek: 'สัปดาห์',
          bucketMonth: 'เดือน',
          dateRangeLabel: 'ช่วงเวลารายงาน',
          groupByLabel: 'แยกตาม',
          groupNone: 'รวมทั้งหมด',
          groupGold: 'ชนิดทอง',
          groupGoldSize: 'ขนาดทอง',
          groupProductType: 'ประเภทสินค้า',
          groupCustomerType: 'ประเภทลูกค้า',
          statTotalPlans: 'จำนวนแผนทั้งหมด',
          statTotalPieces: 'จำนวนชิ้นทั้งหมด',
          statAvgPlans: 'แผนเฉลี่ยต่อช่วง',
          statAvgPieces: 'ชิ้นเฉลี่ยต่อช่วง',
          statBestBucket: 'ช่วงที่ผลิตมากที่สุด',
          statBestBucketSub: 'จำนวนแผน',
          chartTitle: 'กำลังการผลิตตามช่วงเวลา',
          planCountSeries: 'จำนวนแผน',
          pieceCountSeries: 'จำนวนชิ้น',
          tableTitle: 'รายละเอียดกำลังการผลิตรายช่วง',
          colBucket: 'ช่วงเวลา',
          colPlanCount: 'จำนวนแผน',
          colPieceCount: 'จำนวนชิ้น',
          exportFilename: 'รายงาน-กำลังการผลิต',
          avgNote: 'หมายเหตุ: ค่าเฉลี่ยคำนวณจากช่วงที่ครบรอบสมบูรณ์เท่านั้น ไม่รวมช่วงล่าสุดที่ยังไม่จบครับ',
          partialBucketBadge: 'ยังไม่จบ',
          partialBucketSuffix: '(ยังไม่จบ)'
        }
      }
    },
    sale: { ...saleLang },
    setting: {
      companyInfo: { ...settingLang.companyInfo }
    },
    mobile: {
      nav: { ...mobileLang.nav },
      sale: { ...mobileLang.sale },
      pos: { ...mobileLang.pos },
      costVersion: { ...mobileLang.costVersion },
      scan: { ...mobileLang.scan },
      dashboard: { ...mobileLang.dashboard },
      tasks: { ...mobileLang.tasks },
      profile: { ...mobileLang.profile },
      quotation: { ...mobileLang.quotation },
      notifications: { ...mobileLang.notifications },
      saleIndex: { ...mobileLang.saleIndex },
      components: { ...mobileLang.components },
      stockProduct: { ...mobileLang.stockProduct },
      receipt: { ...mobileLang.receipt },
      posHelp: { ...mobileLang.posHelp }
    },
    ticket: { ...ticketLang },
    graph: { ...graphLang },
    downloads: { ...downloadsLang },
    report: { ...reportLang },
    printStation: { ...printStationLang },
    mold: { ...moldLang },
    worker: { ...workerLang },
    productionCost: { ...productionCostLang },
    dashboard: {
      messageBox1: 'กล่องข้อความที่ 1',
      messageBox2: 'กล่องข้อความที่ 2',
      messageBox3: 'กล่องข้อความที่ 3',
      messageBox4: 'กล่องข้อความที่ 4',
      welcomeDesc: 'ยินดีต้อนรับสู่เครื่องมือบริหารเเละจัดการ ผลิต/จัดเก็บ/ขาย/บริการ สินค้า',
      companyFooter: '@บริษัท ดวงแก้วจิวเวลรี่ แมนูแฟคเจอเรอร์',
      home: {
        greeting: {
          hello: 'สวัสดีครับ คุณ{name}'
        },
        quickActions: {
          title: 'ทางลัด',
          createPrePlan: 'สร้างใบสั่งผลิต',
          createCustomer: 'เพิ่มลูกค้าใหม่',
          goodsReceipt: 'รับสินค้าเข้าคลัง',
          createQuotation: 'สร้างใบเสนอราคา',
          stockSearch: 'ค้นหาสินค้าคงคลัง',
          createTicket: 'แจ้งปัญหา/ขอฟีเจอร์'
        },
        myJobs: {
          title: 'งานของฉัน',
          empty: 'ไม่มีงานที่ต้องทำในขณะนี้ครับ'
        },
        actionCards: {
          title: 'สรุปงานสำคัญ',
          pendingApproval: 'รออนุมัติ',
          myPrePlan: 'ใบสั่งผลิตของฉัน',
          planTotal: 'แผนผลิตทั้งหมด',
          planProcess: 'กำลังผลิต',
          planCompletedYesterday: 'เสร็จเมื่อวาน',
          planOverdue: 'เกินกำหนด',
          pendingGR: 'รับเข้าคลังวันนี้',
          ticketOpen: 'Ticket เปิดค้าง',
          myTicket: 'Ticket ของฉัน (ยังไม่อ่าน)',
          scrapWeightMonth: 'เศษทองเดือนนี้ (กรัม)'
        },
        wipByStage: {
          title: 'งานระหว่างผลิตแยกตามแผนก',
          unit: 'รายการ'
        },
        completedTrend: {
          title: 'แนวโน้มงานผลิตสำเร็จ',
          notEnoughData: 'ข้อมูลยังไม่พอสำหรับประมาณการครับ',
          forecastLabel: 'ประมาณการสิ้นเดือน',
          actual: 'ยอดจริง',
          forecast: 'ประมาณการ',
          assumption: 'คำนวณจากอัตราเฉลี่ย {days} วันที่ผ่านมา'
        },
        stockSummary: {
          title: 'ภาพรวมคลัง',
          gemTitle: 'พลอย/เพชร',
          productTitle: 'สินค้าสำเร็จ',
          totalQuantity: 'จำนวนคงเหลือ',
          totalValue: 'มูลค่ารวม',
          lowStock: 'สินค้าใกล้หมด',
          onProcess: 'ระหว่างผลิต'
        },
        recentActivities: {
          title: 'กิจกรรมล่าสุด',
          empty: 'ยังไม่มีกิจกรรมครับ'
        },
        customerProductionStatus: {
          title: 'สถานะงานผลิตของลูกค้า',
          onlyMine: 'ลูกค้าของฉัน',
          all: 'ทั้งหมด',
          empty: 'ไม่พบข้อมูลครับ',
          inProduction: 'กำลังผลิต',
          completed: 'เสร็จแล้ว',
          overdue: 'เกินกำหนด'
        },
        favoriteReports: {
          title: 'รายงานที่ใช้บ่อย',
          wip: 'รายงานงานระหว่างผลิต',
          goldCost: 'รายงานใบเบิกผสมทอง',
          leadTime: 'รายงาน Lead-time การผลิต',
          wages: 'รายงานค่าแรงช่าง',
          wagesByPerson: 'รายงานค่าแรงช่างต่อคน'
        }
      }
    },
    stock: {
      product: { ...stock.product },
      location: { ...stock.location },
      moveLocation: { ...stock.moveLocation },
      storageMoveReport: { ...stock.storageMoveReport },
      cost: { ...stock.cost },
      gemOnhandReport: { ...stock.gemOnhandReport },
      gemMovementReport: { ...stock.gemMovementReport },
      gemMovementAnalysis: { ...stock.gemMovementAnalysis },
      materialValuationReport: { ...stock.materialValuationReport },
      stockBalanceSummary: { ...stock.stockBalanceSummary },
      gold: { ...stock.gold },
      gem: {
        ...stock.gem,
        dashboard: {
          title: 'แดชบอร์ดคลังอัญมณี',
          searchDesc: 'กรองข้อมูลแดชบอร์ดตามกลุ่ม รูปทรง เกรด และช่วงวันที่',
          lastUpdate: 'อัปเดตล่าสุด',
          filters: 'ตัวกรอง',
          groupName: 'กลุ่มอัญมณี',
          shape: 'รูปทรง',
          grade: 'เกรด',
          allGroups: 'ทุกกลุ่ม',
          allShapes: 'ทุกรูปทรง',
          allGrades: 'ทุกเกรด',

          // Tabs
          overview: 'ภาพรวม',
          today: 'วันนี้',
          weekly: 'รายสัปดาห์',
          monthly: 'รายเดือน',

          // Main stats
          totalGemTypes: 'ประเภทอัญมณีทั้งหมด',
          uniqueGemVarieties: 'ความหลากหลายของอัญมณี',
          totalQuantity: 'จำนวนรวม',
          pieceCount: 'จำนวนชิ้น',
          totalWeight: 'น้ำหนักรวม',
          weightInGrams: 'น้ำหนัก (กรัม)',
          totalValue: 'มูลค่ารวม',
          inventoryValue: 'มูลค่าสินค้าคงคลัง',
          lowStockItems: 'สินค้าใกล้หมด',
          outOfStock: 'หมดสต็อก',

          // Availability
          availability: 'สถานะพร้อมใช้',
          available: 'พร้อมใช้',
          onProcess: 'อยู่ในกระบวนการ',

          // Charts and tables
          categoryBreakdown: 'แบ่งตามหมวดหมู่',
          categoryGroupBy: 'จัดกลุ่มตาม',
          topMovements: 'การเคลื่อนไหวสูงสุด',
          priceAlerts: 'การแจ้งเตือนราคา',
          gemCode: 'รหัสอัญมณี',
          category: 'หมวดหมู่',
          transactions: 'ธุรกรรม',
          totalMoved: 'ย้ายรวม',

          // Today report
          todayTransactions: 'ธุรกรรมวันนี้',
          newItems: 'รายการใหม่',
          lowStockAlerts: 'แจ้งเตือนสต็อกต่ำ',
          quantity: 'จำนวน',
          weight: 'น้ำหนัก',
          status: 'สถานะ',
          jobOrPo: 'งาน/PO',
          createBy: 'สร้างโดย',
          updateBy: 'อัปเดตโดย',
          createDate: 'วันที่สร้าง',
          type: 'ประเภท',
          running: 'เลขที่รายการ',

          // Last activities
          lastActivities: 'กิจกรรมล่าสุด',
          noActivities: 'ไม่มีกิจกรรม',

          // Stock alert panel
          stockAlert: {
            title: 'แจ้งเตือนสต๊อกวัตถุดิบ',
            viewAll: 'ดูทั้งหมด',
            outLabel: 'หมดแล้ว',
            criticalLabel: 'วิกฤต (<7 วัน)',
            lowLabel: 'ใกล้หมด (<30 วัน)',
            colLevel: 'ระดับ',
            noAlerts: 'ไม่มีวัตถุดิบที่ต้องแจ้งเตือน'
          },

          // Weekly report
          weeklyTransactions: 'ธุรกรรมรายสัปดาห์',
          weeklyAnalysis: 'การวิเคราะห์รายสัปดาห์',
          noWeeklyData: 'ไม่มีข้อมูลรายสัปดาห์',

          // Monthly report
          monthlyTransactions: 'ธุรกรรมรายเดือน',
          monthlyTransactionSummaries: 'สรุปธุรกรรมรายเดือน',
          monthlyAnalysis: 'การวิเคราะห์รายเดือน',
          noMonthlyData: 'ไม่มีข้อมูลรายเดือน',
          noMonthlyTransactionData: 'ไม่มีข้อมูลธุรกรรมรายเดือน',
          transactionTypeBreakdown: 'รายละเอียดตามประเภทธุรกรรม',
          gemType: 'ประเภทอัญมณี',
          qtyUsed: 'ปริมาณที่ใช้',
          weightUsed: 'น้ำหนักที่ใช้',
          inbound: 'เข้า',
          outbound: 'ออก',
          currentStock: 'สต็อกปัจจุบัน',
          actions: 'การกระทำ',
          cost: 'ค่าใช้จ่าย',
          noTransactionTypes: 'ไม่มีข้อมูลประเภทธุรกรรม',
          processBorrow: 'การยืมในกระบวนการ',
          total: 'รวมทั้งหมด',
          pcs: 'ชิ้น',
          borrow: 'ยืม',
          return: 'คืน',
          grams: 'กรัม',

          // Monthly specific
          monthSelection: 'เลือกเดือน',
          selectedPeriod: 'ช่วงเวลาที่เลือก',
          transactionSummariesByType: 'สรุปธุรกรรมแยกตามประเภท',
          productionType: 'ประเภทการผลิต',
          lastTransaction: 'ธุรกรรมล่าสุด',
          noGemDetails: 'ไม่มีรายละเอียดอัญมณี',
          noTransactionData: 'ไม่มีข้อมูลธุรกรรม',
          selectMonthToView: 'กรุณาเลือกเดือนเพื่อดูข้อมูล',
          loadingData: 'กำลังโหลดข้อมูล...',
          selectTransactionType: 'เลือกประเภทธุรกรรม',
          selectedType: 'ประเภทที่เลือก',
          transactionChart: 'กราฟธุรกรรม',
          quantityChart: 'กราฟจำนวน',
          weightChart: 'กราฟน้ำหนัก',
          transactionDetails: 'รายละเอียดธุรกรรม',
          items: 'รายการ',

          // No data messages
          loadingChart: 'กำลังโหลดข้อมูล...',
          noData: 'ไม่มีข้อมูลแสดง',
          noMovements: 'ไม่มีการเคลื่อนไหว',
          noPriceChanges: 'ไม่มีการเปลี่ยนแปลงราคา',
          noTodayTransactions: 'ไม่มีธุรกรรมวันนี้',

          // Forecast layer (frontend-only estimate)
          forecast: {
            title: 'ชั้นประมาณการ (คาดการณ์)',
            quantityLabel: 'ประมาณการจำนวนพลอยที่ใช้สิ้นเดือน',
            weightLabel: 'ประมาณการน้ำหนักที่ใช้สิ้นเดือน (กรัม)',
            actualSeries: 'ยอดใช้จริงสะสม',
            forecastSeries: 'ประมาณการยอดใช้สะสม',
            assumption:
              'อิงอัตราการใช้จริงเฉลี่ยต่อวัน (Run-rate จากยอดจ่ายออก+เบิกใช้ ไม่รวมยืมออกที่คืนกลับ) จากข้อมูล {days} วันแรกของเดือนนี้ — เป็นค่าประมาณการ ไม่ใช่ตัวเลขจริง',
            notEnoughData: 'ข้อมูลไม่พอสำหรับประมาณการเดือนนี้',
            chartEmpty: 'ยังไม่มีข้อมูลการเบิกใช้ในเดือนนี้'
          },

          // Aging layer (stock aging report)
          aging: {
            title: 'อายุสต๊อกพลอย (Aging)',
            deadCodesOverYear: 'จำนวนรายการจมเกิน 1 ปี',
            deadCodes: 'จำนวนรหัสที่ค้าง',
            chartEmpty: 'ยังไม่มีข้อมูลอายุสต๊อก',
            countLabel: 'จำนวนรายการ (รหัส)',
            bucket: {
              d0_30: '0-30 วัน',
              d31_90: '31-90 วัน',
              d91_180: '91-180 วัน',
              d181_365: '181-365 วัน',
              over365: 'เกิน 1 ปี',
              never: 'ไม่เคยเคลื่อนไหว'
            }
          },

          // Monthly report overview (backend-computed sections)
          // ชื่อ monthlyReport เพื่อไม่ชนกับ key `monthly` (tab label) ที่มีอยู่แล้วในบล็อกนี้
          monthlyReport: {
            summary: {
              title: 'สรุปภาพรวมรายเดือน',
              totalTransactions: 'ธุรกรรมทั้งหมด',
              totalQuantityIn: 'จำนวนรับเข้า',
              totalQuantityOut: 'จำนวนจ่ายออก',
              monthOverMonthGrowth: 'อัตราการเติบโตเทียบเดือนก่อน',
              inventoryTurnoverRatio: 'อัตราหมุนเวียนสินค้าคงคลัง'
            },
            weeklyComparison: {
              title: 'เปรียบเทียบรายสัปดาห์ในเดือน',
              weekLabel: 'สัปดาห์ {n}',
              quantityIn: 'จำนวนรับเข้า',
              quantityOut: 'จำนวนจ่ายออก',
              chartEmpty: 'ยังไม่มีข้อมูลรายสัปดาห์ในเดือนนี้'
            },
            topPerformers: {
              title: 'อันดับพลอยเคลื่อนไหวสูงสุด',
              performanceType: 'ประเภทผลงาน',
              noData: 'ไม่มีข้อมูลอันดับพลอยเคลื่อนไหวในเดือนนี้',
              type: {
                highestVolume: 'ปริมาณสูงสุด',
                highestValue: 'มูลค่าสูงสุด',
                mostActive: 'เคลื่อนไหวบ่อยสุด',
                fastestMoving: 'หมุนเวียนเร็วสุด'
              }
            },
            inventoryAnalysis: {
              title: 'วิเคราะห์คลังสินค้ารายเดือน',
              itemCount: 'จำนวนรายการ',
              inventoryDays: 'จำนวนวันสต็อกคงเหลือ',
              inventoryStatus: 'สถานะสต็อก',
              monthOverMonthChange: 'เปลี่ยนแปลงจากเดือนก่อน (%)',
              noData: 'ไม่มีข้อมูลวิเคราะห์คลังในเดือนนี้',
              status: {
                overstock: 'สต็อกเกิน',
                optimal: 'เหมาะสม',
                understock: 'สต็อกต่ำ'
              }
            },
            supplierAnalysis: {
              title: 'วิเคราะห์ซัพพลายเออร์รายเดือน',
              supplierName: 'ชื่อซัพพลายเออร์',
              gemTypes: 'ประเภทพลอย',
              preferredGemCategory: 'หมวดพลอยหลัก',
              deliveryCount: 'จำนวนครั้งที่ส่งของ',
              reliabilityRating: 'คะแนนความน่าเชื่อถือ',
              noData: 'ยังไม่มีข้อมูลซัพพลายเออร์ในเดือนนี้',
              noDataScope:
                'ข้อมูลนี้แสดงเฉพาะพลอยที่รับเข้าใหม่ (ประเภทรับเข้าคลัง [พลอยใหม่]) เท่านั้น',
              rating: {
                excellent: 'ดีเยี่ยม',
                good: 'ดี',
                average: 'ปานกลาง',
                poor: 'ต้องปรับปรุง'
              }
            },
            priceAnalysis: {
              title: 'วิเคราะห์ราคารายเดือน',
              priceChangeCount: 'จำนวนครั้งที่ราคาเปลี่ยน',
              averagePriceStart: 'ราคาเฉลี่ยต้นเดือน',
              averagePriceEnd: 'ราคาเฉลี่ยปลายเดือน',
              priceVolatility: 'ความผันผวนราคา',
              maxPriceIncrease: 'ราคาที่เพิ่มขึ้นสูงสุด',
              maxPriceDecrease: 'ราคาที่ลดลงสูงสุด',
              priceTrend: 'แนวโน้มราคา',
              mostRecentPriceChange: 'เปลี่ยนราคาล่าสุดเมื่อ',
              noData: 'ไม่มีข้อมูลวิเคราะห์ราคาในเดือนนี้',
              trend: {
                increasing: 'เพิ่มขึ้น',
                decreasing: 'ลดลง',
                stable: 'คงที่',
                volatile: 'ผันผวน'
              }
            }
          }
        }
      }
    }
  }
}
