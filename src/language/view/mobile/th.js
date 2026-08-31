export const nav = {
  home: 'หน้าแรก',
  scan: 'สแกน',
  sale: 'ขาย',
  pos: 'POS',
  tasks: 'งาน',
  profile: 'โปรไฟล์'
}

export const pos = {
  // header — โหมดงาน / สกุลเงิน / สลับบิล
  workModeLabel: 'โหมดงาน',
  workModeDomestic: 'ในประเทศ',
  workModeInternational: 'ต่างประเทศ',
  currencyLabel: 'สกุลเงิน',
  rateLabel: 'อัตราแลกเปลี่ยน',
  vatPercentLabel: 'อัตราภาษีมูลค่าเพิ่ม (%)',
  billLabel: 'บิล {n}',
  newCartBtn: 'บิลใหม่',
  removeCartBtn: 'ลบบิลนี้',
  confirmRemoveCartTitle: 'ยืนยันลบบิล',
  confirmRemoveCartMsg: 'ต้องการลบบิลนี้และรายการทั้งหมดในบิลใช่หรือไม่?',
  helpBtn: 'คู่มือการใช้งาน',

  // scan bar
  scanCameraBtn: 'สแกนกล้อง',
  fieldNewCode: 'รหัสสินค้าใหม่',
  fieldOldCode: 'รหัสสินค้าเก่า',
  scanPlaceholderNew: 'กรอกรหัสสินค้าใหม่ (Stock Number)',
  scanPlaceholderOld: 'กรอกรหัสสินค้าเก่า (Origin)',
  warnEnterCode: 'กรุณากรอกรหัสสินค้า',
  errorProductNotFound: 'ไม่พบข้อมูลสินค้า',
  errorCheckCode: 'กรุณาตรวจสอบรหัสสินค้า',
  warnDuplicateItem: 'สินค้าชิ้นนี้อยู่ในตะกร้าแล้ว',
  successAddProduct: 'เพิ่มสินค้าเข้าตะกร้าแล้ว',

  // cart
  cartTitle: 'รายการในตะกร้า',
  cartEmptyTitle: 'ตะกร้าว่าง',
  cartEmptySubtitle: 'สแกนหรือค้นหาสินค้าเพื่อเริ่มขาย',
  itemFieldPrice: 'ราคา',
  itemFieldQty: 'จำนวน',
  itemFieldDiscount: 'ส่วนลด (%)',
  itemTotalLabel: 'รวม',
  removeItemBtn: 'ลบสินค้า',

  // customer chip
  customerTitle: 'ลูกค้า',
  customerWalkin: 'หน้าร้าน',
  addCustomerBtn: '+ ชื่อ/เบอร์',
  changeCustomerBtn: 'เปลี่ยน',
  customerFormTitle: 'ข้อมูลลูกค้า',
  fieldCustomerName: 'ชื่อลูกค้า',
  fieldCustomerTel: 'เบอร์โทร',
  placeholderCustomerName: 'กรอกชื่อลูกค้า',
  placeholderCustomerTel: 'กรอกเบอร์โทร',
  warnEnterNameOrTel: 'กรุณากรอกชื่อหรือเบอร์โทร',
  warnEnterNameForNewCustomer: 'กรุณากรอกชื่อลูกค้าสำหรับสร้างลูกค้าใหม่',
  successFoundCustomer: 'พบข้อมูลลูกค้าเดิม',
  successCreateCustomer: 'สร้างลูกค้าใหม่สำเร็จ',

  // summary + checkout
  summaryItemCount: 'จำนวนสินค้า',
  summaryItemUnit: 'ชิ้น',
  summaryTotalLabel: 'ยอดรวม',
  summaryVatLabel: 'ภาษีมูลค่าเพิ่ม ({percent}%)',
  summaryEquivalent: 'เทียบเท่า',
  summaryBahtUnit: 'บาท',
  checkoutBtn: 'รับเงิน {amount} {unit}',
  checkoutBtnEmpty: 'รับเงิน',

  // checkout sheet — รับชำระเงิน
  checkoutSheetTitle: 'รับชำระเงิน',
  amountToCollect: 'ยอดที่ต้องรับ',
  paymentMethodCash: 'เงินสด',
  paymentMethodTransfer: 'โอนเงิน',
  paymentMethodCheque: 'เช็ค',
  paymentMethodCreditCard: 'บัตรเครดิต',
  paymentMethodCredit: 'เครดิต (กำหนดวัน)',
  cashQuickExact: 'พอดี',
  cashAmountLabel: 'จำนวนเงินที่รับ (เงินสด)',
  changeAmountLabel: 'เงินทอน',
  paymentAmountLabel: 'จำนวนเงิน',
  bankLabel: 'ธนาคาร',
  bankPlaceholder: 'เลือกธนาคาร',
  branchLabel: 'สาขา',
  branchPlaceholder: 'กรอกสาขา',
  referenceNumberLabel: 'เลขที่อ้างอิง',
  referenceNumberPlaceholder: 'กรอกเลขที่อ้างอิง (ถ้ามี)',
  paymentDayLabel: 'จำนวนวันเครดิต',
  addPaymentBtn: 'เพิ่มรายการชำระ',
  paymentListTitle: 'รายการที่รับแล้ว',
  removePaymentBtn: 'ลบรายการ',
  summaryPaid: 'ยอดที่รับแล้ว',
  summaryRemaining: 'ยอดคงเหลือ',
  confirmPaymentBtn: 'ยืนยันรับเงิน',
  warnPaymentAmountRequired: 'กรุณากรอกจำนวนเงิน',
  warnBankRequired: 'กรุณาเลือกธนาคาร',
  warnBranchRequired: 'กรุณากรอกสาขา',
  confirmUnderpaidTitle: 'ยืนยันบันทึกค้างชำระ',
  confirmUnderpaidMsg: 'ยอดคงเหลือ {amount} {unit} จะถูกบันทึกเป็นค้างชำระ ต้องการดำเนินการต่อหรือไม่?',

  // pending — เน็ตหลุดตอนส่งบิล
  pendingBannerTitle: 'บิลนี้ส่งไม่สำเร็จ (เน็ตขัดข้อง)',
  pendingBannerMsg: 'ยังไม่เกิดบิลซ้ำแน่นอน กด "ส่งอีกครั้ง" ได้เลย',
  resendBtn: 'ส่งอีกครั้ง',
  editCartInsteadBtn: 'แก้ไขรายการแทน',

  // done view — ทำรายการสำเร็จ
  doneTitle: 'ทำรายการสำเร็จ',
  doneInvoiceLabel: 'เลขที่ Invoice',
  doneSoLabel: 'เลขที่ใบสั่งขาย',
  doneGrandTotal: 'ยอดรวม',
  donePaid: 'ยอดที่รับแล้ว',
  doneRemaining: 'ยอดค้างชำระ',
  shareReceiptBtn: 'แชร์ใบเสร็จ',
  printReceiptBtn: 'พิมพ์ใบเสร็จ',
  sellMoreBtn: 'ขายต่อ',
  shareUnavailableMsg: 'อุปกรณ์นี้แชร์ไฟล์โดยตรงไม่ได้ ระบบดาวน์โหลดไฟล์ใบเสร็จให้แทน'
}

