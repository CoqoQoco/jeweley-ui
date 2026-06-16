export const invoice = {
  title: 'รายการใบแจ้งหนี้',
  searchTitle: 'ค้นหาใบแจ้งหนี้',
  invoiceNumber: 'เลขที่ Invoice',
  stockNumber: 'เลข Stock',
  productNumber: 'เลข Product',
  moldNumber: 'เลข Mold',
  customerName: 'ชื่อลูกค้า',
  createDate: 'วันที่สร้าง',
  createBy: 'ผู้สร้าง',
  deliveryDate: 'วันที่จัดส่ง',
  remark: 'หมายเหตุ',
  status: 'สถานะ',
  customerCode: 'รหัสลูกค้า'
}

export const invoiceDetail = {
  title: 'รายละเอียด Invoice',
  addVersion: 'เพิ่ม Version',
  printInvoice: 'พิมพ์ใบแจ้งหนี้',
  testHelloUsb: 'Test Hello USB',
  exportExcel: 'Export Excel',
  printDelivery: 'พิมพ์ใบส่งสินค้า',
  cancelDocument: 'ยกเลิกเอกสาร',
  goBack: 'ย้อนกลับ',
  viewingVersion: 'กำลังดู',
  restoreOriginal: 'กลับไปดูต้นฉบับ',
  invoiceAndCustomer: 'ข้อมูล Invoice และลูกค้า',
  invoiceInfo: 'ข้อมูล Invoice',
  customerInfo: 'ข้อมูลลูกค้า',
  productList: 'รายการสินค้า',
  invoiceVersions: 'Invoice Versions',
  paymentAndSummary: 'ข้อมูลการชำระเงินและสรุปยอด',
  recordPayment: 'บันทึกการเก็บเงิน',
  paymentInfo: 'ข้อมูลการชำระเงิน',
  financialSummary: 'สรุปยอดเงิน',
  paymentHistory: 'ประวัติการชำระเงิน'
}

export const quotation = {
  title: 'ใบเสนอราคา',
  searchTitle: 'ค้นหาใบเสนอราคา',
  newProductionNumber: 'เลขที่ผลิต (ใหม่)',
  oldProductionNumber: 'เลขที่ผลิต (เก่า)',
  productCode: 'รหัสสินค้า',
  quotationNumber: 'เสนอราคา',
  customerInfo: 'ข้อมูลลูกค้า',
  quotationDate: 'วันที่ใบเสนอราคา',
  currency: 'สกุลเงิน',
  productList: 'รายการสินค้า',
  addProduct: 'เพิ่มสินค้า',
  printQuotation: 'พิมพ์ใบเสนอราคา',
  exportExcel: 'Export Excel'
}

export const quotationList = {
  title: 'รายการใบเสนอราคา',
  searchTitle: 'ค้นหาใบเสนอราคา',
  number: 'เลขที่ใบเสนอราคา',
  customerName: 'ชื่อลูกค้า',
  currency: 'สกุลเงิน',
  createBy: 'ผู้สร้าง',
  createDate: 'วันที่สร้าง',
  quotationDate: 'วันที่ใบเสนอราคา',
  status: 'สถานะ'
}

export const saleOrder = {
  title: 'ใบสั่งขาย',
  searchTitle: 'ค้นหาใบเสนอราคา',
  searchQuotation: 'ค้นหาใบเสนอราคา',
  soNumber: 'เลขที่ใบสั่งขาย',
  soDate: 'วันที่ใบสั่งขาย',
  deliveryDate: 'วันที่คาดหวังส่งมอบ',
  quotationRef: 'อ้างอิงใบเสนอราคา',
  priority: 'ลำดับความสำคัญ',
  currency: 'สกุลเงิน',
  currencyRate: 'อัตราแลกเปลี่ยน',
  customerName: 'ชื่อลูกค้า',
  customerAddress: 'ที่อยู่ลูกค้า',
  customerPhone: 'เบอร์โทรลูกค้า',
  customerEmail: 'อีเมลลูกค้า',
  remark: 'หมายเหตุ',
  customerRemark: 'หมายเหตุสำหรับลูกค้า',
  invoiceTitle: 'สร้าง Invoice จาก Sale Order',
  confirmAndInvoiceTitle: 'ยืนยันสินค้า + สร้าง Invoice',
  selectAll: 'เลือกทั้งหมด',
  confirmedItems: 'สินค้าที่ยืนยันแล้ว',
  pendingItems: 'รอยืนยัน',
  createInvoicePdf: 'สร้าง Invoice PDF'
}

export const saleOrderList = {
  title: 'รายการใบสั่งขาย',
  searchTitle: 'ค้นหาใบสั่งขาย',
  soNumber: 'เลขที่ใบสั่งขาย',
  stockNumber: 'เลข Stock',
  productNumber: 'เลข Product',
  moldNumber: 'เลข Mold',
  customerName: 'ชื่อลูกค้า',
  refQuotation: 'อ้างอิงใบเสนอราคา',
  currency: 'สกุลเงิน',
  currencyRate: 'อัตราแลกเปลี่ยน',
  createBy: 'ผู้สร้าง',
  createDate: 'วันที่สร้าง',
  deliveryDate: 'วันที่จัดส่ง',
  status: 'สถานะ'
}

