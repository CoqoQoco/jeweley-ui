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

export default {
  invoice,
  invoiceDetail,
  quotation,
  quotationList,
  saleOrder,
  saleOrderList,
  productionOrder
}
