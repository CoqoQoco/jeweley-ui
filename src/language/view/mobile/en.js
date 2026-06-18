export const scan = {
  selectTypeTitle: 'Select scan type',
  searchBy: 'Search by',
  orDivider: 'or',
  searchBtn: 'Search',
  actionZoneTitle: 'Actions',
  createCostPlanBtn: 'Create Cost Plan',
  updateStockBtn: 'Update Stock',
  printLabelBtn: 'Print Label',
  changeLocationBtn: 'Change Location',
  futureFeaturesNote: 'Some action features will be developed in the future',
  scanAgainBtn: 'Scan Again',
  fieldNewCode: 'New Stock Code',
  fieldOldCode: 'Old Stock Code',
  scanStockLabel: 'Scan Stock',
  scanStockDesc: 'Scan finished goods stock',
  placeholderNewCode: 'Enter new stock number (Stock Number)',
  placeholderOldCode: 'Enter old stock code (Origin)',
  warnEnterCode: 'Please enter production number or stock code',
  errorProductNotFound: 'Product not found',
  errorCheckCode: 'Please check the production number or stock code',
  successCreateCostPlan: 'Cost Plan No.: {planNumber}',
  successCreateCostPlanTitle: 'Cost plan created successfully',

  // product-detail-card
  productNoImage: 'No Image',
  productNewCode: 'Stock No. (New):',
  productOldCode: 'Stock No. (Old):',
  productCode: 'Product Code:',
  productMold: 'Mold:',
  productNameEn: 'Product Name (EN):',
  productNameTh: 'Product Name (TH):',
  productType: 'Product Type:',
  productSize: 'Size:',
  productMetalColor: 'Gold/Silver Color:',
  productMetalType: 'Gold/Silver Type:',
  productWo: 'W.O.:',
  productPrice: 'Price:',
  productPriceUnit: 'Baht',
  productLocation: 'Location:',
  productMaterialTitle: 'Materials',
  productGold: 'Gold:',
  productGoldUnit: 'grams',
  productDiamond: 'Diamond:',
  productDiamondUnit: 'carats',
  productGem: 'Gem:',
  productGemUnit: 'carats',
  productRemark: 'Remark:',

  // simple-scanner
  simpleScannerTitle: 'Take a photo of QR Code or Barcode',
  simpleScannerCaptureBtn: 'Take Photo',
  simpleScannerOrDivider: 'or select from gallery',
  simpleScannerGalleryBtn: 'Select from Gallery',
  simpleScannerSelectedLabel: 'Selected image:',
  simpleScannerRemoveBtn: 'Remove Image',
  simpleScannerReadingText: 'Reading QR Code...',
  simpleScannerErrNoQr: 'No QR Code or Barcode found in image',
  simpleScannerErrReadFail: 'Unable to read image'
}

export const dashboard = {
  quickActionsTitle: 'Topics',
  scanQrLabel: 'Scan QR',
  quotationLabel: 'Quotation',
  saleOrderLabel: 'Sale Order',
  myJobsTitle: 'My Jobs',
  viewAllBtn: 'View All',
  emptyJobTitle: 'No jobs',
  emptyJobSubtitle: 'No jobs in the system yet',
  confirmCancelJob: 'Do you want to cancel job "{jobRunning}"?',
  confirmCancelTitle: 'Confirm Cancel'
}

export const tasks = {
  pageTitle: 'My Jobs',
  pageSubtitle: 'All jobs list',
  filterAll: 'All',
  filterActive: 'In Progress',
  filterCompleted: 'Completed',
  emptyTitle: 'No jobs',
  emptySubtitle: 'No jobs in the system yet',
  loadMoreBtn: 'Load More',
  confirmCancelJob: 'Do you want to cancel job "{jobRunning}"?',
  confirmCancelTitle: 'Confirm Cancel'
}

export const profile = {
  personalInfoItem: 'Personal Info',
  changePasswordItem: 'Change Password',
  notificationsItem: 'Notifications',
  logoutBtn: 'Logout',
  confirmLogoutTitle: 'Logout',
  defaultUserName: 'User',
  defaultRole: 'Pending Approval'
}

