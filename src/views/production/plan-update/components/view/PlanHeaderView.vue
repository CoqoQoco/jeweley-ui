<template>
  <div class="form-custom-col-container">
    <!-- img -->
    <div class="filter-container">
      <div class="image-container">
        <img v-if="imageUrl" class="image-preview" :src="imageUrl" alt="Image" preview />
        <div v-else class="spinner-border" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </div>
      <div class="line"></div>
      <div class="d-flex justify-content-center">
        <pdf class="btn btn-sm btn-primary btn-custom mr-2" :modelValue="model" :matValue="modelMat">
        </pdf>
        <button class="btn btn-sm btn-warning mr-2" @click="onShowFormHeaderUpdate">
          <span>
            <i class="bi bi-brush"></i>
          </span>
          <!-- <span>เเก้ไข</span> -->
        </button>
        <button class="btn btn-sm btn-secondary" disabled>
          <span>
            <i class="bi bi-trash"></i>
          </span>
          <!-- <span>หลอม</span> -->
        </button>
      </div>
    </div>

    <!-- detail -->
    <div class="filter-container">
      <div class="form-col-container filter-container-highlight-custom pl-4">
        <div class="d-flex flex-column">
          <span class="title-text-white">W.O.</span>
          <span class="desc-text-white">{{ model.wo }}</span>
        </div>
        <div class="d-flex flex-column">
          <span class="title-text-white">ลำดับ</span>
          <span class="desc-text-white">{{ model.woNumber }}</span>
        </div>
      </div>
      <div class="form-col-container pl-3 mt-4">
        <div class="d-flex flex-column">
          <span class="title-text">เเม่พิมพ์</span>
          <span class="desc-text">{{ model.mold }}</span>
        </div>
      </div>

      <div class="form-col-container pl-3 mt-4">
        <div class="d-flex flex-column">
          <span class="title-text">กำหนดส่งสินค้า</span>
          <span class="desc-text">{{ formatDate(model.requestDate) }}</span>
        </div>
        <div class="d-flex flex-column">
          <span class="title-text">สร้างแผนผลิต</span>
          <span class="desc-text">{{ formatDate(model.createDate) }}</span>
        </div>
      </div>
      <div class="line"></div>
      <div class="form-col-container pl-3 mt-4">
        <div class="d-flex flex-column">
          <span class="title-text">ชื่อลูกค้า</span>
          <span class="desc-text">{{ model.customerName }}</span>
        </div>
        <div class="d-flex flex-column">
          <span class="title-text">รหัสลูกค้า</span>
          <span class="desc-text">{{ model.customerNumber }}</span>
        </div>
        <div class="d-flex flex-column">
          <span class="title-text">ประเภทลูกค้า</span>
          <span class="desc-text">{{ getCustomerType(model.customerType) }}</span>
        </div>
      </div>
      <div class="line"></div>
      <div class="form-col-container pl-3 mt-4">
        <div class="d-flex flex-column">
          <span class="title-text">ชื่อสินค้า</span>
          <span class="desc-text">{{ model.productName ? model.productName : '-' }}</span>
        </div>
        <div class="d-flex flex-column">
          <span class="title-text">รหัสสินค้า</span>
          <span class="desc-text">{{ model.productNumber ? model.productNumber : '-' }}</span>
        </div>
        <div class="d-flex flex-column">
          <span class="title-text">ประเภทสินค้า</span>
          <span class="desc-text">{{ getProductType(model.productType) }}</span>
        </div>
      </div>
      <div class="form-col-container filter-container-highlight-custom pl-4 mt-2">
        <div class="d-flex flex-column">
          <span class="title-text-white">จำนวนสินค้า</span>
          <span class="desc-text-white">{{ model.productQty ? model.productQty : '-' }}</span>
        </div>
        <div class="d-flex flex-column">
          <span class="title-text-white">หน่วย</span>
          <span class="desc-text-white">{{
            model.productQtyUnit ? model.productQtyUnit : '-'
          }}</span>
        </div>
      </div>
      <div class="form-col-container pl-3 mt-4">
        <div class="d-flex flex-column">
          <span class="title-text">รายละเอียดสินค้า</span>
          <span class="desc-text">{{ model.productDetail }}</span>
        </div>
      </div>
      <div class="line"></div>
      <div class="form-col-container pl-3 mt-4">
        <div class="d-flex flex-column">
          <span class="title-text">หมายเหตุ</span>
          <span class="desc-text">{{ model.remark ? model.remark : '-' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const pdf = defineAsyncComponent(() =>
  import('@/components/pdf-make/FilePDFProductionPlanView.vue')
)

import moment from 'dayjs'
import api from '@/axios/axios-helper.js'
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
    },
    modelCustomerType() {
      return this.masterCustomerType
    },
    modelProductType() {
      return this.masterProductType
    }
  },
  watch: {
    async 'model.mold'() {
      await this.fetchImageData()
    }
  },
  data() {
    return {
      imageUrl: '',
      txt: 'Bootstrap is developed mobile first, a strategy in which we optimize code for mobile devices first and then scale up components as necessary using CSS media queries. To ensure proper rendering and touch zooming for all devices, add the responsive viewport meta tag to your <head>.Bootstrap is developed mobile first, a strategy in which we optimize code for mobile devices first and then scale up components as necessary using CSS media queries. To ensure proper rendering and touch zooming for all devices, add the responsive viewport meta tag to your <head>.'
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
@import '@/assets/scss/custom-style/standard-form.scss';
.filter-container-highlight-custom {
  border: 1px solid #dddddd;
  border-radius: 5px;

  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  background-color: var(--base-font-color);
  padding: 10px;
}
.form-custom-col-container {
  display: grid;
  gap: 10px;
  padding: 0px;
  grid-template-columns: 4fr 5fr;
  height: calc(100vh - 170px);
}
.form-custom-one-col-container {
  display: grid;
  gap: 10px;
  grid-template-columns: 4fr;
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
  height: calc(100vh - 250px);
}
.image-preview {
  width: auto;
  height: calc(100vh - 250px);
  object-fit: contain;
}
.data-container {
}
</style>
