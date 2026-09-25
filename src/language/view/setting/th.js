export default {
  companyInfo: {
    pageTitle: 'ตั้งค่าข้อมูลบริษัท',
    pageDescription: 'ข้อมูลบริษัทกลาง ใช้บนหัวเอกสาร PDF ทุกใบ (ใบขายวัตถุดิบ · ใบแจ้งหนี้ มาตรฐาน 2 · ใบวางบิล) และช่องทางติดต่อ/โซเชียลมีเดีย',
    sectionCompany: 'ข้อมูลบริษัท',
    sectionContact: 'ช่องทางติดต่อ',
    sectionSocial: 'โซเชียลมีเดีย',
    sectionBank: 'บัญชีธนาคาร',
    companyName: 'ชื่อบริษัท (อังกฤษ)',
    companyNameTh: 'ชื่อบริษัท (ไทย)',
    branchLabel: 'สำนักงาน/สาขา',
    taxId: 'เลขประจำตัวผู้เสียภาษี',
    address: 'ที่อยู่ (อังกฤษ)',
    addressTh: 'ที่อยู่ (ไทย)',
    phone: 'โทรศัพท์',
    fax: 'แฟกซ์',
    email: 'อีเมล',
    website: 'เว็บไซต์',
    facebook: 'Facebook',
    instagram: 'Instagram',
    tiktok: 'TikTok',
    lineOa: 'LINE OA',
    socialHint: 'กรอกเป็นชื่อบัญชี ไม่ต้องใส่ลิงก์เต็ม — ระบบจะสร้างลิงก์และ QR Code ให้เองครับ',
    qrBtn: 'QR',
    qrDialogTitle: 'QR Code',
    qrDownloadBtn: 'ดาวน์โหลด PNG',
    qrCopyBtn: 'คัดลอกลิงก์',
    qrCopiedLabel: 'คัดลอกแล้ว',
    qrOpenBtn: 'เปิดลิงก์',
    bankName: 'ธนาคาร',
    accountName: 'ชื่อบัญชี',
    accountNumber: 'เลขที่บัญชี',
    swift: 'SWIFT',
    branch: 'สาขา',
    accountNumberHint: 'เว้น "เลขที่บัญชี" ว่างไว้ = ไม่พิมพ์กล่อง Payment Options ลงเอกสาร',
    validation: {
      companyNameRequired: 'กรุณากรอกชื่อบริษัท',
      companyNameThRequired: 'กรุณากรอกชื่อบริษัท (ไทย)',
      taxIdRequired: 'กรุณากรอกเลขประจำตัวผู้เสียภาษี',
      addressRequired: 'กรุณากรอกที่อยู่',
      addressThRequired: 'กรุณากรอกที่อยู่ (ไทย)',
      emailInvalid: 'รูปแบบอีเมลไม่ถูกต้อง'
    },
    saveSuccess: 'บันทึกข้อมูลบริษัทสำเร็จ',
    confirmSaveTitle: 'ยืนยันการบันทึกข้อมูลบริษัท'
  },
  breakdown: {
    pageTitle: 'ตั้งค่า Break Down',
    pageDescription: 'กำหนดค่า Gold Loss (%) และค่าฝังเพชร/พลอย ที่ใช้คำนวณในใบ Breakdown',
    sectionTitle: 'ค่าพารามิเตอร์ Break Down',
    goldLossPercent: 'Gold Loss (%)',
    settingDiamondRate: 'ค่าฝังเพชร (บาท/เม็ด)',
    settingStoneRate: 'ค่าฝังพลอย (บาท/เม็ด)',
    alloySectionTitle: 'ค่าพารามิเตอร์คำนวณ Alloy',
    alloyFactor18K: 'ตัวคูณ Alloy 18K',
    alloyFactor14K: 'ตัวคูณ Alloy 14K',
    alloyFactor9K: 'ตัวคูณ Alloy 9K',
    alloyRateYgWgUsd: 'ค่า Alloy สีทอง YG/WG (USD/กรัม)',
    alloyRatePgUsd: 'ค่า Alloy สีทอง PG (USD/กรัม)',
    validation: {
      invalidNumber: 'กรุณากรอกตัวเลขที่ไม่ติดลบ'
    },
    saveSuccess: 'บันทึกค่า Break Down สำเร็จ',
    termHistory: {
      sectionTitle: 'คำที่เคยใช้ใน Break Down (ประวัติการพิมพ์)',
      confirmDeleteTitle: 'ยืนยันการลบคำนี้ออกจากประวัติ?',
      deleteSuccess: 'ลบคำออกจากประวัติสำเร็จ'
    }
  },
  barcodePrinter: {
    pageTitle: 'ตั้งค่าเครื่องพิมพ์บาร์โค้ด',
    pageDescription: 'ตั้งค่าเครื่องพิมพ์ฉลากบาร์โค้ด (ZPL) — เลือกได้ทั้งเครื่องเดิม (Zebra Print Service) และ Zebra GT800 (DK Print Bridge)',
    configSectionTitle: 'ตั้งค่าเครื่องพิมพ์',
    configSectionDescription: 'เลือกรุ่นเครื่องพิมพ์และปรับค่าที่ใช้พิมพ์ฉลากบาร์โค้ด',
    profileLabel: 'รุ่นเครื่องพิมพ์',
    profileLegacyLabel: 'เครื่องเดิม (Zebra Print Service)',
    profileGt800Label: 'Zebra GT800 (DK Print Bridge)',
    legacyFieldsHint: 'เครื่องเดิมพิมพ์ผ่านโปรแกรม Zebra Print Service โดยตรง ไม่ต้องตั้งค่าชื่อเครื่องพิมพ์ ความละเอียด หรือระยะหน่วงเพิ่มเติมครับ',
    printerNameLabel: 'ชื่อเครื่องพิมพ์',
    dpiLabel: 'ความละเอียดเครื่องพิมพ์ (DPI)',
    dpiOption203: '203 dpi',
    dpiOption300: '300 dpi',
    dpiHint: 'ฉลากปัจจุบันออกแบบไว้ที่ 203 dpi — ถ้าเครื่องพิมพ์เป็น 300 dpi ระบบจะขยายพิกัดให้อัตโนมัติครับ',
    copyDelayLabel: 'ระยะหน่วงระหว่างฉลาก (มิลลิวินาที)',
    copyDelayHint: 'ระยะเวลาหน่วงก่อนพิมพ์ฉลากดวงถัดไป เมื่อพิมพ์หลายดวงต่อครั้ง',
    rotate180Label: 'กลับด้านงานพิมพ์ 180°',
    rotate180Hint: 'เปิดเมื่อฉลากออกมากลับหัว — ทั้งซ้ายขวาและบนล่างสลับกัน ตั้งค่าแยกแต่ละเครื่องครับ',
    statusSectionTitle: 'สถานะเครื่องพิมพ์',
    statusSectionDescription: 'ตรวจสถานะการเชื่อมต่อกับ DK Print Bridge และเครื่องพิมพ์ที่ตั้งค่าไว้',
    status: {
      readyTitle: 'พร้อมใช้งาน',
      readyDetail: 'พบเครื่องพิมพ์ทั้งหมด {count} เครื่องบนเครื่องนี้',
      noPrinterDetail: 'กรุณาเลือกเครื่องพิมพ์จากรายชื่อด้านบน แล้วกดบันทึกครับ',
      legacyReadyDetail: 'โปรแกรม Zebra Print Service กำลังทำงานอยู่ พร้อมพิมพ์ครับ',
      legacyServiceErrorDetail: 'เปิดโปรแกรม Zebra Print Service ที่เครื่องนี้ค้างไว้ก่อนพิมพ์ครับ'
    },
    testSectionTitle: 'พิมพ์ฉลากทดสอบ',
    testSectionDescription: 'พิมพ์ฉลากทดสอบผ่านเส้นทางจริงที่ใช้พิมพ์ในหน้าคลังสินค้า',
    test: {
      stockNumberLabel: 'เลขที่ผลิต',
      printCountLabel: 'จำนวนดวง',
      printSuccess: 'พิมพ์ฉลากทดสอบสำเร็จครับ'
    },
    saveSuccess: 'บันทึกการตั้งค่าเครื่องพิมพ์บาร์โค้ดสำเร็จครับ',
    resetSuccess: 'รีเซ็ตเป็นค่าเริ่มต้นสำเร็จครับ'
  },
  account: {
    cancelAccount: 'ยกเลิกบัญชี',
    register: 'ลงทะเบียนบัญชี',
    editAccount: 'แก้ไขบัญชี'
  },
  rolePermission: {
    title: 'จัดการสิทธิ์การใช้งาน (Role - Permission)',
    selectRolePrompt: 'กรุณาเลือก Role ด้านซ้ายเพื่อจัดการสิทธิ์',
    saveSuccess: 'บันทึกสิทธิ์สำเร็จ'
  },
  userAccount: {
    title: 'ข้อมูลบัญชี',
    accountInfo: 'ข้อมูลบัญชี',
    loginInfo: 'ข้อมูลการเข้าใช้งาน',
    rolePermission: 'สิทธิ์การใช้งาน',
    changePhoto: 'เปลี่ยนรูป',
    removePhoto: 'ลบรูป',
    firstName: 'ชื่อ',
    lastName: 'นามสกุล',
    registerDate: 'วันที่ลงทะเบียน',
    lastLoginDate: 'วันที่เข้าสู่ระบบล่าสุด',
    roleName: 'ตำแหน่ง',
    roleDesc: 'รายละเอียด',
    confirmSaveTitle: 'ยืนยันการบันทึกรูปโปรไฟล์',
    saveSuccess: 'บันทึกรูปโปรไฟล์สำเร็จ',
    imageError: 'เกิดข้อผิดพลาดในการประมวลผลรูปภาพ',
    status: {
      active: 'ใช้งาน',
      pending: 'รออนุมัติ',
      inactive: 'ไม่ใช้งาน'
    }
  }
}