export const quotation = {
  // index
  dateFilterLabel: 'Quotation Date',
  dateFilterPlaceholder: 'Select date',
  unknownCustomer: 'Unknown Customer',
  loadMoreBtn: 'Load More',
  emptyTitle: 'No Quotations',
  emptySubtitle: 'No quotations found for the selected date',

  // detail
  detailInfoTitle: 'Quotation Info',
  detailNumberLabel: 'No.:',
  detailDateLabel: 'Date:',
  detailCurrencyLabel: 'Currency:',
  detailExchangeRateLabel: 'Exchange Rate:',
  detailRemarkLabel: 'Remark:',
  customerInfoTitle: 'Customer Info',
  customerNameLabel: 'Customer Name:',
  customerPhoneLabel: 'Tel:',
  customerEmailLabel: 'Email:',
  customerAddressLabel: 'Address:',
  itemsTitle: 'Items ({count})',
  itemPriceLabel: 'Price:',
  itemQtyLabel: 'Qty:',
  itemDiscountLabel: 'Discount:',
  itemTotalLabel: 'Total:',
  summaryTitle: 'Price Summary',
  summaryTotal: 'Total ({currency})',
  summaryEquivalentThb: 'Equivalent (THB)',
  summarySpecialDiscount: 'Special Discount',
  summarySpecialAddition: 'Special Surcharge',
  summaryGrandTotal: 'Grand Total',
  createSoBtn: 'Create Sale Order',
  exportPdfBtn: 'Export PDF',
  exportingPdfBtn: 'Generating PDF...',
  errorLoadTitle: 'Not Found',
  errorLoadSubtitle: 'Unable to load quotation data',
  retryBtn: 'Try Again',
  errorExportPdf: 'Error exporting PDF',
  errorTitle: 'Error'
}

export const notifications = {
  pageTitle: 'Notifications',
  emptyTitle: 'No notifications',
  emptySubtitle: 'This feature will be developed in the future'
}

export const saleIndex = {
  tabSo: 'Sale Order',
  tabInvoice: 'Invoice',
  unknownCustomer: 'Unknown Customer',
  loadMoreBtn: 'Load More',
  soEmptyTitle: 'No Sale Orders',
  soEmptySubtitle: 'No sale orders created by you yet',
  invoiceEmptyTitle: 'No Invoices',
  invoiceEmptySubtitle: 'No invoices created by you yet',
  createSoBtn: 'Create Sale Order',
  totalLabel: 'Total',
  bahtUnit: 'Baht',
  itemsUnit: 'items'
}

export const costVersion = {
  // Header
  headerTitle: 'Cost Version Detail',

  // Loading / empty states
  loadingText: 'Loading...',
  emptyTitle: 'Not Found',
  emptySubtitle: 'Unable to load appraisal data',
  retryBtn: 'Try Again',

  // Stock info card
  stockInfoTitle: 'Stock Information',
  stockNumberLabel: 'Stock No.:',
  runningLabel: 'Appraisal No.:',
  createDateLabel: 'Create Date:',
  createByLabel: 'Created By:',

  // Customer info card
  customerInfoTitle: 'Customer Information',
  customerCodeLabel: 'Customer Code:',
  customerNameLabel: 'Customer Name:',
  customerTelLabel: 'Tel:',
  customerEmailLabel: 'Email:',
  customerAddressLabel: 'Address:',

  // Currency conversion card
  currencyTitle: 'Currency Conversion',
  currencyUnitLabel: 'Currency',
  currencyRateLabel: 'Exchange Rate (1 unit = ? THB)',
  currencyUnitPlaceholder: 'e.g. US$, EUR',
  currencyRatePlaceholder: 'e.g. 33.50',

  // Cost details card
  costDetailsTitle: 'Cost Items',
  equivalentBaht: 'Equivalent {amount} THB',
  tagPriceLabel: 'Tag Price (× {multiplier})',

  // Cost item table
  tableQty: 'Qty',
  tablePricePerUnit: 'Price/Unit',
  tableWeight: 'Weight',
  tablePricePerWeight: 'Price/Weight',
  tableTotal: 'Total',

  // Cost groups
  groupGold: 'Gold Items',
  groupGem: 'Material Items',
  groupWorker: 'Craftsman Items',
  groupEmbed: 'Embed Items',
  groupEtc: 'Additional Items',

  // Remark card
  remarkTitle: 'Remark',

  // Export PDF button
  exportPdfBtn: 'Export PDF',
  exportingPdfBtn: 'Generating PDF...',

  // Alerts
  warnNoCostVersion: 'Appraisal data not found',
  warnLoadingStock: 'Loading stock data, please wait',
  successExportPdf: 'PDF exported successfully',
  successTitle: 'Success',
  errorExportPdf: 'Error exporting PDF',
  errorTitle: 'Error'
}

