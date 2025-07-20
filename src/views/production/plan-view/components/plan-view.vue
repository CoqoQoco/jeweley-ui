<template>
  <div class="form-custom-col-container">
    <!-- img -->
    <div class="filter-container">
      <!-- image -->
      <!-- <div class="image-container">
          <img v-if="imageUrl" class="image-preview" :src="imageUrl" alt="Image" preview />
          <div v-else class="spinner-border" role="status">
            <span class="sr-only">Loading...</span>
          </div>
        </div> -->

      <div class="image-container mt-1">
        <Gallery v-if="this.imageUrl.length > 0" :urls="imageUrl" :autoPlay="true"> </Gallery>
      </div>

      <div class="line"></div>

      <!-- action -->
      <div class="d-flex justify-content-center">
        <pdf
          class="btn btn-sm btn-primary btn-custom mr-2"
          :modelValue="model"
          :matValue="modelMat"
        >
        </pdf>
        <button class="btn btn-sm btn-green btn-custom mr-2" @click="generatePDF">
          <span>
            <i class="bi bi-printer mr-2"></i>
          </span>
          <span>NEW</span>
        </button>
        <button class="btn btn-sm btn-warning mr-2" @click="onShowFormHeaderUpdate">
          <span>
            <i class="bi bi-brush"></i>
          </span>
          <!-- <span>เเก้ไข</span> -->
        </button>
        <button class="btn btn-sm btn-red mr-2" @click="onMeltJob">
          <span>
            <i class="bi bi-trash"></i>
          </span>
          <!-- <span>หลอม</span> -->
        </button>
        <button
          :class="['btn btn-sm', isAllowCVD ? 'btn-secondary' : 'btn-green']"
          @click="onCVDJob"
          :disabled="isAllowCVD"
        >
          <span> CVD </span>
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

      <div class="form-col-container pl-3 mt-4">
        <div class="d-flex flex-column">
          <span class="title-text">สีของทอง/เงิน</span>
          <span class="desc-text">{{ model.gold ?? `-` }}</span>
        </div>
        <div class="d-flex flex-column">
          <span class="title-text">ประเภททอง/เงิน</span>
          <span class="desc-text">{{ model.goldSize ?? `-` }}</span>
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

  <!-- <planOverview class="mt-2" :modelValue="model"></planOverview> -->
</template>

<script>
import { defineAsyncComponent } from 'vue'

const pdf = defineAsyncComponent(() =>
  import('@/components/pdf-make/FilePDFProductionPlanView.vue')
)

import Gallery from '@/components/prime-vue/galleryView.vue'

import moment from 'dayjs'
import api from '@/axios/axios-helper.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs'
import { FilePlanProduction } from '@/services/helper/pdf/FilePlanProduction.js'

//import planOverview from './PlanOverview.vue'

export default {
  components: {
    pdf,
    Gallery
    //planOverview
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
    },

    isAllowCVD() {
      let res = true
      console.log('isAllowCVD', this.modelValue.status)
      const allow = [10, 49, 50, 59, 60, 69, 70, 79, 80, 85, 89, 90]
      allow.includes(this.modelValue.status) ? (res = false) : (res = true)
      return res
    }
  },
  watch: {
    async model(value) {
      let param = []
      //console.log(value)
      if (value.mold) {
        param.push(value.mold)
      }
      if (value.moldSub) {
        param.push(value.moldSub)
      }
      //console.log('watch param:', param)
      if (param.length > 0) {
        await this.fetchImageData(param)
      }
    }
  },
  data() {
    return {
      imageUrl: [],
      isLoadingImage: false
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
        //console.log('fetchImageData:', mold)
        if (mold && mold.length > 0) {
          //loop mold for call api
          this.imageUrl = []
          for (const param in mold) {
            const res = await api.jewelry.get(
              'FileExtension/GetMoldImage',
              {
                imageName: `${mold[param]}-Mold.png`
              },
              { skipLoading: true }
            )
            if (res) {
              if (this.imageUrl.length > 0) {
                this.imageUrl = [...this.imageUrl, `data:image/png;base64,${res}`]
              } else {
                this.imageUrl = [`data:image/png;base64,${res}`]
              }
            }
          }

          if (this.form) {
            this.form.requestDate = this.showDate(this.form.requestDate)
          }

          //console.log('fetchImageData Images:', this.imageUrl)
        }
      } catch (error) {
        //this.isLoadingImage = false
        //this.imageUrl = []
        console.log(error)
      }
    },
    async generatePDF() {
      try {
        // โหลดรูปภาพ
        const param = {
          imageName: `${this.model.mold}-Mold.png`
        }
        const res = await api.jewelry.get('FileExtension/GetMoldImage', param)
        const urlImage = `data:image/png;base64,${res}`

        // สร้าง PDF builder
        const pdfBuilder = new FilePlanProduction(this.model, this.modelMat, urlImage)
        //const pdfBuilder = new FilePlanProduction(this.modelValue, this.urlImage)

        // สร้างและเปิด PDF
        pdfBuilder.generatePDF().open()
      } catch (error) {
        console.error('Failed to generate PDF:', error)
      }
    },
    onMeltJob() {
      this.$emit('onMeltJob')
    },
    onCVDJob() {
      //console.log('onCVDJob')
      this.$emit('onCVDJob')
    }
  },
  async created() {
    //console.log('created this.modelValue:', this.modelValue)

    this.$nextTick(async () => {})
  },
  unmounted() {
    //console.log('unmounted:', this.imageUrl)
  },
  // เพิ่ม activated hook ใน component
  activated() {
    //console.log('activated - component reactivated')
    // เรียกโหลดข้อมูลใหม่เมื่อกลับมาที่ component
    if (this.model) {
      let param = []

      if (this.model.mold) {
        param.push(this.model.mold)
      }

      if (this.model.moldSub) {
        param.push(this.model.moldSub)
      }

      //console.log('activated param:', param)

      if (param.length > 0) {
        // รีเซ็ตอาร์เรย์รูปภาพก่อนโหลดใหม่เมื่อ activated
        this.fetchImageData(param)
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
  grid-template-columns: 5fr 5fr;
  height: calc(100vh - 220px);
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
  height: calc(100vh - 300px);
}
.image-preview {
  width: auto;
  height: calc(100vh - 250px);
  object-fit: contain;
}
.data-container {
}
</style>
