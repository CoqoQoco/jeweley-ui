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
          class="btn btn-sm btn-green btn-custom mr-2"
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
        <button class="btn btn-sm btn-main mr-2" @click="onShowFormHeaderUpdate">
          <span>
            <i class="bi bi-brush"></i>
          </span>
        </button>
        <button class="btn btn-sm btn-red mr-2" @click="onMeltJob">
          <span>
            <i class="bi bi-trash"></i>
          </span>
        </button>
        <button
          :class="['btn btn-sm', isAllowCVD ? 'btn-dark' : 'btn-green']"
          @click="onCVDJob"
          :disabled="isAllowCVD"
        >
          <span>CVD</span>
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

import Gallery from '@/components/prime-vue/GalleryView.vue'

import moment from 'dayjs'
import { formatDate, formatDateTime } from '@/services/utils/dayjs'
import { FilePlanProduction } from '@/services/helper/pdf/FilePlanProduction.js'
import { usePlanUpdateApiStore } from '@/stores/modules/api/plan-update-store.js'
import { confirmSubmit, warning } from '@/services/alert/sweetAlerts.js'
import { getAzureBlobUrl, getAzureBlobAsBase64 } from '@/config/azure-storage-config.js'

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
      //console.log('isAllowCVD', this.modelValue.status)
      const allow = [10, 49, 50, 59, 60, 69, 70, 79, 80, 85, 89, 90]
      allow.includes(this.modelValue.status) ? (res = false) : (res = true)
      return res
    }
  },
  watch: {
    async model(value) {
      let param = []
      if (value.mold) {
        param.push(value.mold)
      }
      if (value.moldSub) {
        param.push(value.moldSub)
      }
      if (param.length > 0) {
        await this.fetchImageData(param)
      }
    }
  },
  data() {
    return {
      imageUrl: [],
      isLoadingImage: false,
      planUpdateStore: usePlanUpdateApiStore()
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
      if (mold && mold.length > 0) {
        this.imageUrl = []
        for (const param in mold) {
          const blobPath = `Mold/${mold[param]}-Mold.png`
          const imageUrl = getAzureBlobUrl(blobPath)
          this.imageUrl.push(imageUrl)
        }

        if (this.form) {
          this.form.requestDate = this.showDate(this.form.requestDate)
        }
      }
    },
    async generatePDF() {
      const blobPath = `Mold/${this.model.mold}-Mold.png`
      const urlImage = await getAzureBlobAsBase64(blobPath, 'mold')
      const pdfBuilder = new FilePlanProduction(this.model, this.modelMat, urlImage)
      pdfBuilder.generatePDF().open()
    },
    onMeltJob() {
      this.$emit('onMeltJob')
    },
    async onCVDJob() {
      confirmSubmit('', 'ยืนยันการดำเนินการ CVD?', async () => {
        await this.processCVDJob()
      })
    },

    async processCVDJob() {
      const selectedItem = {
        wo: this.model.wo,
        woNumber: this.model.woNumber,
        id: this.model.id
      }

      const step1Result = await this.planUpdateStore.submitTransfer({
        formerStatus: this.model.status,
        targetStatus: 95,
        transferBy: null,
        selectedItems: [selectedItem],
        targetStatusCvd: true
      })

      if (step1Result.errors && step1Result.errors.length === 0) {
        await this.planUpdateStore.submitTransfer({
          formerStatus: 95,
          targetStatus: 100,
          transferBy: null,
          selectedItems: [selectedItem],
          targetStatusCvd: true
        })

        this.$emit('onCVDJob')
      } else {
        warning('', 'ไม่สามารถดำเนินการ CVD ได้ (โอนสินค้าไม่สำเร็จ)')
        return false
      }

      return true
    }
  },
  activated() {
    if (this.model) {
      let param = []

      if (this.model.mold) {
        param.push(this.model.mold)
      }

      if (this.model.moldSub) {
        param.push(this.model.moldSub)
      }

      if (param.length > 0) {
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
