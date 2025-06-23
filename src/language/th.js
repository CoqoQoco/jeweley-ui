// ALL
import breadcrumb from './breadcrumb/th.js'
import alerts from './alerts/th.js'
import button from './button/th.js'

//view
import pickinglist from './view/pickinglist/th.js'
export default {
  breadcrumb: { ...breadcrumb },
  alert: { ...alerts },
  button: { ...button },
  view: {
    pickinglist: { ...pickinglist },
    production: {
      dashboard: {
        title: 'รายงานผลิตประจำวัน',
        lastUpdate: 'อัปเดตล่าสุด',
        totalPlans: 'แผนงานทั้งหมด',
        allActivePlans: 'แผนงานที่ยังไม่เสร็จ',
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
        viewDetails: 'ดูรายละเอียด'
      }
    }
  }
}
