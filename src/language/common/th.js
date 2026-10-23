export default {
  btn: {
    save: 'บันทึก',
    cancel: 'ยกเลิก',
    search: 'ค้นหา',
    clear: 'ล้าง',
    delete: 'ลบ',
    edit: 'แก้ไข',
    add: 'เพิ่ม',
    close: 'ปิด',
    confirm: 'ยืนยัน',
    export: 'ส่งออก',
    create: 'สร้าง',
    back: 'กลับ',
    advancedSearch: 'ค้นหาเพิ่มเติม',
    view: 'ดูรายละเอียด',
    more: 'เพิ่มเติม',
    select: 'เลือก',
    reset: 'รีเซ็ต',
    refresh: 'รีเฟรช',
    retry: 'ลองใหม่',
    download: 'ดาวน์โหลด',
    upload: 'Upload',
    copy: 'คัดลอก',
    logout: 'ออกจากระบบ',
    print: 'พิมพ์',
    downloadPng: 'ดาวน์โหลด PNG',
    genBarcode: 'สร้างบาร์โค้ด'
  },
  field: {
    code: 'รหัส',
    name: 'ชื่อ',
    nameTh: 'ชื่อ (ไทย)',
    nameEn: 'ชื่อ (อังกฤษ)',
    status: 'สถานะ',
    type: 'ประเภท',
    remark: 'หมายเหตุ',
    createDate: 'วันที่สร้าง',
    updateDate: 'วันที่แก้ไข',
    createBy: 'สร้างโดย',
    updateBy: 'แก้ไขโดย',
    quantity: 'จำนวน',
    weight: 'น้ำหนัก',
    price: 'ราคา',
    total: 'รวม',
    description: 'คำอธิบาย',
    action: 'การดำเนินการ',
    phone: 'เบอร์โทร',
    email: 'อีเมล',
    showDecimals: 'แสดงทศนิยม (2 ตำแหน่ง)',
    seller: 'พนักงานขาย'
  },
  label: {
    user: 'ผู้ใช้งาน',
    pendingRole: 'รออนุมัติสิทธิ์',
    noData: 'ไม่พบข้อมูล',
    notSpecified: 'ไม่ระบุ',
    loading: 'กำลังโหลด...',
    all: 'ทั้งหมด',
    hidePrice: 'ไม่แสดงราคา',
    labelNoDashNotice:
      'ป้ายสินค้าพิมพ์เลขสินค้าแบบไม่มีขีด (-) แล้ว เช่น DK-20G-123 จะพิมพ์เป็น DK20G123 เพื่อให้ป้ายสั้นลง ข้อมูลในระบบไม่เปลี่ยน ป้ายเก่าที่มีขีดยังสแกนได้ตามปกติ',
    start: 'เริ่มต้น',
    end: 'สิ้นสุด',
    startDate: 'เริ่มต้น',
    endDate: 'สิ้นสุด',
    advancedSearch: 'ค้นหาเพิ่มเติม',
    searchPlaceholder: 'พิมพ์บางอย่างเพื่อค้นหา',
    incompleteData: 'ข้อมูลไม่ครบถ้วน',
    confirmDelete: 'ยืนยันการลบ',
    barcode: 'บาร์โค้ด',
    barcodeInvalid: 'สร้างบาร์โค้ดจากรหัสนี้ไม่ได้'
  },
  table: {
    showing: 'แสดงข้อมูล',
    of: 'จากทั้งหมด',
    entries: 'รายการ'
  },
  price: {
    currency: 'สกุลเงิน',
    full: 'ราคาเต็ม',
    discount: 'ส่วนลด',
    sale: 'ราคาขาย',
    modePrice: 'ราคา',
    modePercent: '%',
    percentPlaceholder: 'ส่วนลด %',
    percentNeedFull: 'กรอกราคาเต็มก่อน',
    percentOff: '≈ {percent}% off',
    preview: 'ตัวอย่าง',
    errorSaleExceedsFull: 'ราคาขายต้องไม่เกินราคาเต็ม',
    errorNegative: 'ราคาต้องไม่ติดลบ',
    invalidBlock: 'ราคาของบางรายการไม่ถูกต้อง กรุณาแก้ไขก่อนบันทึก'
  },
  catalogPdf: {
    title: 'ตัวเลือกการสร้าง PDF',
    showPrice: 'แสดงราคา',
    showStrike: 'แสดงส่วนลดแบบขีดฆ่าราคาเต็ม',
    countWithPrice: 'มีราคา {count} รายการ',
    countWithoutPrice: 'ไม่มีราคา {count} รายการ (จะไม่แสดงราคา)',
    reasonNoPrice: 'ยังไม่มีสินค้าที่กรอกราคา จึงเปิดแสดงราคาไม่ได้',
    reasonNoPermission: 'คุณไม่มีสิทธิ์ดูราคา',
    confirm: 'สร้าง PDF'
  },
  lang: {
    th: 'ไทย',
    en: 'English'
  },
  alert: {
    invalidData: 'ข้อมูลไม่ถูกต้อง'
  },
  scan: {
    title: 'สแกนรหัสสินค้า',
    hint: 'เล็งไปที่ป้ายรหัสสินค้า',
    torch: 'ไฟฉาย',
    close: 'ปิดกล้อง',
    cameraErrorTitle: 'เปิดกล้องไม่ได้',
    cameraErrorPermission: 'กรุณาอนุญาตให้เว็บใช้กล้องในตั้งค่าเบราว์เซอร์',
    cameraErrorNotFound: 'ไม่พบกล้องบนอุปกรณ์นี้',
    cameraErrorNotSupported: 'เบราว์เซอร์นี้ไม่รองรับการใช้กล้อง กรุณาใช้ผ่าน HTTPS',
    cameraErrorGeneric: 'เปิดกล้องไม่ได้ กรุณาลองใหม่อีกครั้ง'
  },
  rangePreset: {
    title: {
      '1m': '1 เดือนล่าสุด · แสดงรายสัปดาห์',
      '3m': '3 เดือนล่าสุด · แสดงรายสัปดาห์',
      '6m': '6 เดือนล่าสุด · แสดงรายเดือน',
      '1y': '1 ปีล่าสุด · แสดงรายเดือน'
    }
  },
  priceInput: {
    hintEn: '{amount} THB'
  },
  priceCheck: {
    title: 'ราคาดูผิดปกติ ตรวจสอบก่อนบันทึก',
    intro: 'พบราคาที่ผิดปกติ {count} รายการ กรุณาตรวจสอบอีกครั้ง',
    enteredPrice: 'ราคาที่กรอก',
    editPrice: 'แก้ไขราคา',
    useSuggested: 'ใช้ราคาที่แนะนำ',
    confirmPrice: 'ยืนยันราคานี้',
    suggestion: 'ถ้าแก้เป็น {price} จะอยู่ในช่วงปกติ (อาจใส่ 0 เกินหรือขาด 1 ตัว)',
    reason: {
      COST_RATIO: 'ราคาเป็น {value} เท่าของต้นทุนวัตถุดิบ (ปกติ ~{reference} เท่า)',
      COST_RATIO_LOW: 'ราคาต่ำกว่าต้นทุนวัตถุดิบ (เพียง {value} เท่า ปกติ ~{reference} เท่า)',
      TYPE_CEILING: 'สูงกว่าสินค้าประเภทเดียวกันที่แพงที่สุดในคลัง ({reference})',
      PREVIOUS_PRICE: 'ราคาเดิม {reference}',
      SAME_WO: 'สินค้าในใบสั่งผลิตเดียวกันราคาประมาณ {reference}',
      SAME_DESIGN: 'สินค้าแบบเดียวกันราคาประมาณ {reference}'
    }
  },
  printer: {
    reload: 'โหลดรายชื่อใหม่',
    selectPlaceholder: 'เลือกหรือพิมพ์ชื่อเครื่องพิมพ์',
    statusUnreachableTitle: 'เชื่อมต่อโปรแกรมพิมพ์ไม่ได้',
    statusUnreachableStep1: 'เปิดโปรแกรม JewelryPrintBridge.exe ค้างไว้หรือยัง',
    statusUnreachableStep2Prefix: 'ทดสอบเปิด',
    statusUnreachableStep2Suffix: 'ต้องขึ้นคำว่า ok',
    statusUnreachableStep3: 'โปรแกรมต้องเป็นเวอร์ชัน v1.2 ขึ้นไป',
    statusBlocked: 'โปรแกรมพิมพ์ทำงานอยู่ แต่ปฏิเสธคำขอจากเว็บนี้ — กรุณาอัปเดตโปรแกรมเป็นเวอร์ชัน v1.2 ขึ้นไป (เมนูดาวน์โหลดโปรแกรม)',
    statusEmpty: 'โปรแกรมพิมพ์ทำงานอยู่ แต่ไม่พบเครื่องพิมพ์ที่ติดตั้งใน Windows — ตรวจที่ Devices and Printers',
    savedNotFound: 'เครื่องพิมพ์ที่บันทึกไว้ "{name}" ไม่มีในเครื่องนี้ — กรุณาเลือกใหม่',
    manualHint: 'พิมพ์ชื่อเครื่องพิมพ์เองได้ — ดูชื่อจริงที่ Devices and Printers ของ Windows',
    clear: 'ล้างค่า',
    noPrinterSet: 'ยังไม่ได้ตั้งค่าเครื่องพิมพ์บาร์โค้ด',
    goToSetting: 'ไปตั้งค่าเครื่องพิมพ์บาร์โค้ด',
    printFailedTitle: 'พิมพ์ไม่สำเร็จ',
    legacyServiceError: 'เชื่อมต่อโปรแกรม Zebra Print Service ไม่ได้ — เปิดโปรแกรมค้างไว้ก่อนพิมพ์ครับ'
  }
}