export const scan = {
  selectTypeTitle: 'เลือกประเภทที่ต้องการสแกน',
  searchBy: 'ค้นหาด้วย',
  orDivider: 'หรือ',
  searchBtn: 'ค้นหา',
  actionZoneTitle: 'การดำเนินการ',
  createCostPlanBtn: 'ออกแผนตีราคา',
  updateStockBtn: 'อัพเดทสต็อก',
  printLabelBtn: 'พิมพ์ป้าย',
  changeLocationBtn: 'เปลี่ยนที่จัดเก็บ',
  futureFeaturesNote: 'ฟีเจอร์การดำเนินการบางส่วนจะพัฒนาในอนาคต',
  scanAgainBtn: 'สแกนอีกครั้ง',
  fieldNewCode: 'รหัสสินค้าใหม่',
  fieldOldCode: 'รหัสสินค้าเก่า',
  scanStockLabel: 'สแกนสินค้า',
  scanStockDesc: 'สแกนสต็อกสินค้าสำเร็จรูป',
  placeholderNewCode: 'กรอกรหัสสินค้าใหม่ (Stock Number)',
  placeholderOldCode: 'กรอกรหัสสินค้าเก่า (Origin)',
  warnEnterCode: 'กรุณากรอกเลขที่ผลิตหรือรหัสสินค้า',
  errorProductNotFound: 'ไม่พบข้อมูลสินค้า',
  errorCheckCode: 'กรุณาตรวจสอบเลขที่ผลิตหรือรหัสสินค้า',
  successCreateCostPlan: 'เลขที่แผนตีราคา: {planNumber}',
  successCreateCostPlanTitle: 'ออกแผนตีราคาสำเร็จ',

  // product-detail-card
  productNoImage: 'ไม่มีรูปภาพ',
  productNewCode: 'เลขที่ผลิต (ใหม่):',
  productOldCode: 'เลขที่ผลิต (เก่า):',
  productCode: 'รหัสสินค้า:',
  productMold: 'แม่พิมพ์:',
  productNameEn: 'ชื่อสินค้า (EN):',
  productNameTh: 'ชื่อสินค้า (TH):',
  productType: 'ประเภทสินค้า:',
  productSize: 'ขนาด:',
  productMetalColor: 'สีของทอง/เงิน:',
  productMetalType: 'ประเภททอง/เงิน:',
  productWo: 'W.O.:',
  productPrice: 'ราคา:',
  productPriceUnit: 'บาท',
  productLocation: 'จัดเก็บ:',
  productMaterialTitle: 'วัตถุดิบ',
  productGold: 'ทอง:',
  productGoldUnit: 'กรัม',
  productDiamond: 'เพชร:',
  productDiamondUnit: 'กะรัต',
  productGem: 'พลอย:',
  productGemUnit: 'กะรัต',
  productRemark: 'หมายเหตุ:',

  // simple-scanner
  simpleScannerTitle: 'ถ่ายรูป QR Code หรือ Barcode',
  simpleScannerCaptureBtn: 'ถ่ายรูป',
  simpleScannerOrDivider: 'หรือเลือกรูปจากแกลเลอรี่',
  simpleScannerGalleryBtn: 'เลือกรูปจากแกลเลอรี่',
  simpleScannerSelectedLabel: 'รูปที่เลือก:',
  simpleScannerRemoveBtn: 'ลบรูป',
  simpleScannerReadingText: 'กำลังอ่าน QR Code...',
  simpleScannerErrNoQr: 'ไม่พบ QR Code หรือ Barcode ในรูป',
  simpleScannerErrReadFail: 'ไม่สามารถอ่านรูปภาพได้'
}

export const dashboard = {
  quickActionsTitle: 'หัวข้องาน',
  scanQrLabel: 'สแกน QR',
  quotationLabel: 'ใบเสนอราคา',
  saleOrderLabel: 'ใบสั่งขาย',
  stockCheckLabel: 'ตรวจคลัง',
  myJobsTitle: 'งานของฉัน',
  viewAllBtn: 'ดูทั้งหมด',
  emptyJobTitle: 'ไม่มีงาน',
  emptyJobSubtitle: 'ยังไม่มีงานในระบบ',
  confirmCancelJob: 'ต้องการยกเลิกงาน "{jobRunning}" ใช่หรือไม่?',
  confirmCancelTitle: 'ยืนยันการยกเลิก'
}

