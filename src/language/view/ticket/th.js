export default {
  createTitle: 'แจ้งปัญหา / ขอฟีเจอร์',
  myTicketTitle: 'Ticket ของฉัน',

  tab: {
    report: 'แจ้งใหม่',
    my: 'Ticket ของฉัน'
  },
  manageTitle: 'จัดการ Ticket',
  manageDesc: 'ติดตามและจัดการรายการแจ้งปัญหา/ขอฟีเจอร์ทั้งหมด',
  myTicketDesc: 'รายการแจ้งปัญหา/ขอฟีเจอร์ที่คุณสร้าง',
  detailTitle: 'รายละเอียด Ticket',

  field: {
    ticketNo: 'เลขที่ Ticket',
    type: 'ประเภท',
    topic: 'หัวข้อเมนู',
    title: 'หัวข้อปัญหา',
    description: 'รายละเอียด',
    screenshot: 'รูปภาพ / Screenshot',
    status: 'สถานะ',
    devAnalysis: 'ผลการวิเคราะห์ (Dev)',
    devResponse: 'คำตอบถึงผู้แจ้ง',
    createBy: 'แจ้งโดย',
    createDate: 'วันที่แจ้ง',
    updateDate: 'อัปเดตล่าสุด',
    keyword: 'ค้นหา'
  },

  type: {
    bug: 'แจ้งปัญหา (Bug)',
    feature: 'ขอฟีเจอร์ใหม่'
  },

  status: {
    open: 'เปิด',
    inProgress: 'กำลังดำเนินการ',
    resolved: 'แก้เสร็จ',
    closed: 'ปิด'
  },

  placeholder: {
    type: 'เลือกประเภท',
    topic: 'เลือกเมนูที่เกี่ยวข้อง',
    title: 'ระบุหัวข้อสั้นๆ เช่น: ปุ่มบันทึกไม่ทำงาน',
    description: 'อธิบายรายละเอียดปัญหา หรือสิ่งที่ต้องการเพิ่ม...',
    status: 'ทุกสถานะ',
    keyword: 'ค้นหาด้วยหัวข้อ, คำอธิบาย...'
  },

  btn: {
    submit: 'ส่ง Ticket',
    updateStatus: 'อัปเดตสถานะ',
    saveDev: 'บันทึกข้อมูล Dev'
  },

  confirm: {
    submit: 'ยืนยันส่ง Ticket',
    updateStatus: 'ยืนยันอัปเดตสถานะ',
    saveDev: 'ยืนยันบันทึกข้อมูล Dev'
  },

  success: {
    submit: 'ส่ง Ticket สำเร็จ',
    updateStatus: 'อัปเดตสถานะสำเร็จ',
    saveDev: 'บันทึกข้อมูล Dev สำเร็จ'
  },

  warning: {
    typeRequired: 'กรุณาเลือกประเภท',
    topicRequired: 'กรุณาเลือกเมนูที่เกี่ยวข้อง',
    titleRequired: 'กรุณากรอกหัวข้อปัญหา',
    descriptionRequired: 'กรุณากรอกรายละเอียด',
    requiredFields: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน',
    imageTypeInvalid: 'ประเภทไฟล์ไม่ถูกต้อง กรุณาเลือกไฟล์รูปภาพ',
    imageSizeExceeded: 'รูปภาพขนาดใหญ่เกินไป (สูงสุด {max} MB)'
  },

  section: {
    detail: 'รายละเอียดปัญหา',
    images: 'รูปภาพ / Screenshot'
  },

  label: {
    userManualPlaceholder: 'ปุ่มคู่มือ (user-manual skill)',
    addImage: 'เพิ่มรูป',
    maxImages: 'สูงสุด {max} รูป',
    noImage: 'ไม่มีรูป'
  },

  log: {
    title: 'บันทึกการแก้ไข (Log)',
    addBtn: 'เพิ่มบันทึก',
    placeholder: 'พิมพ์สิ่งที่แก้ / วิธีแก้...',
    actionStatus: 'เปลี่ยนสถานะ',
    actionDev: 'อัปเดตข้อมูล Dev',
    actionNote: 'บันทึก',
    empty: 'ยังไม่มีบันทึกการแก้ไข',
    success: {
      add: 'เพิ่มบันทึกสำเร็จ'
    }
  },

  thread: {
    analysisTitle: 'ผลการวิเคราะห์ (Dev)',
    responseTitle: 'คำตอบถึงผู้แจ้ง',
    replyTitle: 'คำตอบจากทีมพัฒนา',
    changeTitle: 'สิ่งที่เราแก้เข้าไป',
    progressTitle: 'ความคืบหน้า',
    addBtn: 'เพิ่ม',
    sendBtn: 'ส่ง',
    placeholder: 'พิมพ์ข้อความ...',
    empty: 'ยังไม่มีรายการ',
    roleDev: 'ทีมพัฒนา',
    roleUser: 'ผู้แจ้ง',
    systemBadge: 'ระบบ',
    deleteBtn: 'ลบ',
    confirmDelete: 'ยืนยันลบความคิดเห็นนี้?',
    success: {
      add: 'บันทึกสำเร็จ',
      delete: 'ลบสำเร็จ'
    }
  },

  manual: {
    title: 'คู่มือการแจ้งปัญหา / ขอฟีเจอร์',
    btnLabel: 'คู่มือ',
    step1Title: 'เลือกประเภท',
    step1Desc: 'เลือกว่าต้องการแจ้งปัญหา (Bug) หรือขอฟีเจอร์ใหม่ (Feature) จาก dropdown "ประเภท"',
    step2Title: 'เลือกหัวข้อเมนู',
    step2Desc: 'เลือกเมนูในระบบที่เกี่ยวข้องกับปัญหา หรือฟีเจอร์ที่ต้องการ เช่น "จัดการสต็อก", "ใบสั่งผลิต" เป็นต้น',
    step3Title: 'กรอกหัวข้อและรายละเอียด',
    step3Desc: 'กรอก "หัวข้อปัญหา" สั้นๆ กระชับ เช่น "ปุ่มบันทึกไม่ทำงาน" แล้วกรอก "รายละเอียด" อธิบายขั้นตอนที่ทำให้เกิดปัญหา หรืออธิบายสิ่งที่ต้องการเพิ่มเติมให้ครบถ้วน',
    step4Title: 'แนบรูปภาพ / Screenshot (ถ้ามี)',
    step4Desc: 'กดปุ่ม "เลือกรูป" เพื่อแนบ screenshot หรือรูปภาพประกอบ ขนาดไม่เกิน 5 MB ขั้นตอนนี้ไม่บังคับ แต่จะช่วยให้ทีมพัฒนาเข้าใจปัญหาได้เร็วขึ้น',
    step5Title: 'กดส่ง Ticket และติดตามสถานะ',
    step5Desc: 'กดปุ่ม "ส่ง Ticket" เพื่อบันทึก หลังจากส่งแล้วสามารถติดตามความคืบหน้าได้ที่เมนู "Ticket ของฉัน" ในแถบเมนูด้านซ้าย'
  }
}
