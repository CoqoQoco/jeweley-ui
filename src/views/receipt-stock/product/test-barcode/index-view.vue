<template>
  <div class="app-container">
    <div class="filter-container-highlight">
      <span class="title-text-lg-bg">ทดสอบพิมพ์ BARCODE</span>
    </div>

    <div class="form-col-container mt-2">
      <textarea
        class="form-control"
        v-model="form.barcode"
        placeholder="Barcode --- ZPL Code ---"
        rows="20"
      ></textarea>
    </div>
    <div class="form-col-container mt-2">
      <button class="btn btn-sm btn-main" @click="handlePrint">print</button>
      <button class="btn btn-sm btn-main" @click="checkServiceStatus">check status</button>
    </div>
  </div>
</template>

<script>
import api from '@/axios/axios-helper.js'

import swAlert from '@/services/alert/sweetAlerts.js'

export default {
  data() {
    return {
      form: {
        // กำหนดค่าเริ่มต้นของ form ที่ต้องการ
      }
    }
  },
  methods: {
    generateZPL() {
      // สร้าง ZPL code ตามต้องการ
      return `^XA
  ^FO50,50^BCN,100,Y,N,N
  ^FD123456^FS
  ^XZ`
    },

    async handlePrint() {
      try {
        const zplData = this.generateZPL()
        await api.zebraPrinter.printZPL(zplData)
      } catch (error) {
        console.log(error)
      }
    },

    async checkServiceStatus() {
      try {
        const res = await api.zebraPrinter.getStatus()
        console.log(res)
        //swAlert.success('', res)
        this.form.barcode = JSON.stringify(res)
      } catch (error) {
        //swAlert.error('', 'ไม่สามารถเชื่อมต่อเครื่องพิมพ์ได้')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form';
</style>