export const components = {
  jobCard: {
    // job-card.vue has no hardcoded Thai text (uses store data)
  }
}

export const sale = {
  // add-item-method-selector
  methodAppraisal: 'From Appraisal List',
  methodScan: 'Scan Product',

  // appraisal-job-list
  loadingAppraisalJobs: 'Loading appraisal list...',
  emptyAppraisalTitle: 'No Appraisal Items',
  emptyAppraisalSubtitle: 'No completed appraisal jobs yet',
  warnItemAlreadyAdded: 'This item has already been added',

  // customer-form
  customerSectionTitle: 'Customer Info',
  btnSearchCustomer: 'Search Customer',
  btnCreateCustomer: 'Add New Customer',
  fieldCustomerName: 'Customer Name',
  fieldCustomerTel: 'Phone Number',
  fieldCustomerEmail: 'Email',
  fieldCustomerAddress: 'Address',

  // customer-create-modal
  createModalTitle: 'Add New Customer',
  btnClose: 'Close',
  btnSave: 'Save',
  fieldCustomerCode: 'Customer Code',
  fieldCustomerType: 'Customer Type',
  placeholderCustomerCode: 'CUST-YYMMDD-XXXX',
  placeholderCustomerType: 'Select customer type',
  fieldNameTh: 'Thai Name',
  fieldNameEn: 'English Name',
  placeholderNameTh: 'Customer Name (Thai)',
  placeholderNameEn: 'Customer Name (English)',
  placeholderAddress: 'Contact address',
  fieldTel: 'Phone Number',
  placeholderTel: 'Contact phone number',
  placeholderEmail: 'email@example.com',
  fieldContactName: 'Contact Person',
  placeholderContactName: 'Contact person name',
  placeholderRemark: 'Remark (optional)',
  warnEnterCodeAndName: 'Please enter customer code and name',
  warnSelectType: 'Please select customer type',
  warnIncompleteTitle: 'Incomplete Information',
  successCreateCustomer: 'Customer added successfully',

  // customer-search-modal
  searchModalTitle: 'Search Customer',
  searchPlaceholder: 'Customer name, customer code...',
  loadMoreBtn: 'Load More',
  searchEmptyFound: 'No customers found',
  searchEmptyPrompt: 'Please search for a customer',

  // item-card
  itemCostLabel: 'Cost',
  itemCostUnit: 'Baht',
  itemFieldPrice: 'Tag Price/piece',
  itemFieldQty: 'Quantity',
  itemFieldDiscount: 'Discount %',
  itemTotalLabel: 'Total',
  itemTotalUnit: 'Baht',
  itemSourceAppraisal: 'Appraisal',
  itemSourceQuotation: 'Quotation',
  itemSourceScan: 'Scan',

  // item-list
  itemListTitle: 'Items ({count})',
  itemListEmpty: 'No items in the list yet',

  // so-item-card
  soItemFieldCode: 'Product Code',
  soItemFieldPrice: 'Price',
  soItemFieldQty: 'Quantity',
  soItemFieldDiscount: 'Discount',
  soItemTotalLabel: 'Total',
  soItemTotalUnit: 'Baht',
  soItemPriceUnit: 'Baht',
  soItemDiscountUnit: '%',
  statusConfirmed: 'Confirmed',
  statusInvoicedItem: 'Invoiced',

  // so-summary
  summaryItemCount: 'Item Count',
  summaryItemUnit: 'items',
  summaryTotalLabel: 'Total',
  summaryEquivalent: 'Equivalent',
  summaryBahtUnit: 'Baht',

  // invoice-creation-form
  invoiceFormTitle: 'Create Invoice',
  invoiceNoSection: 'Invoice No. (DK)',
  invoiceNoPlaceholder: 'Enter Invoice number (optional)',
  invoiceItemsSection: 'Select Items',
  invoiceSelectAll: 'Select All ({count} items)',
  invoiceSummarySection: 'Price Summary ({currency})',
  invoiceFob: 'F.O.B Bangkok (Items Total)',
  invoiceSpecialDiscount: 'Special Discount',
  invoiceSpecialAddition: 'Special Surcharge',
  invoiceAfterAdjust: 'Total After Adjustment',
  invoiceFreight: 'Freight & Insurance',
  invoiceBeforeVat: 'Total Before VAT',
  invoiceVat: 'VAT (%)',
  invoiceVatAmount: 'VAT Amount',
  invoiceGrandTotal: 'Invoice Total',
  invoicePaymentSection: 'Payment Information',
  invoicePaymentMethod: 'Payment Method',
  invoicePaymentDays: 'Payment Term (days)',
  invoicePaymentCash: 'Pay Immediately',
  invoiceDeposit: 'Deposit ({currency})',
  invoiceRemaining: 'Remaining Balance',
  invoiceCreateBtn: 'Create Invoice ({count} items)',
  invoiceWarnSelectItems: 'Please select at least 1 item',
  invoiceConfirmTitle: 'Create Invoice',
  invoiceConfirmMsg: 'Confirm create Invoice with {count} items?',
  invoiceErrConfirmStock: 'Unable to confirm stock',
  invoiceSuccessMsg: 'Invoice No.: {number}',
  invoiceSuccessTitle: 'Invoice created successfully',

  // invoice-detail-view
  invoiceDetailTitle: 'Invoice Info',
  invoiceDetailNumber: 'Invoice No.:',
  invoiceDetailSoNumber: 'SO No.:',
  invoiceDetailCreateDate: 'Create Date:',
  invoiceDetailCreateBy: 'Created By:',
  invoiceDetailCurrency: 'Currency:',
  invoiceCustomerTitle: 'Customer Info',
  invoiceCustomerName: 'Customer Name:',
  invoiceCustomerTel: 'Tel:',
  invoiceCustomerAddress: 'Address:',
  invoiceItemsTitle: 'Items ({count})',
  invoiceFobLabel: 'F.O.B Bangkok (Subtotal)',
  invoiceSpecialDiscountLabel: 'Special Discount',
  invoiceSpecialAdditionLabel: 'Special Addition',
  invoiceFreightLabel: 'Freight & Insurance',
  invoiceBeforeVatLabel: 'Total Before VAT',
  invoiceVatLabel: 'VAT ({percent}%)',
  invoiceGrandTotalLabel: 'C.I.F (Grand Total)',
  invoicePaymentTitle: 'Payment Information',
  invoicePaymentMethodLabel: 'Method:',
  invoicePaymentDayLabel: 'Term:',
  invoicePaymentDayUnit: 'days',
  invoiceDepositLabel: 'Deposit:',
  invoiceRemarkTitle: 'Remark',
  invoicePrintSettingsTitle: 'Print Settings',
  invoicePrintNote: 'Changes only affect the printed document. Original data is not modified.',
  invoicePrintNumber: 'Invoice Number',
  invoicePrintDate: 'Invoice Date',
  invoicePrintBtn: 'Print Document',
  invoiceGeneratingBtn: 'Generating PDF...',
  invoicePrintInvoiceBtn: 'Print Invoice',
  invoiceCancelBtn: 'Cancel Invoice + Confirm',
  invoiceCancellingBtn: 'Cancelling...',
  invoiceBackBtn: 'Back',
  invoiceEmptyTitle: 'Not Found',
  invoiceEmptySubtitle: 'Unable to load Invoice data',
  invoiceRetryBtn: 'Try Again',
  invoiceSuccessPdf: 'Invoice PDF',
  invoiceSuccessPdfMsg: 'PDF created successfully',
  invoiceCancelConfirmMsg: 'The system will cancel the Invoice and return items to Unconfirm status',
  invoiceCancelConfirmTitle: 'Confirm Cancel?',
  invoiceCancelSuccessMsg: 'Invoice cancelled and items returned successfully',
  invoiceCancelSuccessTitle: 'Success',

  // Shared (create + detail)
  addItem: 'Add Item',
  searchBy: 'Search by',
  fieldNewCode: 'New Stock Code',
  fieldOldCode: 'Old Stock Code',
  orDivider: 'or',
  currencySection: 'Currency',
  cancelBtn: 'Cancel',
  scanInputPlaceholderNew: 'Enter new stock number (Stock Number)',
  scanInputPlaceholderOld: 'Enter old stock code (Origin)',
  searchProduct: 'Search Product',

  // create-view
  quotationRefBanner: 'Quotation Reference:',
  createSoBtn: 'Create SO',
  createSoAndInvoiceBtn: 'Create SO + Invoice',

  // create-view alerts / validation
  warningEnterStockNumber: 'Please enter stock number',
  errorProductNotFound: 'Product not found',
  errorCheckStockNumber: 'Please check the stock number',
  warnProductAlreadyAdded: 'This product is already in the list',
  successAddProduct: 'Product added successfully',
  warnAddAtLeastOne: 'Please add at least 1 product',
  warnSelectCustomer: 'Please select a customer',
  warnIncompleteData: 'Incomplete information',
  warnSelectCurrency: 'Please specify the currency',
  statusLabelDraft: 'Save Draft',
  statusLabelCreate: 'Create Sale Order',

  // detail-view info
  soInfoTitle: 'Sale Order Info',
  soNumberLabel: 'SO Number:',
  createDateLabel: 'Create Date:',
  createByLabel: 'Created By:',
  currencyLabel: 'Currency:',
  customerInfoTitle: 'Customer Info',
  customerNameLabel: 'Customer Name:',
  customerTelLabel: 'Tel:',
  customerAddressLabel: 'Address:',

  // detail-view edit mode
  currencyEditLabel: 'Currency',
  currencyRateLabel: 'Exchange Rate',
  invoicedItemsTitle: 'Invoiced Items',

  // detail-view summary
  summaryFob: 'F.O.B Bangkok (Total)',
  summarySpecialDiscount: 'Special Discount',
  summarySpecialAddition: 'Special Surcharge',
  summaryBeforeVat: 'Total Before VAT',
  summaryNetTotal: 'Net Total',
  summaryGrandTotal: 'Grand Total',

  // detail-view other cards
  remarkTitle: 'Remark',
  invoiceInfoTitle: 'Invoice Info',
  invoiceNumberLabel: 'Invoice No.:',

  // detail-view action buttons
  saveEditBtn: 'Save Changes',
  editItemsBtn: 'Edit Items',
  pdfLoadingBtn: 'Generating PDF...',
  printSoBtn: 'Print Sale Order',
  showCifLabel: 'Show C.I.F Label',
  invoicedAllBtn: 'All Items Invoiced',
  confirmAndInvoiceBtn: 'Confirm Stock + Invoice',
  invoiceBtn: 'Create Invoice',
  deleteSoBtn: 'Delete Sale Order',

  // detail-view empty state
  emptyTitle: 'Not Found',
  emptySubtitle: 'Unable to load sale order data',
  retryBtn: 'Try Again',

  // detail-view alerts / validation
  warnNoSoData: 'Sale order data not found',
  successCreatePdf: 'PDF created successfully',
  errorCreatePdf: 'Error generating PDF',
  warnCannotDeleteInvoiced: 'Cannot delete sale order because some items have been invoiced. Please cancel the invoice first.',
  warnCannotDeleteTitle: 'Cannot Delete',
  successSaveEdit: 'Changes saved successfully',
  successDeleteSo: 'Sale order deleted successfully',
  confirmDeleteTitle: 'Confirm Delete',

  // detail-view status labels
  statusDraft: 'Draft',
  statusInvoiced: 'Invoiced'
}
