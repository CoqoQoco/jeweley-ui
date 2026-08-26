export default {
  companyInfo: {
    pageTitle: 'ตั้งค่าข้อมูลบริษัท',
    pageDescription: 'ข้อมูลนี้ใช้บนหัวเอกสาร PDF ทุกใบ (ใบขายวัตถุดิบ · ใบแจ้งหนี้ มาตรฐาน 2 · ใบวางบิล)',
    sectionCompany: 'ข้อมูลบริษัท',
    sectionBank: 'บัญชีธนาคาร',
    companyName: 'ชื่อบริษัท',
    taxId: 'เลขประจำตัวผู้เสียภาษี',
    address: 'ที่อยู่',
    phone: 'โทรศัพท์',
    fax: 'แฟกซ์',
    email: 'อีเมล',
    bankName: 'ธนาคาร',
    accountName: 'ชื่อบัญชี',
    accountNumber: 'เลขที่บัญชี',
    swift: 'SWIFT',
    branch: 'สาขา',
    accountNumberHint: 'เว้น "เลขที่บัญชี" ว่างไว้ = ไม่พิมพ์กล่อง Payment Options ลงเอกสาร',
    validation: {
      companyNameRequired: 'กรุณากรอกชื่อบริษัท',
      taxIdRequired: 'กรุณากรอกเลขประจำตัวผู้เสียภาษี',
      addressRequired: 'กรุณากรอกที่อยู่'
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
    saveSuccess: 'บันทึกค่า Break Down สำเร็จ'
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