export const stockProduct = {
  title: 'ตรวจคลังสินค้า',
  searchPlaceholder: 'ค้นหาเลขที่ผลิต (รหัสใหม่)',
  filterBtn: 'ตัวกรอง',
  filterTitle: 'ตัวกรองการค้นหา',
  apply: 'ใช้ตัวกรอง',
  empty: 'ไม่พบสินค้า',
  loadMore: 'โหลดเพิ่มเติม',
  tabInfo: 'ข้อมูล',
  tabBalance: 'คงเหลือ',
  tabCost: 'ต้นทุน',
  tabHistory: 'ประวัติ',
  availableShort: 'ว่าง',
  selectVersion: 'เลือกเวอร์ชัน',
  notFoundTitle: 'ไม่พบข้อมูลสินค้า'
}

export const tasks = {
  pageTitle: 'งานของฉัน',
  pageSubtitle: 'รายการงานทั้งหมด',
  filterAll: 'ทั้งหมด',
  filterActive: 'กำลังดำเนินการ',
  filterCompleted: 'เสร็จสิ้น',
  emptyTitle: 'ไม่มีงาน',
  emptySubtitle: 'ยังไม่มีงานในระบบ',
  loadMoreBtn: 'โหลดเพิ่มเติม',
  confirmCancelJob: 'ต้องการยกเลิกงาน "{jobRunning}" ใช่หรือไม่?',
  confirmCancelTitle: 'ยืนยันการยกเลิก'
}

export const profile = {
  personalInfoItem: 'ข้อมูลส่วนตัว',
  changePasswordItem: 'เปลี่ยนรหัสผ่าน',
  notificationsItem: 'การแจ้งเตือน',
  logoutBtn: 'ออกจากระบบ',
  confirmLogoutTitle: 'ออกจากระบบ',
  defaultUserName: 'ผู้ใช้งาน',
  defaultRole: 'รออนุมัติสิทธิ์'
}

export const quotation = {
  // index
  dateFilterLabel: 'วันที่ใบเสนอราคา',
  dateFilterPlaceholder: 'เลือกวันที่',
  unknownCustomer: 'ไม่ระบุลูกค้า',
  loadMoreBtn: 'โหลดเพิ่มเติม',
  emptyTitle: 'ไม่มีใบเสนอราคา',
  emptySubtitle: 'ไม่พบใบเสนอราคาในวันที่เลือก',

  // detail
  detailInfoTitle: 'ข้อมูลใบเสนอราคา',
  detailNumberLabel: 'เลขที่:',
  detailDateLabel: 'วันที่:',
  detailCurrencyLabel: 'สกุลเงิน:',
  detailExchangeRateLabel: 'อัตราแลกเปลี่ยน:',
  detailRemarkLabel: 'หมายเหตุ:',
  customerInfoTitle: 'ข้อมูลลูกค้า',
  customerNameLabel: 'ชื่อลูกค้า:',
  customerPhoneLabel: 'เบอร์โทร:',
  customerEmailLabel: 'อีเมล:',
  customerAddressLabel: 'ที่อยู่:',
  itemsTitle: 'รายการสินค้า ({count})',
  itemPriceLabel: 'ราคา:',
  itemQtyLabel: 'จำนวน:',
  itemDiscountLabel: 'ส่วนลด:',
  itemTotalLabel: 'รวม:',
  summaryTitle: 'สรุปราคา',
  summaryTotal: 'ยอดรวม ({currency})',
  summaryEquivalentThb: 'เทียบเท่า (THB)',
  summarySpecialDiscount: 'ส่วนลดพิเศษ',
  summarySpecialAddition: 'ส่วนเพิ่มพิเศษ',
  summaryGrandTotal: 'ยอดรวมทั้งหมด',
  createSoBtn: 'สร้างใบสั่งขาย',
  exportPdfBtn: 'Export PDF',
  exportingPdfBtn: 'กำลัง Export PDF...',
  errorLoadTitle: 'ไม่พบข้อมูล',
  errorLoadSubtitle: 'ไม่สามารถโหลดข้อมูลใบเสนอราคาได้',
  retryBtn: 'ลองอีกครั้ง',
  errorExportPdf: 'เกิดข้อผิดพลาดในการ Export PDF',
  errorTitle: 'ข้อผิดพลาด'
}

export const notifications = {
  pageTitle: 'การแจ้งเตือน',
  emptyTitle: 'ไม่มีการแจ้งเตือน',
  emptySubtitle: 'Feature นี้จะพัฒนาในอนาคต'
}

export const saleIndex = {
  tabSo: 'Sale Order',
  tabInvoice: 'Invoice',
  unknownCustomer: 'ไม่ระบุลูกค้า',
  loadMoreBtn: 'โหลดเพิ่มเติม',
  soEmptyTitle: 'ไม่มีใบสั่งขาย',
  soEmptySubtitle: 'ยังไม่มีใบสั่งขายที่คุณสร้าง',
  invoiceEmptyTitle: 'ไม่มี Invoice',
  invoiceEmptySubtitle: 'ยังไม่มี Invoice ที่คุณสร้าง',
  createSoBtn: 'สร้างใบสั่งขาย',
  totalLabel: 'ยอดรวม',
  bahtUnit: 'บาท',
  itemsUnit: 'รายการ',

  // list-filter-bar
  searchFieldNumber: 'เลขที่บิล',
  searchFieldCustomer: 'ชื่อลูกค้า',
  searchPlaceholderNumber: 'ค้นหาด้วยเลขที่บิล',
  searchPlaceholderCustomer: 'ค้นหาด้วยชื่อลูกค้า',
  searchBtn: 'ค้นหา',
  clearBtn: 'ล้างค่า',
  scopeMine: 'ของฉัน',
  scopeAll: 'ทั้งบูธ'
}

