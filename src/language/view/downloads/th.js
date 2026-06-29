export default {
  pageTitle: 'ดาวน์โหลดโปรแกรม',
  manualBtn: 'คู่มือ',
  printBridge: {
    name: 'DK Print Bridge',
    desc: 'โปรแกรมตัวกลางสำหรับพิมพ์ฉลากและเอกสารจากระบบไปยังเครื่องพิมพ์บนเครื่องของคุณ ติดตั้งครั้งเดียวใช้ได้ทุกครั้ง'
  },
  manual: {
    title: 'คู่มือการใช้งาน — DK Print Bridge',
    sectionInstall: 'ก) ขั้นตอนติดตั้งและตั้งค่า',
    sectionTrouble: 'ข) ปัญหาที่พบบ่อย',
    step1Title: 'แตกไฟล์ ZIP ไปโฟลเดอร์ถาวร',
    step1Desc: 'แตกไฟล์ dk-print-bridge-v1.0.zip ไปยังโฟลเดอร์ถาวรบนเครื่อง เช่น C:\\DKPrintBridge — ห้ามเก็บไว้ในโฟลเดอร์ Downloads หรือ Desktop เพราะอาจถูกลบโดยอัตโนมัติ',
    step2Title: 'แก้ไขชื่อเครื่องพิมพ์ใน appsettings.json',
    step2Desc: 'เปิดไฟล์ appsettings.json ในโฟลเดอร์ที่แตกออกมา แล้วแก้ไขชื่อเครื่องพิมพ์ให้ตรงกับชื่อที่ปรากฏใน Windows (Control Panel → Devices and Printers) จากนั้นบันทึกไฟล์',
    step3Title: 'เปิดโปรแกรม JewelryPrintBridge.exe',
    step3Desc: 'ดับเบิลคลิก JewelryPrintBridge.exe เพื่อเปิดโปรแกรม หากปรากฏหน้าต่าง SmartScreen ของ Windows ให้คลิก "More info" (ข้อมูลเพิ่มเติม) แล้วคลิก "Run anyway" (เรียกใช้งานต่อไป) โปรแกรมจะติดตั้ง certificate ให้อัตโนมัติในครั้งแรก',
    step4Title: 'ตรวจสอบว่าโปรแกรมทำงานปกติ',
    step4Desc: 'ปล่อยให้หน้าต่าง console ค้างเปิดไว้ (ห้ามปิด) จากนั้นเปิดเบราว์เซอร์แล้วไปที่ https://localhost:9443/health — หากได้รับการตอบกลับ "ok" แสดงว่าโปรแกรมพร้อมใช้งาน',
    step5Title: '(แนะนำ) ตั้งให้รันอัตโนมัติตอนเปิดเครื่อง',
    step5Desc: 'กด Win + R แล้วพิมพ์ shell:startup แล้วกด Enter จากนั้นสร้าง Shortcut ของ JewelryPrintBridge.exe ไว้ในโฟลเดอร์นั้น โปรแกรมจะเริ่มทำงานอัตโนมัติทุกครั้งที่เปิดเครื่อง',
    trouble1: 'ต่อ localhost:9443 ไม่ได้ → ตรวจสอบว่าเปิด JewelryPrintBridge.exe อยู่หรือไม่ และหน้าต่าง console ยังค้างเปิดอยู่',
    trouble2: 'พิมพ์ไม่ออก / ไม่พบเครื่องพิมพ์ → ตรวจสอบชื่อเครื่องพิมพ์ใน appsettings.json ให้ตรงกับชื่อใน Windows',
    trouble3: 'เบราว์เซอร์แจ้งเตือน certificate → ปิดโปรแกรมแล้วเปิดใหม่อีกครั้ง โปรแกรมจะติดตั้ง certificate ซ้ำให้อัตโนมัติ'
  }
}
