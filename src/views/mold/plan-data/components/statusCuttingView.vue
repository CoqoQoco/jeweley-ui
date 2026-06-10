<template>
  <div class="filter-container-content">
    <!-- header -->
    <div class="d-flex align-items-center justify-content-between title-text-lg-bg">
      <div class="mr-2">
        <span class="mr-2"><i class="bi bi-journal-text"></i></span>
        <span>ผ่าพิมพ์ยาง</span>
      </div>
      <div>
        <span>{{ formatDate(item?.createDate) }}</span>
      </div>
    </div>

    <div class="row">
      <div class="col-4">
        <stageImageEditor
          :planId="value.id"
          stage="cutting"
          :imageString="item?.image"
          :version="item?.updateDate"
          previewType="PATH"
          previewPath="MoldPlanCutting"
          label="รูปผ่าพิมพ์ยาง"
          :maxImages="1"
          :editable="value.status !== 500"
          @updated="$emit('updated')"
        />
      </div>
      <div class="col-8">
        <div class="form-col-sm-container">
          <div class="d-flex flex-column">
            <span class="title-text">รหัสแม่พิมพ์</span>
            <span class="desc-text">{{ item?.code }}</span>
          </div>
          <div class="d-flex flex-column">
            <span class="title-text">ผ่าพิมพ์ยางโดย</span>
            <span class="desc-text">{{ item?.workBy }}</span>
          </div>
          <div></div>
          <div></div>
        </div>
      </div>
    </div>
    <div class="form-col-sm-container contaianer-image">
      <div class="d-flex flex-column">
        <span class="title-text">รายละเอียด</span>
        <span class="desc-text">{{ item?.remark ?? `-` }}</span>
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
    item() {
      return this.value.cutting
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
