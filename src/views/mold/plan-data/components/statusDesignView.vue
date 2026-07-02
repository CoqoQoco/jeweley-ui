<template>
  <div class="filter-container-content">
    <!-- header -->
    <div class="d-flex align-items-center justify-content-between title-text-lg-bg">
      <div class="mr-2">
        <span class="mr-2"><i class="bi bi-journal-text"></i></span>
        <span>ออกแบบและขึ้น 3D</span>
      </div>
      <div class="d-flex align-items-center">
        <span class="mr-2">{{ formatDate(valueDesign?.createDate) }}</span>
        <ButtonGeneric
          v-if="value.status !== 500"
          variant="outline"
          icon="bi-pencil"
          :label="$t('view.mold.editDesign.btnEdit')"
          @click="isShowEditModal = true"
        />
      </div>
    </div>

    <editDesignModal
      :isShow="isShowEditModal"
      :modelValue="value"
      @closeModal="isShowEditModal = false"
      @updated="$emit('updated')"
    />

    <div class="row">
      <div class="col-4">
        <stageImageEditor
          :planId="value.id"
          stage="design"
          :imageString="valueDesign?.image"
          :version="valueDesign?.updateDate"
          previewType="PLANMOLD"
          previewPath=""
          label="รูปต้นแบบแม่พิมพ์"
          :maxImages="2"
          :editable="value.status !== 500"
          @updated="$emit('updated')"
        />
      </div>

      <div class="col-8">
        <div v-if="value.isNewProcess" class="form-col-sm-container">
          <div class="d-flex flex-column">
            <span class="title-text">รหัสตั้งแม่พิมพ์</span>
            <span class="desc-text">{{ valueDesign?.moldCode }}</span>
          </div>
          <div class="d-flex flex-column">
            <span class="title-text">ออกแบบโดย</span>
            <span class="desc-text">{{ valueDesign?.workBy }}</span>
          </div>
          <div class="d-flex flex-column">
            <span class="title-text">ปริ้นเรซิ่นโดย</span>
            <span class="desc-text">{{ valueDesign?.resinBy }}</span>
          </div>
        </div>
        <div v-else class="form-col-sm-container">
          <div class="d-flex flex-column">
            <span class="title-text">รหัสตั้งแม่พิมพ์</span>
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
            <span class="title-text">ออกแบบโดย</span>
            <span class="desc-text">{{ valueDesign?.workBy }}</span>
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
import { formatDate } from '@/services/utils/dayjs.js'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import stageImageEditor from './stage-image-editor.vue'
import editDesignModal from '../modal/edit-design-modal.vue'

export default {
  components: {
    stageImageEditor,
    ButtonGeneric,
    editDesignModal
  },

  props: {
    modelValue: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },

  emits: ['updated'],

  data() {
    return {
      isShowEditModal: false
    }
  },

  computed: {
    value() {
      return this.modelValue
    },
    valueDesign() {
      return this.value.design
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