export const costVersion = {
  // Header
  headerTitle: 'ข้อมูลการตีราคา',

  // Loading / empty states
  loadingText: 'กำลังโหลดข้อมูล...',
  emptyTitle: 'ไม่พบข้อมูล',
  emptySubtitle: 'ไม่สามารถโหลดข้อมูลการตีราคาได้',
  retryBtn: 'ลองอีกครั้ง',

  // Stock info card
  stockInfoTitle: 'ข้อมูลสินค้า',
  stockNumberLabel: 'เลขที่ผลิต:',
  runningLabel: 'เลขที่ใบตีราคา:',
  createDateLabel: 'วันที่สร้าง:',
  createByLabel: 'ผู้สร้าง:',

  // Customer info card
  customerInfoTitle: 'ข้อมูลลูกค้า',
  customerCodeLabel: 'รหัสลูกค้า:',
  customerNameLabel: 'ชื่อลูกค้า:',
  customerTelLabel: 'เบอร์โทร:',
  customerEmailLabel: 'อีเมล:',
  customerAddressLabel: 'ที่อยู่:',

  // Currency conversion card
  currencyTitle: 'แปลงสกุลเงิน',
  currencyUnitLabel: 'สกุลเงิน',
  currencyRateLabel: 'อัตราแลกเปลี่ยน (1 หน่วย = ? บาท)',
  currencyUnitPlaceholder: 'เช่น US$, EUR',
  currencyRatePlaceholder: 'เช่น 33.50',

  // Cost details card
  costDetailsTitle: 'รายการต้นทุน',
  equivalentBaht: 'เทียบเท่า {amount} บาท',
  tagPriceLabel: 'ราคาป้าย (× {multiplier})',

  // Cost item table
  tableQty: 'จำนวน',
  tablePricePerUnit: 'ราคา/หน่วย',
  tableWeight: 'น้ำหนัก',
  tablePricePerWeight: 'ราคา/น้ำหนัก',
  tableTotal: 'รวม',

  // Cost groups
  groupGold: 'รายการทอง',
  groupGem: 'รายการวัถุดิบ',
  groupWorker: 'รายการงานช่าง',
  groupEmbed: 'รายการงานฝัง',
  groupEtc: 'รายการเพิ่มเติม',

  // Remark card
  remarkTitle: 'หมายเหตุ',

  // Export PDF button
  exportPdfBtn: 'Export PDF',
  exportingPdfBtn: 'กำลัง Export PDF...',

  // Alerts
  warnNoCostVersion: 'ไม่พบข้อมูลการตีราคา',
  warnLoadingStock: 'กำลังโหลดข้อมูลสินค้า กรุณารอสักครู่',
  successExportPdf: 'Export PDF สำเร็จ',
  successTitle: 'สำเร็จ',
  errorExportPdf: 'เกิดข้อผิดพลาดในการ Export PDF',
  errorTitle: 'ข้อผิดพลาด'
}

export const components = {
  jobCard: {
    // job-card.vue has no hardcoded Thai text (uses store data)
  }
}

