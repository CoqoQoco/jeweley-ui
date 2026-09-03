export const nav = {
  home: 'Home',
  scan: 'Scan',
  pos: 'Sell',
  tasks: 'Tasks',
  profile: 'Profile'
}

export const pos = {
  // header — work mode / currency / bill switcher
  workModeLabel: 'Work Mode',
  workModeDomestic: 'Domestic',
  workModeInternational: 'International',
  currencyLabel: 'Currency',
  rateLabel: 'Exchange Rate',
  vatPercentLabel: 'VAT Rate (%)',
  billLabel: 'Bill {n}/{total} ({count})',
  newCartBtn: 'New Bill',
  removeCartBtn: 'Remove Bill',
  confirmRemoveCartTitle: 'Confirm Remove Bill',
  confirmRemoveCartMsg: 'Remove this bill and all its items?',
  helpBtn: 'User Guide',
  pastBillsLabel: 'Past Bills / Cancel Bill',

  // scan bar
  scanCameraBtn: 'Scan Camera',
  scanPlaceholder: 'Enter or scan the product code (new or old)',
  warnEnterCode: 'Please enter a product code',
  errorProductNotFound: 'Product not found',
  errorCheckCode: 'Please check the product code',
  errorNetworkIssue: 'Network issue — please check your internet connection and try again',
  errorNetworkTitle: 'Unable to connect to network',
  warnDuplicateItem: 'This item is already in the cart',
  warnSoldItem: 'This item has already been sold',
  warnReservedItem: 'This item is reserved on another bill',
  warnUnavailableItem: 'This item cannot be sold right now',
  successAddProduct: 'Added to cart',

  // scan bar — fullscreen camera
  scanFullscreenTitle: 'Scan Product Code',
  scanFullscreenHint: 'Point at the product code label',
  torchBtn: 'Torch',
  scanDoneBtn: 'Done',
  scanTypeInsteadBtn: 'Enter code instead',
  scanCartCountLabel: 'Cart: {count} item(s)',
  scanCameraErrorTitle: 'Unable to open camera',
  scanCameraErrorPermission: 'Please allow camera access in your browser settings',
  scanCameraErrorNotFound: 'No camera found on this device',
  scanCameraErrorNotSupported: 'This browser does not support camera access — please use HTTPS',
  scanCameraErrorGeneric: 'Unable to open camera — please try again',

  // cart
  cartTitle: 'Cart Items',
  cartEmptyTitle: 'Cart is empty',
  cartEmptySubtitle: 'Scan or search a product to start selling',
  itemFieldPrice: 'Price',
  itemFieldQty: 'Qty',
  itemFieldDiscount: 'Discount (%)',
  itemTotalLabel: 'Total',
  removeItemBtn: 'Remove item',

  // customer chip
  customerTitle: 'Customer',
  customerWalkin: 'Walk-in',
  addCustomerBtn: 'Name/Phone',
  changeCustomerBtn: 'Change',
  customerFormTitle: 'Customer Info',
  fieldCustomerName: 'Customer Name',
  fieldCustomerTel: 'Phone Number',
  placeholderCustomerName: 'Enter customer name',
  placeholderCustomerTel: 'Enter phone number',
  warnEnterNameOrTel: 'Please enter a name or phone number',
  warnEnterNameForNewCustomer: 'Please enter a name to create a new customer',
  successFoundCustomer: 'Found existing customer',
  successCreateCustomer: 'New customer created',

  // summary + checkout
  summaryItemCount: 'Items',
  summaryItemUnit: 'pcs',
  summaryTotalLabel: 'Total',
  summaryVatLabel: 'VAT ({percent}%)',
  summaryEquivalent: 'Equivalent',
  summaryBahtUnit: 'THB',
  checkoutBtn: 'Charge {amount} {unit}',
  checkoutBtnEmpty: 'Charge',

  // checkout sheet — payment collection
  checkoutSheetTitle: 'Collect Payment',
  amountToCollect: 'Amount Due',
  paymentMethodCash: 'Cash',
  paymentMethodTransfer: 'Bank Transfer',
  paymentMethodCheque: 'Cheque',
  paymentMethodCreditCard: 'Credit Card',
  paymentMethodCredit: 'Credit (Term)',
  cashQuickExact: 'Exact',
  cashAmountLabel: 'Cash Received',
  changeAmountLabel: 'Change',
  paymentAmountLabel: 'Amount',
  bankLabel: 'Bank',
  bankPlaceholder: 'Select bank',
  branchLabel: 'Branch',
  branchPlaceholder: 'Enter branch',
  referenceNumberLabel: 'Reference No.',
  referenceNumberPlaceholder: 'Enter reference number (optional)',
  paymentDayLabel: 'Credit Days',
  addPaymentBtn: 'Add Payment',
  paymentListTitle: 'Payments Received',
  removePaymentBtn: 'Remove',
  summaryPaid: 'Paid',
  summaryRemaining: 'Remaining',
  confirmPaymentBtn: 'Confirm Payment',
  warnPaymentAmountRequired: 'Please enter an amount',
  warnBankRequired: 'Please select a bank',
  warnBranchRequired: 'Please enter a branch',
  confirmUnderpaidTitle: 'Confirm Outstanding Balance',
  confirmUnderpaidMsg: 'The remaining {amount} {unit} will be recorded as outstanding. Continue?',

  // pending — network failure during checkout
  pendingBannerTitle: 'Bill not sent (network issue)',
  pendingBannerMsg: 'No duplicate bill will be created — tap "Resend" to try again',
  resendBtn: 'Resend',
  editCartInsteadBtn: 'Edit Cart Instead',

  // duplicate key guard — first submit (not "Resend") but backend says this bill was already recorded (should not happen)
  errorDuplicateBillTitle: 'This bill was already recorded',
  errorDuplicateBillMsg: 'This bill was already recorded. Please start a new bill and try again.',

  // done view — checkout complete
  doneTitle: 'Sale Complete',
  doneInvoiceLabel: 'Invoice No.',
  doneSoLabel: 'Sale Order No.',
  doneGrandTotal: 'Grand Total',
  donePaid: 'Paid',
  doneRemaining: 'Outstanding',
  shareReceiptBtn: 'Share Receipt',
  printReceiptBtn: 'Print Receipt',
  sellMoreBtn: 'Sell More',
  viewAllBillsBtn: 'View All Bills',
  shareUnavailableMsg: 'This device cannot share files directly — the receipt will be downloaded instead',
  printUnavailableMsg: 'Could not print the receipt. Please make sure RawBT is installed, or use the Share Receipt button instead',

  // print queue — send receipt to the booth printer queue (for iOS which cannot use Web Bluetooth)
  viewReceiptBtn: 'View Receipt',
  sendToPrintBtn: 'Send to Print',
  receiptPreviewTitle: 'Receipt Preview',
  printQueueEnqueueErrorMsg: 'Failed to send to print queue. Please try again.',
  printQueueStatusPending: 'Sent to queue — printing at booth...',
  printQueueStatusPrinted: 'Printed',
  printQueueStatusFailed: 'Print failed'
}

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
  stockCheckLabel: 'Stock Check',
  myJobsTitle: 'My Jobs',
  viewAllBtn: 'View All',
  emptyJobTitle: 'No jobs',
  emptyJobSubtitle: 'No jobs in the system yet',
  confirmCancelJob: 'Do you want to cancel job "{jobRunning}"?',
  confirmCancelTitle: 'Confirm Cancel'
}

