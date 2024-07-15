<template>
  <div class="filter-container-content">
    <!-- header -->
    <div class="d-flex align-items-center justify-content-between title-text-lg-bg">
      <div class="mr-2">
        <span class="mr-2"><i class="bi bi-journal-text"></i></span>
        <span>ออกเเบบเเละขึ้น 3D</span>
      </div>
      <div>
        <span>{{ formatDate(valueDesign?.createDate) }}</span>
      </div>
    </div>

    <div class="row">
      <!-- image -->
      <div class="col-4">
        <div class="contaianer-image">
          <div class="title-text">
            <span class="mr-2"><i class="bi bi-image"></i></span>
            <span>รูปต้นเเบบเเม่พิมพ์</span>
          </div>
          <div v-if="stringToArray(valueDesign?.image).length" class="contaianer-image-show">
            <div v-for="(img, index) in stringToArray(valueDesign?.image)" :key="index">
              <imagePreview :imageName="img" type="PLANMOLD" :width="100" :height="100" />
            </div>
          </div>
        </div>
      </div>
      <div class="col-8">
        <div class="form-col-sm-container">
          <div class="d-flex flex-column">
            <span class="title-text">รหัสตั้งเเม่พิมพ์</span>
            <span class="desc-text">{{ valueDesign?.moldCode }}</span>
          </div>
          <div class="d-flex flex-column">
            <span class="title-text">น้ำหนักรับ</span>
            <span class="desc-text">{{ valueDesign?.qtyReceive }}</span>
          </div>
          <div class="d-flex flex-column">
            <span class="title-text">น้ำหนักส่ง</span>
            <span class="desc-text">{{ valueDesign?.qtySend }}</span>
          </div>
          <div class="d-flex flex-column">
            <span class="title-text">ออกกเเบบโดย</span>
            <span class="desc-text">{{ valueDesign?.workBy }}</span>
          </div>
        </div>
        <div class="form-col-sm-container">
          <div class="d-flex flex-column">
            <span class="title-text">ขนาดพลอย</span>
            <span class="desc-text">{{ valueDesign?.sizeGem }}</span>
          </div>
          <div class="d-flex flex-column">
            <span class="title-text">จำนวนพลอย</span>
            <span class="desc-text">{{ valueDesign?.qtyGem }}</span>
          </div>
          <div class="d-flex flex-column">
            <span class="title-text">ขนาดเพชร</span>
            <span class="desc-text">{{ valueDesign?.sizeDiamond }}</span>
          </div>
          <div class="d-flex flex-column">
            <span class="title-text">จำนวนเพชร</span>
            <span class="desc-text">{{ valueDesign?.qtyDiamond }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="form-col-sm-container contaianer-image">
      <div class="d-flex flex-column">
        <span class="title-text">รายละเอียด</span>
        <span class="desc-text">{{ valueDesign?.remark ?? `-` }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const imagePreview = defineAsyncComponent(() => import('@/components/image/PreviewImage.vue'))

import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'
export default {
  components: {
    imagePreview
  },
  props: {
    modelValue: {
      type: Object,
      required: true,
      defualt: () => ({})
    }
  },
  computed: {
    value() {
      console.log('value', this.modelValue)
      return this.modelValue
      //   get() {
      //     return this.modelValue
      //   },
      //   set(val) {
      //     this.$emit('update:modelValue', val)
      //   }
    },
    valueDesign() {
      return this.value.design
    }
  },
  data() {
    return {
      id: null,
      data: {}
    }
  },
  methods: {
    // ------- helper ------- //
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return formatDate(date)
    },
    stringToArray(str) {
      // ตัดช่องว่างหน้าและหลังสตริง
      console.log('stringToArray', str)
      if (str) {
        str = str.trim()
        //console.log('stringToArray', str)

        // ถ้าไม่มีเครื่องหมายจุลภาค ให้คืนค่าเป็น array ที่มีสมาชิกเดียว
        if (!str.includes(',')) {
          return str ? [str] : []
        }

        // แยกด้วยเครื่องหมายจุลภาค, ตัดช่องว่าง, และกรองค่าว่างออก
        const res = str
          .split(',')
          .map((item) => item.trim())
          .filter((item) => item !== '')
        return res
      } else {
        return []
      }
    }
  },
  async created() {}
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
.contaianer-image {
  //border: 1px solid #dddddd;
  //border-radius: 5px;

  //box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  //background-color: #f7f7f7;
  //background-color: var(--base-color);
  padding: 10px;
  //margin: 10px;
}
.contaianer-image-show {
  display: flex;
  justify-content: start;
  align-items: center;
  gap: 5px;
}
</style>
