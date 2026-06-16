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

export default {
  saleOrder,
  saleOrderList,
  productionOrder
}
