export default {
  feed: {
    title: 'ประกาศข่าว',
    empty: 'ยังไม่มีประกาศ',
    emptyHint: 'เมื่อมีข่าวใหม่จะแสดงที่นี่ครับ',
    loadMore: 'โหลดเพิ่ม (เหลืออีก {remaining})',
    manage: 'จัดการประกาศ',
    readMore: 'อ่านต่อ',
    by: 'โดย {name}'
  },

  pinnedTag: 'ปักหมุด',

  list: {
    title: 'จัดการประกาศข่าว',
    description: 'สร้าง แก้ไข ซ่อน หรือลบประกาศที่แสดงบนหน้าแรกของทุกคนครับ',
    keyword: 'คำค้น',
    keywordPlaceholder: 'หัวข้อ/เนื้อหา',
    status: 'สถานะ',
    pinned: 'ปักหมุด',
    create: 'สร้างประกาศ',
    col: {
      id: '#',
      title: 'หัวข้อ',
      pinned: 'ปักหมุด',
      window: 'ช่วงแสดง',
      status: 'สถานะ',
      createBy: 'ผู้สร้าง',
      action: ''
    },
    noEnd: 'ไม่หมดอายุ'
  },

  field: {
    title: 'หัวข้อ',
    body: 'เนื้อหา',
    bodyHint: 'ขึ้นบรรทัดใหม่ได้ตามที่พิมพ์ครับ',
    publishStart: 'เริ่มแสดง',
    publishEnd: 'สิ้นสุด',
    publishEndHint: 'ว่าง = ไม่หมดอายุ',
    isPinned: 'ปักหมุดไว้บนสุด',
    isPublished: 'แสดงบนหน้าแรกทันที',
    isPublishedHint: 'ไม่ติ๊ก = เก็บเป็นแบบร่าง',
    image: 'รูปประกอบ (ไม่บังคับ)',
    imageHint: 'jpg/png ไม่เกิน 5 MB 1 รูป'
  },

  status: {
    all: 'ทั้งหมด',
    visible: 'แสดงอยู่',
    hidden: 'ซ่อน',
    scheduled: 'รอแสดง',
    expired: 'หมดอายุ'
  },

  pinnedFilter: {
    all: 'ทั้งหมด',
    yes: 'ปักหมุด',
    no: 'ไม่ปักหมุด'
  },

  form: {
    createTitle: 'สร้างประกาศข่าว',
    editTitle: 'แก้ไขประกาศข่าว',
    section: {
      detail: 'รายละเอียด',
      display: 'การแสดงผล',
      image: 'รูปประกอบ'
    }
  },

  action: {
    edit: 'แก้ไข',
    hide: 'ซ่อน',
    show: 'แสดง',
    delete: 'ลบ',
    removeImage: 'นำรูปออก',
    chooseImage: 'เลือกรูป',
    save: 'บันทึกประกาศ',
    cancel: 'ยกเลิก',
    close: 'ปิด'
  },

  confirm: {
    delete: 'ต้องการลบประกาศนี้หรือไม่',
    save: 'ต้องการบันทึกประกาศหรือไม่',
    hide: 'ต้องการซ่อนประกาศนี้หรือไม่',
    show: 'ต้องการแสดงประกาศนี้หรือไม่'
  },

  alert: {
    saved: 'บันทึกประกาศแล้ว',
    deleted: 'ลบประกาศแล้ว',
    endBeforeStart: 'วันสิ้นสุดต้องไม่ก่อนวันเริ่มแสดง',
    required: 'กรุณากรอกข้อมูลให้ครบ'
  }
}
