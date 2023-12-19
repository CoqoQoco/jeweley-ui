<template>
  <div class="form-container">
    <div class="grid-container">
      <div class="data-container">
        <div class="image-container">
          <div v-if="imageUrl">
            <img class="image-preview" :src="imageUrl" alt="Image" preview />
          </div>
          <div v-else class="spinner-border" role="status">
            <span class="sr-only">Loading...</span>
          </div>
        </div>
        <div class="d-flex flex-column ml-2 mr-2 mb-2">
          <span class="txt-title">รายละเอียดสินค้า</span>
          <span class="txt-desc-product">{{ model.productDetail }}</span>
          <!-- <span class="txt-desc"> {{ txt }}</span> -->
        </div>
      </div>
      <div class="data-container">
        <div class="data-txt-deatail-conatiner mb-2 mt-4">
          <div class="d-flex flex-column">
            <span class="txt-title">เลขที่ W.O.</span>
            <span class="txt-desc">{{ model.wo }}</span>
          </div>
          <div class="d-flex flex-column">
            <span class="txt-title">ลำดับ W.O.</span>
            <span class="txt-desc">{{ model.woNumber }}</span>
          </div>
        </div>
        <div class="data-txt-deatail-conatiner mb-2">
          <div class="d-flex flex-column">
            <span class="txt-title">เเม่พิมพ์</span>
            <span class="txt-desc">{{ model.mold }}</span>
          </div>
          <div class="d-flex flex-column">
            <span class="txt-title">กำหนดส่งสินค้า</span>
            <span class="txt-desc">{{ formatDate(model.requestDate) }}</span>
          </div>
          <div class="d-flex flex-column">
            <span class="txt-title">สร้างใบสินค้า</span>
            <span class="txt-desc">{{ formatDate(model.createDate) }}</span>
          </div>
          <div class="d-flex flex-column">
            <span class="txt-title">เเก้ไขใบสินค้าล่าสุด</span>
            <span class="txt-desc">{{
              formatDate(model.updateDate) == null ? formatDate(model.updateDate) : '-'
            }}</span>
          </div>
        </div>
        <div class="data-txt-deatail-conatiner-customer mb-2">
          <div class="d-flex flex-column">
            <span class="txt-title">รหัสลูกค้า</span>
            <span class="txt-desc">{{ model.customerNumber }}</span>
          </div>
          <div class="d-flex flex-column">
            <span class="txt-title">ชื่อลูกค้า</span>
            <span class="txt-desc">{{ model.customerName }}</span>
          </div>
          <div class="d-flex flex-column">
            <span class="txt-title">ประเภทลูกค้า</span>
            <span class="txt-desc">{{ getCustomerType(model.customerType) }}</span>
          </div>
        </div>
        <div class="data-txt-deatail-conatiner mb-2">
          <div class="d-flex flex-column">
            <span class="txt-title">รหัสสินค้า</span>
            <span class="txt-desc">{{ model.productNumber ? model.productNumber : '-' }}</span>
          </div>
          <div class="d-flex flex-column">
            <span class="txt-title">ชื่อสินค้า</span>
            <span class="txt-desc">{{ model.productName ? model.productName : '-' }}</span>
          </div>
          <div class="d-flex flex-column">
            <span class="txt-title">ประเภทสินค้า</span>
            <span class="txt-desc">{{ getProductType(model.productType) }}</span>
          </div>
        </div>
        <div class="data-txt-deatail-conatiner mb-2">
          <div class="d-flex flex-column">
            <span class="txt-title">จำนวนสินค้า</span>
            <span class="txt-desc">{{ model.productQty ? model.productQty : '-' }}</span>
          </div>
          <div class="d-flex flex-column">
            <span class="txt-title">หน่วย</span>
            <span class="txt-desc">{{ model.productQtyUnit ? model.productQtyUnit : '-' }}</span>
          </div>
        </div>
        <div class="data-txt-deatail-remark-conatiner mb-2">
          <div class="d-flex flex-column">
            <span class="txt-title">หมายเหตุ</span>
            <span class="txt-desc">{{ model.remark ? model.remark : '-' }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="d-flex justify-content-end mt-3">
      <!-- <button class="btn btn-sm btn-info btn-custom mr-2">
        <span class="mr-2"> <i class="bi bi-printer"></i> </span>
        <span>พิมพ์เเบบใบสินค้า</span>
      </button> -->
      <pdf
        class="btn btn-sm btn-info btn-custom mr-2"
        :modelValue="model"
        :matValue="modelMat"
      ></pdf>
      <button class="btn btn-sm btn-warning btn-custom" @click="onShowFormHeaderUpdate">
        <span>
          <i class="bi bi-brush mr-2"></i>
        </span>
        <span>เเก้ไขรายละเอียดสินค้า</span>
      </button>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const pdf = defineAsyncComponent(() => import('@/components/pdf-make/SavePDFOrderPlan.vue'))

import moment from 'dayjs'
import api from '@/axios/axios-config.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs'

export default {
  components: {
    pdf
  },
  props: {
    modelValue: {
      type: Object,
      required: true,
      default: () => {}
    },
    modelMatValue: {
      type: Array,
      required: true,
      default: () => []
    },
    masterCustomerType: {
      type: Array,
      required: true,
      default: () => []
    },
    masterProductType: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  computed: {
    model() {
      this.fetchImageData(this.modelValue.mold)
      return this.modelValue
    },
    modelMat() {
      return this.modelMatValue
    }
  },
  watch: {
    async 'model.mold'() {
      //console.log('value')
      //this.form = { ...value }
      await this.fetchImageData()
    }
  },
  data() {
    return {
      // --- from --- //
      form: {},
      imageUrl: '',
      txt: 'Bootstrap is developed mobile first, a strategy in which we optimize code for mobile devices first and then scale up components as necessary using CSS media queries. To ensure proper rendering and touch zooming for all devices, add the responsive viewport meta tag to your <head>.'
    }
  },
  methods: {
    // --- controller --- //
    getCustomerType(item) {
      if (this.masterCustomerType.length) {
        let customer = this.masterCustomerType.filter((x) => x.code === item)
        return customer.length ? `${customer[0].nameTh}` : '-'
      }
    },
    getProductType(item) {
      if (this.masterProductType.length) {
        let customer = this.masterProductType.filter((x) => x.code === item)
        return customer.length ? `${customer[0].nameTh}` : '-'
      }
    },
    onShowFormHeaderUpdate() {
      this.$emit('onShowFormHeaderUpdate')
    },
    // ------ helper ------//
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return date ? formatDate(date) : ''
    },
    showDate(date) {
      return date ? moment(date).format('DD/MM/yyyy') : ''
    },

    // --- APIs --- //
    async fetchImageData(mold) {
      try {
        const param = {
          imageName: `${mold}-Mold.png`
        }
        const res = await api.jewelry.get('FileExtension/GetMoldImage', param)

        if (res) {
          this.imageUrl = `data:image/png;base64,${res}`

          if (this.form) {
            this.form.requestDate = this.showDate(this.form.requestDate)
          }
        }
      } catch (error) {
        console.log(error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.grid-container {
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: 10px;
  margin-bottom: 10px;
  //height: calc(100vh - 250px);
}
.data-container {
  border: 1px solid #dddddd;
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  background-color: #f7f7f7;
  padding: 10px;
  height: calc(100vh - 260px);
  overflow: auto;
}
.data-txt-deatail-conatiner {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 10px;
  padding: 0px 0px 0px 30px;
  font-size: 20px;
}
.data-txt-deatail-conatiner-customer{
   display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 10px;
  padding: 0px 0px 0px 30px;
  font-size: 20px;
}
.data-txt-deatail-remark-conatiner {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  padding: 0px 0px 0px 30px;
  font-size: 20px;
}
.image-container {
  display: grid;
  place-items: center;
  height: 300px;
}
.image-preview {
  max-width: 250px;
  height: auto;
  //border: 1px solid var(--base-color);
  border-radius: 8px;
  object-fit: contain;
}
.txt-title {
  font-size: 15px;
}
.txt-desc {
  font-size: 22px;
  color: var(--base-font-color);
}
.txt-desc-product {
  font-size: 15px;
  color: var(--base-font-color);
}
.btn-custom {
  width: 200px;
}
</style>
