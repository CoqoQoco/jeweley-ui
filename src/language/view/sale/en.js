export const invoice = {
  title: 'Invoice List',
  searchTitle: 'Search Invoices',
  invoiceNumber: 'Invoice No.',
  stockNumber: 'Stock No.',
  productNumber: 'Product No.',
  moldNumber: 'Mold No.',
  customerName: 'Customer Name',
  createDate: 'Create Date',
  createBy: 'Created By',
  deliveryDate: 'Delivery Date',
  remark: 'Remark',
  status: 'Status',
  customerCode: 'Customer Code'
}

export const invoiceDetail = {
  title: 'Invoice Detail',
  addVersion: 'Add Version',
  printInvoice: 'Print Invoice',
  testHelloUsb: 'Test Hello USB',
  exportExcel: 'Export Excel',
  printDelivery: 'Print Delivery Note',
  cancelDocument: 'Cancel Document',
  goBack: 'Back',
  viewingVersion: 'Viewing',
  restoreOriginal: 'View Original',
  invoiceAndCustomer: 'Invoice & Customer Info',
  invoiceInfo: 'Invoice Info',
  customerInfo: 'Customer Info',
  productList: 'Product List',
  invoiceVersions: 'Invoice Versions',
  paymentAndSummary: 'Payment & Financial Summary',
  recordPayment: 'Record Payment',
  paymentInfo: 'Payment Info',
  financialSummary: 'Financial Summary',
  paymentHistory: 'Payment History'
}

export const quotation = {
  title: 'Quotation',
  searchTitle: 'Search Quotations',
  newProductionNumber: 'Production No. (New)',
  oldProductionNumber: 'Production No. (Old)',
  productCode: 'Product Code',
  quotationNumber: 'Quotation',
  customerInfo: 'Customer Info',
  quotationDate: 'Quotation Date',
  currency: 'Currency',
  productList: 'Product List',
  addProduct: 'Add Product',
  printQuotation: 'Print Quotation',
  exportExcel: 'Export Excel'
}

export const quotationList = {
  title: 'Quotation List',
  searchTitle: 'Search Quotations',
  number: 'Quotation No.',
  customerName: 'Customer Name',
  currency: 'Currency',
  createBy: 'Created By',
  createDate: 'Create Date',
  quotationDate: 'Quotation Date',
  status: 'Status'
}

export const saleOrder = {
  title: 'Sale Order',
  searchTitle: 'Search Quotation',
  searchQuotation: 'Search Quotation',
  soNumber: 'Sale Order No.',
  soDate: 'Sale Order Date',
  deliveryDate: 'Expected Delivery Date',
  quotationRef: 'Quotation Reference',
  priority: 'Priority',
  currency: 'Currency',
  currencyRate: 'Currency Rate',
  customerName: 'Customer Name',
  customerAddress: 'Customer Address',
  customerPhone: 'Customer Phone',
  customerEmail: 'Customer Email',
  remark: 'Remark',
  customerRemark: 'Customer Remark',
  invoiceTitle: 'Create Invoice from Sale Order',
  confirmAndInvoiceTitle: 'Confirm Items + Create Invoice',
  selectAll: 'Select All',
  confirmedItems: 'Confirmed Items',
  pendingItems: 'Pending',
  createInvoicePdf: 'Create Invoice PDF'
}

export const saleOrderList = {
  title: 'Sale Order List',
  searchTitle: 'Search Sale Orders',
  soNumber: 'Sale Order No.',
  stockNumber: 'Stock No.',
  productNumber: 'Product No.',
  moldNumber: 'Mold No.',
  customerName: 'Customer Name',
  refQuotation: 'Quotation Reference',
  currency: 'Currency',
  currencyRate: 'Currency Rate',
  createBy: 'Created By',
  createDate: 'Create Date',
  deliveryDate: 'Delivery Date',
  status: 'Status'
}

export const productionOrder = {
  title: 'Production Order',
  subtitle: 'Manage production orders from sale orders',
  searchTitle: 'Search',
  searchType: 'Search Type',
  searchBySaleOrder: 'Sale Order',
  searchByProduct: 'Product Code',
  soNumber: 'Sale Order No.',
  productNumber: 'Product Code',
  selectSaleOrder: 'Select Sale Order',
  clearData: 'Clear',
  poNumber: 'Production Order No.',
  poDate: 'Production Order Date',
  requiredDate: 'Required Date',
  priority: 'Priority',
  soRef: 'Sale Order Reference',
  poStatus: 'Status',
  productionType: 'Production Type',
  workshop: 'Workshop',
  productionItems: 'Items to Produce',
  selectSaleOrderModal: 'Select Sale Order for Production'
}

export const costStock = {
  title: 'Cost Appraisal',
  searchStock: 'Search Stock',
  stockNumber: 'Production No. (New)',
  stockNumberOrigin: 'Production No. (Old)',
  productNumber: 'Product Code',
  planList: 'Appraisal Plan List',
  stockInfo: 'Stock Information',
  customInfo: 'Custom Stock Info',
  customInfoNote: '* If filled, replaces standard stock info in PDF',
  customerInfo: 'Customer Info',
  appraisal: 'Price Appraisal',
  appraisalNote: '* Prices shown are per piece (divided by production plan qty)',
  currency: 'Currency',
  currencyUnit: 'Currency Unit',
  currencyRate: 'Exchange Rate (1 unit = ? THB)',
  save: 'Save',
  saveAsOrigin: 'Save as Main Cost',
  previewPdf: 'Preview PDF',
  versionList: 'Recent Appraisals',
  exportPdf: 'Export PDF',
  planCost: 'Production Plan Cost (Reference)',
  viewPlanCost: 'View Plan Cost',
  checkGoldPrice: 'Check Today Gold Price'
}

export const stockReservation = {
  title: 'Stock Reservation',
  searchTitle: 'Search Reservation',
  searchType: 'Search Type',
  searchBySaleOrder: 'Sale Order',
  searchByProduct: 'Product Code',
  searchByCustomer: 'Customer',
  soNumber: 'Sale Order No.',
  productNumber: 'Product Code',
  customerName: 'Customer Name',
  reservationDate: 'Reservation Date',
  expiryDate: 'Expiry Date',
  status: 'Status',
  autoExpiryDays: 'Auto Expiry Days',
  saleOrderRef: 'Sale Order Reference',
  reservationType: 'Reservation Type',
  priority: 'Priority',
  remark: 'Reservation Remark',
  stockItems: 'Stock Items to Reserve',
  selectAll: 'Select All',
  reserveSelected: 'Reserve Selected',
  reserveAll: 'Reserve All',
  unreserveAll: 'Cancel All Reservations',
  report: 'Reservation Report'
}

export const deliveryNote = {
  title: 'Delivery Note',
  searchTitle: 'Search Delivery Notes',
  searchType: 'Search Type',
  searchBySaleOrder: 'Sale Order',
  searchByDeliveryNote: 'Delivery Note',
  searchByCustomer: 'Customer',
  soNumber: 'Sale Order No.',
  dnNumber: 'Delivery Note No.',
  customerName: 'Customer Name',
  selectSaleOrder: 'Select Sale Order',
  viewDeliveries: 'Delivery List'
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
