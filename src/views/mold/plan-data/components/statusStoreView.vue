<template>
  <div class="filter-container-content">
    <!-- header -->
    <div class="d-flex align-items-center justify-content-between title-text-lg-bg">
      <div class="mr-2">
        <span class="mr-2"><i class="bi bi-journal-text"></i></span>
        <span>จัดเก็บพิมพ์</span>
      </div>
      <div class="d-flex align-items-center">
        <span class="mr-2">{{ formatDate(item?.createDate) }}</span>
        <ButtonGeneric
          v-if="value.status !== 500"
          variant="outline"
          icon="bi-pencil"
          :label="$t('view.mold.editStore.btnEdit')"
          @click="isShowEditModal = true"
        />
      </div>
    </div>

    <editStoreModal
      :isShow="isShowEditModal"
      :modelValue="value"
      @closeModal="isShowEditModal = false"
      @updated="$emit('updated')"
    />

    <div class="row">
      <div class="col-4">
        <stageImageEditor
          :planId="value.id"
          stage="store"
          :imageString="item?.image"
          :version="item?.updateDate"
          previewType="PATH"
          previewPath="Mold"
          label="รูปแม่พิมพ์สำเร็จ"
          :maxImages="1"
          :editable="value.status !== 500"
          @updated="$emit('updated')"
        />
      </div>

      <div class="col-8">
        <div v-if="value.isNewProcess">
          <div class="form-col-sm-container">
            <div class="d-flex flex-column">
              <span class="title-text">รหัสแม่พิมพ์</span>
              <span class="desc-text">{{ item?.code }}</span>
            </div>
            <div class="d-flex flex-column">
              <span class="title-text">จัดเก็บพิมพ์</span>
              <span class="desc-text">{{ getLocationName(item?.location) }}</span>
            </div>
            <div class="d-flex flex-column">
              <span class="title-text">ช่างพิมพ์</span>
              <span class="desc-text">{{ item?.workBy }}</span>
            </div>
          </div>
          <div class="form-col-sm-container mt-2">
            <div class="d-flex flex-column">
              <span class="title-text">น้ำหนักเรซิ่น</span>
              <span class="desc-text">{{ item?.qtyResin }}</span>
            </div>
            <div class="d-flex flex-column">
              <span class="title-text">น้ำหนักพิมพ์เงิน</span>
              <span class="desc-text">{{ item?.qtySilverCast }}</span>
            </div>
            <div class="d-flex flex-column"></div>
          </div>
          <div class="form-col-sm-container mt-2">
            <div class="d-flex flex-column">
              <span class="title-text">แต่งพิมพ์โดย</span>
              <span class="desc-text">{{ item?.printBy }}</span>
            </div>
            <div class="d-flex flex-column">
              <span class="title-text">ผ่าพิมพ์โดย</span>
              <span class="desc-text">{{ item?.cuttingBy }}</span>
            </div>
            <div class="d-flex flex-column"></div>
          </div>
        </div>
        <div v-else class="form-col-sm-container">
          <div class="d-flex flex-column">
            <span class="title-text">รหัสแม่พิมพ์</span>
            <span class="desc-text">{{ item?.code }}</span>
          </div>
          <div class="d-flex flex-column">
            <span class="title-text">จัดเก็บพิมพ์</span>
            <span class="desc-text">{{ getLocationName(item?.location) }}</span>
          </div>
          <div class="d-flex flex-column">
            <span class="title-text">ช่างพิมพ์</span>
            <span class="desc-text">{{ item?.workBy }}</span>
          </div>
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
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import stageImageEditor from './stage-image-editor.vue'
import editStoreModal from '../modal/edit-store-modal.vue'

export default {
  components: {
    stageImageEditor,
    ButtonGeneric,
    editStoreModal
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
      isShowEditModal: false,
      masterLocation: [
        { id: 1, code: 'A', value: 'คลัง 1' },
        { id: 2, code: 'B', value: 'คลัง 2' },
        { id: 3, code: 'C', value: 'คลัง 3' }
      ]
    }
  },

  computed: {
    value() {
      return this.modelValue
    },
    item() {
      return this.value.store
    }
  },

  methods: {
    formatDate(date) {
      return formatDate(date)
    },

    getLocationName(code) {
      const location = this.masterLocation.find((loc) => loc.code === code)
      return location ? location.value : '-'
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