export const stockProduct = {
  title: 'Stock Check',
  searchPlaceholder: 'Search stock number',
  filterBtn: 'Filter',
  filterTitle: 'Search Filters',
  apply: 'Apply Filter',
  empty: 'No products found',
  loadMore: 'Load more',
  tabInfo: 'Info',
  tabBalance: 'Balance',
  tabCost: 'Cost',
  tabHistory: 'History',
  availableShort: 'Avail',
  selectVersion: 'Select version',
  notFoundTitle: 'Product not found'
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
  itemsUnit: 'items',

  // list-filter-bar
  searchFieldNumber: 'Bill Number',
  searchFieldCustomer: 'Customer Name',
  searchPlaceholderNumber: 'Search by bill number',
  searchPlaceholderCustomer: 'Search by customer name',
  searchBtn: 'Search',
  clearBtn: 'Clear',
  scopeMine: 'Mine',
  scopeAll: 'All Booth'
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
  currencyUnitPlaceholder: 'e.g. US$, EUR',
  successCreateSoMessage: 'No.: {soNumber}',
  successCreateSoTitle: '{label} successfully',

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

export const receipt = {
  shopName: 'Duang Kaew Jewelry',
  customer: 'Customer',
  noItems: 'No items',
  discount: 'Discount',
  subtotal: 'Subtotal',
  specialDiscount: 'Special Discount',
  specialAddition: 'Special Addition',
  freight: 'Freight',
  vat: 'VAT',
  grandTotal: 'Grand Total',
  paidBy: 'Paid By',
  paid: 'Paid',
  remaining: 'Remaining',
  thankYou: 'Thank you'
}

// posHelp — in-app POS user guide (fully static content, works offline)
// Structure: quickStart (always-visible 4-step summary card) + topics[] (accordion, collapsed by default)
export const posHelp = {
  pageTitle: 'POS User Guide',

  quickStart: {
    title: 'Sell One Bill in 4 Steps',
    steps: [
      {
        title: 'Scan the product',
        desc: 'Scan the tag with the camera, or type the code and press Enter to add it to the cart instantly'
      },
      {
        title: 'Enter customer name/phone',
        desc: 'Optional — the system uses "Walk-in" automatically if skipped'
      },
      {
        title: 'Tap "Charge"',
        desc: 'Choose a payment method, then tap "Confirm Payment"'
      },
      {
        title: 'Hand over the receipt and sell the next one',
        desc: '"Share Receipt" sends it via LINE/email, or "Print Receipt" to print it'
      }
    ]
  },

  topics: [
    {
      icon: 'bi-gear-fill',
      title: 'Set Up Before Opening the Booth',
      intro: 'Set once and use for the whole event — tap the settings bar at the top of the POS page',
      table: {
        headers: ['Field', 'Set To', 'Affects'],
        rows: [
          ['Work Mode', 'Domestic / International', 'Default currency + the customer type the system creates'],
          [
            'Currency',
            'THB for events in Thailand',
            'The currency shown on screen, on the receipt, and used to collect payment'
          ],
          ['Exchange Rate', 'Enter 1 for events in Thailand', 'Used to convert the tag price (Baht) into the selling currency'],
          ['VAT Rate (%)', 'Normally 0 · enter 7 for events issuing VAT', 'Adds VAT to the amount collected and the receipt']
        ]
      },
      warning:
        "Don't change these mid-event. If you must change them, close out all open bills first — otherwise open bills will be calculated at a different rate."
    },
    {
      icon: 'bi-upc-scan',
      title: 'Add Products to the Cart',
      list: [
        { label: 'Scan Camera', desc: 'Tap "Scan Camera" and scan the tag' },
        {
          label: 'Type the code',
          desc: 'Type either the new or old stock code and press Enter — the system searches both automatically'
        },
        {
          label: 'Edit on the item line',
          desc: 'Price (if agreeing on a price different from the tag), Qty, or Discount (%) — for that item only'
        }
      ],
      tip: 'Scanning the same item again shows "This item is already in the cart" because every item is unique. If the customer wants more than one, adjust the "Qty" field instead.'
    },
    {
      icon: 'bi-person-fill',
      title: 'Customer',
      list: [
        { desc: 'Defaults to "Walk-in" — you can sell right away without filling anything in' },
        {
          desc: 'Tap "Name/Phone" and enter a phone number → if they\'ve bought before, it links to the existing customer and shows "Found existing customer"; a new customer is created automatically with its own code'
        }
      ],
      tip: "Ask for a phone number every time — the system will recognize the customer instantly next time, and their total purchases stay under one name."
    },
    {
      icon: 'bi-receipt-cutoff',
      title: 'Hold Bills — Sell Multiple Queues at Once',
      list: [
        { desc: '"New Bill" opens another cart / tap a bill name (Bill 1, Bill 2) to switch / "Remove Bill" to delete it' }
      ],
      tip: 'Carts are never lost — closing the app, screen off, or a dead battery — reopen and everything is still there.'
    },
    {
      icon: 'bi-credit-card-fill',
      title: 'Collect Payment',
      list: [
        { desc: 'The amount to collect is shown on the button, e.g. "Charge 19,300 THB"' },
        {
          desc: 'Payment methods: Cash (tap "Exact" or enter the cash received — the system calculates change) / Bank Transfer (bank required) / Cheque (bank and branch required) / Credit Card / Credit (Term) (enter number of days)'
        },
        { desc: 'Split across multiple methods: tap "Add Payment" for each method — the remaining balance always stays visible' },
        { desc: 'Underpaid: the system asks for confirmation, then records the remaining balance as outstanding' }
      ],
      warning:
        'Tapping "Confirm Payment" is final: it issues a real bill, deducts real stock, and records real payment immediately — this is not a test.'
    },
    {
      icon: 'bi-printer-fill',
      title: 'Receipt',
      intro: 'After "Sale Complete" appears',
      list: [
        { desc: '"Share Receipt" → opens the device share sheet — send via LINE / email / AirDrop / a printer app' },
        { desc: '"Print Receipt" → sends it to a printer connected to the phone (80mm paper)' },
        { desc: '"Sell More" → clears the cart and starts a new bill' }
      ],
      tip: "Some devices can't share files directly — the system downloads the receipt file instead and shows a message. Open it from your downloads to share it manually."
    },
    {
      icon: 'bi-exclamation-triangle-fill',
      title: 'When Something Goes Wrong',
      table: {
        headers: ['System Shows', 'Meaning', 'What To Do'],
        rows: [
          [
            'Bill not sent (network issue)',
            'The bill did not reach the system because the connection dropped',
            'Tap "Resend" — no duplicate bill will ever be created. To go back and edit the items instead, tap "Edit Cart Instead"'
          ],
          [
            'Product … was already sold in bill …',
            'A teammate at the booth already sold this item',
            'Remove it from the cart and let the customer pick another item (the message also shows who sold it)'
          ],
          [
            'Product not found',
            "The code doesn't match either the new or old stock code",
            'Double-check the code on the tag and try again'
          ],
          [
            'This item has already been sold / is reserved on another bill',
            'The system checks the product status instantly when scanned',
            'Remove it from the cart and let the customer pick another item'
          ],
          [
            'This item is already in the cart',
            'The same item was scanned twice',
            'If more than one is needed, increase the "Qty" field instead'
          ]
        ]
      },
      note: 'You cannot cancel an issued bill from the POS page. Tap the settings button (⚙) at the top of the Sell page → "Past Bills / Cancel Bill", or tap "View All Bills" on the completion screen after a sale — open that bill and cancel the Invoice; the system will return the item to stock automatically.'
    },
    {
      icon: 'bi-check2-square',
      title: '4 Rules for the Booth',
      rules: [
        'Set up the event correctly before the first sale (currency, VAT rate)',
        "Ask for the customer's phone number whenever possible",
        "Don't panic if the network drops — the cart is never lost, and resending never creates a duplicate bill",
        "Don't tap Confirm Payment for fun — every tap creates a real bill and deducts real stock"
      ]
    }
  ]
}