export const sale = {
  // add-item-method-selector
  methodAppraisal: 'จากรายการตีราคา',
  methodScan: 'สแกนสินค้า',

  // appraisal-job-list
  loadingAppraisalJobs: 'กำลังโหลดรายการตีราคา...',
  emptyAppraisalTitle: 'ไม่มีรายการตีราคา',
  emptyAppraisalSubtitle: 'ยังไม่มี Job ตีราคาที่เสร็จสิ้น',
  warnItemAlreadyAdded: 'รายการนี้ถูกเพิ่มแล้ว',

  // customer-form
  customerSectionTitle: 'ข้อมูลลูกค้า',
  btnSearchCustomer: 'ค้นหาลูกค้า',
  btnCreateCustomer: 'เพิ่มลูกค้าใหม่',
  fieldCustomerName: 'ชื่อลูกค้า',
  fieldCustomerTel: 'เบอร์โทรศัพท์',
  fieldCustomerEmail: 'อีเมล',
  fieldCustomerAddress: 'ที่อยู่',

  // customer-create-modal
  createModalTitle: 'เพิ่มลูกค้าใหม่',
  btnClose: 'ปิด',
  btnSave: 'บันทึก',
  fieldCustomerCode: 'รหัสลูกค้า',
  fieldCustomerType: 'ประเภทลูกค้า',
  placeholderCustomerCode: 'CUST-YYMMDD-XXXX',
  placeholderCustomerType: 'เลือกประเภทลูกค้า',
  fieldNameTh: 'ชื่อภาษาไทย',
  fieldNameEn: 'ชื่อภาษาอังกฤษ',
  placeholderNameTh: 'ชื่อลูกค้า (ภาษาไทย)',
  placeholderNameEn: 'Customer Name (English)',
  placeholderAddress: 'ที่อยู่ติดต่อ',
  fieldTel: 'เบอร์โทรศัพท์',
  placeholderTel: 'เบอร์โทรติดต่อ',
  placeholderEmail: 'email@example.com',
  fieldContactName: 'บุคคลติดต่อ',
  placeholderContactName: 'ชื่อบุคคลติดต่อ',
  placeholderRemark: 'หมายเหตุ (ถ้ามี)',
  warnEnterCodeAndName: 'กรุณากรอกรหัสลูกค้าและชื่อ',
  warnSelectType: 'กรุณาเลือกประเภทลูกค้า',
  warnIncompleteTitle: 'ข้อมูลไม่ครบถ้วน',
  successCreateCustomer: 'เพิ่มลูกค้าสำเร็จ',

  // customer-search-modal
  searchModalTitle: 'ค้นหาลูกค้า',
  searchPlaceholder: 'ชื่อลูกค้า, รหัสลูกค้า...',
  loadMoreBtn: 'โหลดเพิ่มเติม',
  searchEmptyFound: 'ไม่พบลูกค้า',
  searchEmptyPrompt: 'กรุณาค้นหาลูกค้า',

  // item-card
  itemCostLabel: 'ต้นทุน',
  itemCostUnit: 'บาท',
  itemFieldPrice: 'ราคาป้าย/ชิ้น',
  itemFieldQty: 'จำนวน',
  itemFieldDiscount: 'ส่วนลด %',
  itemTotalLabel: 'รวม',
  itemTotalUnit: 'บาท',
  itemSourceAppraisal: 'ตีราคา',
  itemSourceQuotation: 'ใบเสนอราคา',
  itemSourceScan: 'สแกน',

  // item-list
  itemListTitle: 'รายการสินค้า ({count})',
  itemListEmpty: 'ยังไม่มีสินค้าในรายการ',

  // so-item-card
  soItemFieldCode: 'รหัสสินค้า',
  soItemFieldPrice: 'ราคา',
  soItemFieldQty: 'จำนวน',
  soItemFieldDiscount: 'ส่วนลด',
  soItemTotalLabel: 'รวม',
  soItemTotalUnit: 'บาท',
  soItemPriceUnit: 'บาท',
  soItemDiscountUnit: '%',
  statusConfirmed: 'ยืนยันแล้ว',
  statusInvoicedItem: 'ออก Invoice แล้ว',

  // so-summary
  summaryItemCount: 'จำนวนรายการ',
  summaryItemUnit: 'รายการ',
  summaryTotalLabel: 'ยอดรวม',
  summaryEquivalent: 'เทียบเท่า',
  summaryBahtUnit: 'บาท',

  // invoice-creation-form
  invoiceFormTitle: 'สร้าง Invoice',
  invoiceNoSection: 'Invoice No. (DK)',
  invoiceNoPlaceholder: 'ระบุเลข Invoice (ไม่บังคับ)',
  invoiceItemsSection: 'เลือกสินค้า',
  invoiceSelectAll: 'เลือกทั้งหมด ({count} รายการ)',
  invoiceSummarySection: 'สรุปราคา ({currency})',
  invoiceFob: 'F.O.B Bangkok (รวมสินค้า)',
  invoiceSpecialDiscount: 'ส่วนลดพิเศษ',
  invoiceSpecialAddition: 'ส่วนเพิ่มพิเศษ',
  invoiceAfterAdjust: 'ยอดรวมหลังปรับ',
  invoiceFreight: 'Freight & Insurance',
  invoiceBeforeVat: 'ยอดรวมก่อน VAT',
  invoiceVat: 'VAT (%)',
  invoiceVatAmount: 'จำนวนเงิน VAT',
  invoiceGrandTotal: 'ยอดรวม Invoice',
  invoicePaymentSection: 'ข้อมูลการชำระเงิน',
  invoicePaymentMethod: 'วิธีการชำระเงิน',
  invoicePaymentDays: 'ระยะเวลาการชำระเงิน (วัน)',
  invoicePaymentCash: 'ชำระทันที',
  invoiceDeposit: 'ราคามัดจำ ({currency})',
  invoiceRemaining: 'ยอดคงเหลือที่ต้องชำระ',
  invoiceCreateBtn: 'สร้าง Invoice ({count} รายการ)',
  invoiceWarnSelectItems: 'กรุณาเลือกสินค้าอย่างน้อย 1 รายการ',
  invoiceConfirmTitle: 'สร้าง Invoice',
  invoiceConfirmMsg: 'ยืนยันสร้าง Invoice {count} รายการ?',
  invoiceErrConfirmStock: 'ไม่สามารถยืนยันสินค้าได้',
  invoiceSuccessMsg: 'เลขที่ Invoice: {number}',
  invoiceSuccessTitle: 'ออก Invoice สำเร็จ',

  // invoice-detail-view
  invoiceDetailTitle: 'ข้อมูล Invoice',
  invoiceDetailNumber: 'เลขที่ Invoice:',
  invoiceDetailSoNumber: 'เลขที่ SO:',
  invoiceDetailCreateDate: 'วันที่สร้าง:',
  invoiceDetailCreateBy: 'ผู้สร้าง:',
  invoiceDetailCurrency: 'สกุลเงิน:',
  invoiceCustomerTitle: 'ข้อมูลลูกค้า',
  invoiceCustomerName: 'ชื่อลูกค้า:',
  invoiceCustomerTel: 'เบอร์โทร:',
  invoiceCustomerAddress: 'ที่อยู่:',
  invoiceItemsTitle: 'รายการสินค้า ({count})',
  invoiceFobLabel: 'F.O.B Bangkok (Subtotal)',
  invoiceSpecialDiscountLabel: 'Special Discount',
  invoiceSpecialAdditionLabel: 'Special Addition',
  invoiceFreightLabel: 'Freight & Insurance',
  invoiceBeforeVatLabel: 'ยอดรวมก่อน VAT',
  invoiceVatLabel: 'VAT ({percent}%)',
  invoiceGrandTotalLabel: 'C.I.F (Grand Total)',
  invoicePaymentTitle: 'ข้อมูลการชำระเงิน',
  invoicePaymentMethodLabel: 'วิธีชำระ:',
  invoicePaymentDayLabel: 'ระยะเวลา:',
  invoicePaymentDayUnit: 'วัน',
  invoiceDepositLabel: 'มัดจำ:',
  invoiceRemarkTitle: 'หมายเหตุ',
  invoicePrintSettingsTitle: 'ตั้งค่าการพิมพ์',
  invoicePrintNote: 'การเปลี่ยนแปลงมีผลเฉพาะเอกสารที่พิมพ์ ข้อมูลต้นฉบับไม่เปลี่ยน',
  invoicePrintNumber: 'Invoice Number',
  invoicePrintDate: 'Invoice Date',
  invoicePrintBtn: 'พิมพ์เอกสาร',
  invoiceGeneratingBtn: 'กำลังสร้าง PDF...',
  invoicePrintInvoiceBtn: 'พิมพ์ Invoice',
  invoiceCancelBtn: 'ยกเลิก Invoice + Confirm',
  invoiceCancellingBtn: 'กำลังยกเลิก...',
  invoiceBackBtn: 'ย้อนกลับ',
  invoiceEmptyTitle: 'ไม่พบข้อมูล',
  invoiceEmptySubtitle: 'ไม่สามารถโหลดข้อมูล Invoice ได้',
  invoiceRetryBtn: 'ลองอีกครั้ง',
  invoiceSuccessPdf: 'Invoice PDF',
  invoiceSuccessPdfMsg: 'สร้าง PDF สำเร็จ',
  invoiceCancelConfirmMsg: 'ระบบจะยกเลิก Invoice และคืนสินค้ากลับสู่สถานะยังไม่ยืนยัน (Unconfirm)',
  invoiceCancelConfirmTitle: 'ยืนยันการยกเลิก?',
  invoiceCancelSuccessMsg: 'ยกเลิก Invoice และคืนสินค้าสำเร็จ',
  invoiceCancelSuccessTitle: 'สำเร็จ',

  // Shared (create + detail)
  addItem: 'เพิ่มสินค้า',
  searchBy: 'ค้นหาด้วย',
  fieldNewCode: 'รหัสสินค้าใหม่',
  fieldOldCode: 'รหัสสินค้าเก่า',
  orDivider: 'หรือ',
  currencySection: 'สกุลเงิน',
  cancelBtn: 'ยกเลิก',
  scanInputPlaceholderNew: 'กรอกรหัสสินค้าใหม่ (Stock Number)',
  scanInputPlaceholderOld: 'กรอกรหัสสินค้าเก่า (Origin)',
  searchProduct: 'ค้นหาสินค้า',

  // create-view
  quotationRefBanner: 'อ้างอิงใบเสนอราคา:',
  createSoBtn: 'สร้าง SO',
  createSoAndInvoiceBtn: 'สร้าง SO + ออก Invoice',

  // create-view alerts / validation
  warningEnterStockNumber: 'กรุณากรอกเลขที่ผลิต',
  errorProductNotFound: 'ไม่พบข้อมูลสินค้า',
  errorCheckStockNumber: 'กรุณาตรวจสอบรหัสสินค้า',
  warnProductAlreadyAdded: 'สินค้านี้ถูกเพิ่มในรายการแล้ว',
  successAddProduct: 'เพิ่มสินค้าสำเร็จ',
  warnAddAtLeastOne: 'กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ',
  warnSelectCustomer: 'กรุณาเลือกลูกค้า',
  warnIncompleteData: 'ข้อมูลไม่ครบถ้วน',
  warnSelectCurrency: 'กรุณาระบุสกุลเงิน',
  statusLabelDraft: 'บันทึกร่าง',
  statusLabelCreate: 'สร้างใบสั่งขาย',
  currencyUnitPlaceholder: 'เช่น US$, EUR',
  successCreateSoMessage: 'เลขที่: {soNumber}',
  successCreateSoTitle: '{label}สำเร็จ',

  // detail-view info
  soInfoTitle: 'ข้อมูลใบสั่งขาย',
  soNumberLabel: 'เลขที่ SO:',
  createDateLabel: 'วันที่สร้าง:',
  createByLabel: 'ผู้สร้าง:',
  currencyLabel: 'สกุลเงิน:',
  customerInfoTitle: 'ข้อมูลลูกค้า',
  customerNameLabel: 'ชื่อลูกค้า:',
  customerTelLabel: 'เบอร์โทร:',
  customerAddressLabel: 'ที่อยู่:',

  // detail-view edit mode
  currencyEditLabel: 'สกุลเงิน',
  currencyRateLabel: 'อัตราแลกเปลี่ยน',
  invoicedItemsTitle: 'ออก Invoice แล้ว',

  // detail-view summary
  summaryFob: 'F.O.B Bangkok (รวมสินค้า)',
  summarySpecialDiscount: 'ส่วนลดพิเศษ',
  summarySpecialAddition: 'ส่วนเพิ่มพิเศษ',
  summaryBeforeVat: 'ยอดรวมก่อน VAT',
  summaryNetTotal: 'ยอดรวมสุทธิ',
  summaryGrandTotal: 'ยอดรวมทั้งหมด',

  // detail-view other cards
  remarkTitle: 'หมายเหตุ',
  invoiceInfoTitle: 'ข้อมูล Invoice',
  invoiceNumberLabel: 'เลขที่ Invoice:',

  // detail-view action buttons
  saveEditBtn: 'บันทึกการแก้ไข',
  editItemsBtn: 'แก้ไขรายการ',
  pdfLoadingBtn: 'กำลังสร้าง PDF...',
  printSoBtn: 'พิมพ์ใบสั่งขาย',
  showCifLabel: 'แสดงป้าย C.I.F',
  invoicedAllBtn: 'ออก Invoice แล้วทั้งหมด',
  confirmAndInvoiceBtn: 'Confirm Stock + ออก Invoice',
  invoiceBtn: 'ออก Invoice',
  deleteSoBtn: 'ลบใบสั่งขาย',

  // detail-view empty state
  emptyTitle: 'ไม่พบข้อมูล',
  emptySubtitle: 'ไม่สามารถโหลดข้อมูลใบสั่งขายได้',
  retryBtn: 'ลองอีกครั้ง',

  // detail-view alerts / validation
  warnNoSoData: 'ไม่พบข้อมูลใบสั่งขาย',
  successCreatePdf: 'สร้าง PDF สำเร็จ',
  errorCreatePdf: 'เกิดข้อผิดพลาดในการสร้าง PDF',
  warnCannotDeleteInvoiced: 'ไม่สามารถลบใบสั่งขายได้ เนื่องจากมีสินค้าที่ออก Invoice แล้ว กรุณายกเลิก Invoice ก่อน',
  warnCannotDeleteTitle: 'ไม่สามารถลบได้',
  successSaveEdit: 'บันทึกการแก้ไขสำเร็จ',
  successDeleteSo: 'ลบใบสั่งขายสำเร็จ',
  confirmDeleteTitle: 'ยืนยันการลบ',

  // detail-view status labels
  statusDraft: 'ร่าง',
  statusInvoiced: 'ออก Invoice แล้ว'
}