export const productionOrder = {
  title: 'ใบสั่งผลิต',
  subtitle: 'จัดการใบสั่งผลิตสินค้าจากใบสั่งขาย',
  searchTitle: 'ค้นหาข้อมูล',
  searchType: 'ประเภทการค้นหา',
  searchBySaleOrder: 'ใบสั่งขาย',
  searchByProduct: 'รหัสสินค้า',
  soNumber: 'เลขที่ใบสั่งขาย',
  productNumber: 'รหัสสินค้า',
  selectSaleOrder: 'เลือกใบสั่งขาย',
  clearData: 'ล้างข้อมูล',
  poNumber: 'เลขที่ใบสั่งผลิต',
  poDate: 'วันที่ใบสั่งผลิต',
  requiredDate: 'วันที่ต้องการใช้',
  priority: 'ลำดับความสำคัญ',
  soRef: 'อ้างอิงใบสั่งขาย',
  poStatus: 'สถานะ',
  productionType: 'ประเภทการผลิต',
  workshop: 'หน่วยผลิต',
  productionItems: 'รายการสินค้าที่ต้องผลิต',
  selectSaleOrderModal: 'เลือกใบสั่งขายสำหรับสร้างใบสั่งผลิต'
}

export const costStock = {
  title: 'ตีราคาสินค้า',
  searchStock: 'ค้นหาสินค้า',
  stockNumber: 'เลขที่ผลิต (ใหม่)',
  stockNumberOrigin: 'เลขที่ผลิต (เก่า)',
  productNumber: 'รหัสสินค้า',
  planList: 'รายการแผนตีราคา',
  stockInfo: 'ข้อมูลสินค้า',
  customInfo: 'ข้อมูลสินค้าแบบกำหนดเอง (Custom)',
  customInfoNote: '* ถ้ากรอก จะแสดงแทนข้อมูลสินค้าปกติใน PDF',
  customerInfo: 'ข้อมูลลูกค้า',
  appraisal: 'ประเมินราคาสินค้า',
  appraisalNote: '* รายการที่แสดงในตารางนี้เป็นราคาต่อ 1 ชิ้น (หารต้นทุนตามจำนวนแผนผลิตแล้ว)',
  currency: 'สกุลเงิน (Currency)',
  currencyUnit: 'สกุลเงิน',
  currencyRate: 'อัตราแลกเปลี่ยน (1 หน่วย = ? บาท)',
  save: 'บันทึก',
  saveAsOrigin: 'บันทึกและใช้เป็นต้นทุนหลัก',
  previewPdf: 'พิมพ์ตัวอย่าง PDF',
  versionList: 'รายการตีราคาล่าสุด',
  exportPdf: 'Export PDF',
  planCost: 'ต้นทุนจากแผนผลิต (อ้างอิง)',
  viewPlanCost: 'ดูต้นทุนจากแผนผลิต',
  checkGoldPrice: 'ตรวจสอบราคาทองวันนี้'
}

export const stockReservation = {
  title: 'การจองสต็อกสินค้า',
  searchTitle: 'ค้นหาการจองสต็อก',
  searchType: 'ประเภทการค้นหา',
  searchBySaleOrder: 'ใบสั่งขาย',
  searchByProduct: 'รหัสสินค้า',
  searchByCustomer: 'ลูกค้า',
  soNumber: 'เลขที่ใบสั่งขาย',
  productNumber: 'รหัสสินค้า',
  customerName: 'ชื่อลูกค้า',
  reservationDate: 'วันที่จอง',
  expiryDate: 'วันที่หมดอายุ',
  status: 'สถานะ',
  autoExpiryDays: 'จำนวนวันหมดอายุอัตโนมัติ',
  saleOrderRef: 'อ้างอิงใบสั่งขาย',
  reservationType: 'ประเภทการจอง',
  priority: 'ลำดับความสำคัญ',
  remark: 'หมายเหตุการจอง',
  stockItems: 'รายการสินค้าสต็อกที่ต้องจอง',
  selectAll: 'เลือกทั้งหมด',
  reserveSelected: 'จองรายการที่เลือก',
  reserveAll: 'จองทั้งหมด',
  unreserveAll: 'ยกเลิกการจองทั้งหมด',
  report: 'รายงานการจอง'
}

export const deliveryNote = {
  title: 'ใบส่งของ',
  searchTitle: 'ค้นหาใบส่งของ',
  searchType: 'ประเภทการค้นหา',
  searchBySaleOrder: 'ใบสั่งขาย',
  searchByDeliveryNote: 'ใบส่งของ',
  searchByCustomer: 'ลูกค้า',
  soNumber: 'เลขที่ใบสั่งขาย',
  dnNumber: 'เลขที่ใบส่งของ',
  customerName: 'ชื่อลูกค้า',
  selectSaleOrder: 'เลือกใบสั่งขาย',
  viewDeliveries: 'รายการส่งของ'
}

export default {
  invoice,
  invoiceDetail,
  quotation,
  quotationList,
  saleOrder,
  saleOrderList,
  productionOrder,
  costStock,
  stockReservation,
  deliveryNote
}
