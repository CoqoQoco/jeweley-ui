#### ช่วยเขียนเเละเเก้ไข code ตามรูปเเบบใน E:\coqo_duangkeaw\Code\jeweley-ui\CLAUDE.md เท่านั้นครับ
#### ถ้ามีการใช้ prime-vue components >> ตรวจสอบว่ามี generic-components ไหม >> ไม่มีให้สร้างไว้เพื่อ re-used >> 



ที่ D:\DuangKeaw\code\jeweley-ui\src\views\mobile\scan\components\simple-scanner.vue
เพิ่ม dropdow เพื่อเลือกว่าจะใช้ 
 รหัสสินค้าเก่า --> productNumber
 รหัสสินค้าใหม่ --> stockNumber

  async searchStockProduct(searchValue) {
      const formValue = {
        stockNumber: searchValue,
        productNumber: searchValue
      }

      const response = await this.productStore.fetchDataGet({ formValue })

      if (response) {
        this.scannedProduct = response
      } else {
        error('ไม่พบข้อมูลสินค้า', 'กรุณาตรวจสอบเลขที่ผลิตหรือรหัสสินค้า')
        this.scannedProduct = null
      }
    },


