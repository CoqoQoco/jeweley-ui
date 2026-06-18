// ALL
import breadcrumb from './breadcrumb/th.js'
import alerts from './alerts/th.js'
import button from './button/th.js'
import common from './common/th.js'

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
import * as mobileLang from './view/mobile/th.js'
export default {
  breadcrumb: { ...breadcrumb },
  alert: { ...alerts },
  button: { ...button },
  common: { ...common },
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
        monthlyReport: 'รายงานรายเดือน',
        monthlyComingSoon: 'รายงานรายเดือน เร็วๆ นี้',

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
        unitPiece: 'ชิ้น'
      }
    },
    sale: { ...saleLang },
    mobile: {
      sale: { ...mobileLang.sale },
      costVersion: { ...mobileLang.costVersion },
      scan: { ...mobileLang.scan },
      dashboard: { ...mobileLang.dashboard },
      tasks: { ...mobileLang.tasks },
      profile: { ...mobileLang.profile },
      quotation: { ...mobileLang.quotation },
      notifications: { ...mobileLang.notifications },
      saleIndex: { ...mobileLang.saleIndex },
      components: { ...mobileLang.components }
    },
    mold: { ...moldLang },
    worker: { ...workerLang },
    productionCost: { ...productionCostLang },
    stock: {
      product: { ...stock.product },
      location: { ...stock.location },
      moveLocation: { ...stock.moveLocation },
      cost: { ...stock.cost },
      gem: {
        ...stock.gem,
        dashboard: {
          title: 'แดชบอร์ดคลังอัญมณี',
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
          topMovements: 'การเคลื่อนไหวสูงสุด',
          priceAlerts: 'การแจ้งเตือนราคา',
          gemCode: 'รหัสอัญมณี',
          category: 'หมวดหมู่',
          transactions: 'ธุรกรรม',
          totalMoved: 'ย้ายรวม',

          // Today report
          todayTransactions: 'ธุรกรรมวันนี้',
          priceChanges: 'การเปลี่ยนแปลงราคา',
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

          // Coming soon
          weeklyReportComingSoon: 'รายงานรายสัปดาห์ เร็วๆ นี้',
          monthlyReportComingSoon: 'รายงานรายเดือน เร็วๆ นี้'
        }
      }
    }
  }
}