export const receipt = {
  shopName: 'Duang Kaew Jewelry',
  customer: 'ลูกค้า',
  noItems: 'ไม่มีรายการสินค้า',
  discount: 'ส่วนลด',
  subtotal: 'ยอดรวม',
  specialDiscount: 'ส่วนลดพิเศษ',
  specialAddition: 'ส่วนเพิ่มพิเศษ',
  freight: 'ค่าขนส่ง',
  vat: 'ภาษีมูลค่าเพิ่ม',
  grandTotal: 'รวมสุทธิ',
  paidBy: 'ชำระโดย',
  paid: 'รับเงิน',
  remaining: 'คงเหลือ',
  thankYou: 'ขอบคุณครับ'
}

// posHelp — คู่มือใช้งาน POS ในแอป (เนื้อหา static ล้วน อ่านได้แม้เน็ตหลุด)
// โครงสร้าง: quickStart (การ์ดสรุป 4 ขั้นตอน แสดงตลอด) + topics[] (accordion ยุบไว้ทั้งหมด)
export const posHelp = {
  pageTitle: 'คู่มือใช้งาน POS',

  quickStart: {
    title: 'ขาย 1 บิลใน 4 ขั้น',
    steps: [
      {
        title: 'สแกนสินค้า',
        desc: 'ยิงกล้องที่ป้าย หรือพิมพ์รหัสแล้วกด Enter เข้าตะกร้าทันที'
      },
      {
        title: 'ใส่ชื่อ/เบอร์ลูกค้า',
        desc: 'ข้ามได้ ระบบใช้ลูกค้า "หน้าร้าน" ให้อัตโนมัติ'
      },
      {
        title: 'กด "รับเงิน"',
        desc: 'เลือกวิธีจ่าย แล้วกด "ยืนยันรับเงิน"'
      },
      {
        title: 'ยื่นใบเสร็จแล้วขายต่อ',
        desc: '"แชร์ใบเสร็จ" ส่ง LINE/อีเมล หรือ "พิมพ์ใบเสร็จ"'
      }
    ]
  },

  topics: [
    {
      icon: 'bi-gear-fill',
      title: 'เตรียมก่อนเปิดบูธ',
      intro: 'ตั้งครั้งเดียวใช้ทั้งงาน กดที่แถบตั้งค่าด้านบนหน้า POS',
      table: {
        headers: ['ช่อง', 'ตั้งเป็นอะไร', 'มีผลกับอะไร'],
        rows: [
          ['โหมดงาน', 'ในประเทศ / ต่างประเทศ', 'สกุลเงินตั้งต้น + ประเภทลูกค้าที่ระบบสร้างให้'],
          ['สกุลเงิน', 'THB สำหรับงานในไทย', 'สกุลที่แสดงบนจอ ใบเสร็จ และที่ใช้เก็บเงิน'],
          ['อัตราแลกเปลี่ยน', 'งานในไทยใส่ 1', 'ใช้แปลงราคาป้าย (บาท) เป็นสกุลที่ขาย'],
          ['อัตราภาษี (%)', 'ปกติ 0 · งานที่ออก VAT ใส่ 7', 'บวก VAT เข้ายอดที่เก็บเงินและใบเสร็จ']
        ]
      },
      warning:
        'อย่าเปลี่ยนกลางคัน ถ้าต้องเปลี่ยนให้ปิดบิลที่ค้างอยู่ให้หมดก่อน ไม่งั้นบิลที่เปิดค้างจะคิดคนละเรต'
    },
    {
      icon: 'bi-upc-scan',
      title: 'เพิ่มสินค้าเข้าตะกร้า',
      list: [
        { label: 'สแกนกล้อง', desc: 'กด "สแกนกล้อง" แล้วยิงที่ป้าย' },
        {
          label: 'พิมพ์รหัส',
          desc: 'พิมพ์แล้วกด Enter สลับได้ระหว่าง "รหัสสินค้าใหม่" กับ "รหัสสินค้าเก่า"'
        },
        {
          label: 'แก้ในบรรทัดสินค้าได้',
          desc: 'ราคา (ตกลงราคาต่างจากป้าย) / จำนวน / ส่วนลด (%) เฉพาะชิ้นนั้น'
        }
      ],
      tip: 'สแกนซ้ำชิ้นเดิมจะเตือน "สินค้าชิ้นนี้อยู่ในตะกร้าแล้ว" เพราะสินค้าแต่ละชิ้นมีชิ้นเดียว ถ้าลูกค้าเอาหลายชิ้นให้แก้ที่ช่อง "จำนวน"'
    },
    {
      icon: 'bi-person-fill',
      title: 'ลูกค้า',
      list: [
        { desc: 'ค่าเริ่มต้น "หน้าร้าน" ขายได้เลยไม่ต้องกรอก' },
        {
          desc: 'กด "+ ชื่อ/เบอร์" ใส่เบอร์ → เคยซื้อแล้ว = ผูกลูกค้าเดิม ขึ้น "พบข้อมูลลูกค้าเดิม" / ลูกค้าใหม่ = ระบบสร้างให้ ออกรหัสเอง'
        }
      ],
      tip: 'ควรขอเบอร์ทุกครั้ง ครั้งหน้าระบบจำได้ทันที และยอดซื้อรวมอยู่ที่ชื่อเดียว'
    },
    {
      icon: 'bi-receipt-cutoff',
      title: 'พักบิล ขายหลายคิวพร้อมกัน',
      list: [{ desc: '"บิลใหม่" เปิดตะกร้าอีกใบ / กดชื่อบิล (บิล 1, บิล 2) เพื่อสลับ / "ลบบิลนี้"' }],
      tip: 'ตะกร้าไม่หาย ปิดแอป จอดับ แบตหมด เปิดใหม่ก็ยังอยู่ครบ'
    },
    {
      icon: 'bi-credit-card-fill',
      title: 'รับเงิน',
      list: [
        { desc: 'ยอดที่ต้องเก็บแสดงบนปุ่ม เช่น "รับเงิน 19,300 THB"' },
        {
          desc: 'วิธีจ่าย: เงินสด (กด "พอดี" หรือใส่เงินที่รับมา ระบบคิดเงินทอน) / โอนเงิน (ต้องเลือกธนาคาร) / เช็ค (ต้องเลือกธนาคารและกรอกสาขา) / บัตรเครดิต / เครดิต (ใส่จำนวนวัน)'
        },
        { desc: 'แบ่งจ่ายหลายวิธี: กด "เพิ่มรายการชำระ" ทีละวิธี ระบบไล่ยอดคงเหลือให้เห็นตลอด' },
        { desc: 'เก็บไม่ครบ: ระบบถามยืนยันแล้วบันทึกส่วนที่เหลือเป็น "ค้างชำระ"' }
      ],
      warning: 'กด "ยืนยันรับเงิน" แล้วคือของจริง: ออกบิลจริง ตัดสต็อกจริง บันทึกเงินจริงทันที ไม่ใช่การทดลอง'
    },
    {
      icon: 'bi-printer-fill',
      title: 'ใบเสร็จ',
      intro: 'หลังขึ้น "ทำรายการสำเร็จ"',
      list: [
        { desc: '"แชร์ใบเสร็จ" → เด้งช่องแชร์ของเครื่อง ส่งเข้า LINE / อีเมล / AirDrop / แอปเครื่องพิมพ์' },
        { desc: '"พิมพ์ใบเสร็จ" → ส่งเข้าเครื่องพิมพ์ที่เชื่อมกับมือถือ (ใบกว้าง 80 มม.)' },
        { desc: '"ขายต่อ" → เคลียร์ตะกร้าเริ่มบิลใหม่' }
      ],
      tip: 'บางเครื่องแชร์ไฟล์ตรงไม่ได้ ระบบจะดาวน์โหลดไฟล์ให้แทนแล้วขึ้นข้อความบอก เปิดจากรายการดาวน์โหลดแล้วส่งต่อเองได้'
    },
    {
      icon: 'bi-exclamation-triangle-fill',
      title: 'เมื่อมีปัญหา',
      table: {
        headers: ['ระบบขึ้นว่า', 'แปลว่า', 'ทำอย่างไร'],
        rows: [
          [
            'บิลนี้ส่งไม่สำเร็จ (เน็ตขัดข้อง)',
            'ส่งบิลไม่ถึงระบบเพราะสัญญาณหลุด',
            'กด "ส่งอีกครั้ง" ได้เลย ไม่เกิดบิลซ้ำแน่นอน ถ้าอยากกลับไปแก้รายการกด "แก้ไขรายการแทน"'
          ],
          [
            'สินค้า … ถูกขายไปแล้วในบิล …',
            'เพื่อนในบูธขายชิ้นนี้ไปก่อนแล้ว',
            'เอาออกจากตะกร้า ให้ลูกค้าเลือกชิ้นอื่น (ข้อความบอกด้วยว่าใครขาย)'
          ],
          [
            'ไม่พบข้อมูลสินค้า',
            'รหัสไม่ตรง หรือค้นผิดประเภทรหัส',
            'สลับ "รหัสสินค้าใหม่" ↔ "รหัสสินค้าเก่า" แล้วลองใหม่'
          ],
          [
            'สินค้าชิ้นนี้อยู่ในตะกร้าแล้ว',
            'สแกนซ้ำชิ้นเดิม',
            'ถ้าต้องการหลายชิ้นให้เพิ่มที่ช่อง "จำนวน"'
          ]
        ]
      },
      note: 'ยกเลิกบิลที่ออกไปแล้ว ทำในเมนู "ขาย" ไม่ใช่ในหน้า POS — เปิดบิลนั้นแล้วยกเลิก Invoice ระบบจะคืนสินค้ากลับเข้าคลังให้'
    },
    {
      icon: 'bi-check2-square',
      title: 'กฎ 4 ข้อของหน้าบูธ',
      rules: [
        'ตั้งค่ารอบงานให้ถูกก่อนขายบิลแรก (สกุลเงิน เรต VAT)',
        'ขอเบอร์ลูกค้าทุกครั้งที่ทำได้',
        'เน็ตหลุดไม่ต้องตกใจ ตะกร้าไม่หาย กดส่งซ้ำได้ไม่เกิดบิลซ้ำ',
        'อย่ากดยืนยันรับเงินเล่น ทุกครั้งคือบิลจริงและตัดสต็อกจริง'
      ]
    }
  ]
}
