<template>
  <div class="filter-container-content">
    <!-- header -->
    <div class="d-flex align-items-center justify-content-between title-text-lg-bg">
      <div class="mr-2">
        <span class="mr-2"><i class="bi bi-journal-text"></i></span>
        <span>ปริ้นเรซิ่น</span>
      </div>
      <div>
        <span>{{ formatDate(resin?.createDate) }}</span>
      </div>
    </div>

    <div class="row">
      <div class="col-4">
        <stageImageEditor
          :planId="value.id"
          stage="resin"
          :imageString="resin?.image"
          :version="resin?.updateDate"
          previewType="PLANMOLDRESIN"
          previewPath=""
          label="รูปปริ้นเรซิ่น"
          :maxImages="1"
          :editable="value.status !== 500"
          @updated="$emit('updated')"
        />
      </div>
      <div class="col-8">
        <div class="form-col-sm-container">
          <div class="d-flex flex-column">
            <span class="title-text">น้ำหนักรับ</span>
            <span class="desc-text">{{ resin?.qtyReceive }}</span>
          </div>
          <div class="d-flex flex-column">
            <span class="title-text">น้ำหนักส่ง</span>
            <span class="desc-text">{{ resin?.qtySend }}</span>
          </div>
          <div class="d-flex flex-column">
            <span class="title-text">ปริ้นเรซิ่นโดย</span>
            <span class="desc-text">{{ resin?.workBy }}</span>
          </div>
          <div></div>
        </div>
      </div>
    </div>
    <div class="form-col-sm-container contaianer-image">
      <div class="d-flex flex-column">
        <span class="title-text">รายละเอียด</span>
        <span class="desc-text">{{ resin?.remark ?? `-` }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { formatDate } from '@/services/utils/dayjs.js'
import stageImageEditor from './stage-image-editor.vue'

export default {
  components: {
    stageImageEditor
  },

  props: {
    modelValue: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },

  emits: ['updated'],

  computed: {
    value() {
      return this.modelValue
    },
    resin() {
      return this.value.resin
    }
  },

  methods: {
    formatDate(date) {
      return formatDate(date)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.contaianer-image {
  padding: 10px;
}
</style>
