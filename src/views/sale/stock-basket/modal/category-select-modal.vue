<template>
  <modal :showModal="isShow" @closeModal="$emit('closeModal')" width="500px" :isShowActionPart="true">
    <template #title>
      <span class="title-text-lg">
        <i class="bi bi-collection mr-2"></i>เลือกทั้ง Category
      </span>
    </template>
    <template #content>
      <div class="p-3">
        <div class="mb-2">
          <span class="title-text">ProductType</span>
          <input
            class="form-control"
            type="text"
            v-model.trim="categoryFilter.productType"
            placeholder="เช่น Ring, Necklace"
          />
        </div>
        <div class="mb-2">
          <span class="title-text">ProductionType</span>
          <input
            class="form-control"
            type="text"
            v-model.trim="categoryFilter.productionType"
            placeholder="เช่น Gold, Silver"
          />
        </div>
        <div class="mb-2">
          <span class="title-text">ProductionTypeSize</span>
          <input
            class="form-control"
            type="text"
            v-model.trim="categoryFilter.productionTypeSize"
            placeholder="เช่น 18K, 9K"
          />
        </div>
        <div class="mb-2">
          <span class="title-text">เลขที่ใบรับ (ReceiptNumber)</span>
          <input
            class="form-control"
            type="text"
            v-model.trim="categoryFilter.receiptNumber"
            placeholder="เลขที่ใบรับสินค้า"
          />
        </div>
      </div>
    </template>
    <template #action>
      <button class="btn btn-sm btn-main" @click="onConfirm">
        <i class="bi bi-plus-circle"></i>
        <span class="ml-1">เพิ่มทั้งหมด</span>
      </button>
      <button class="btn btn-sm btn-outline-main" @click="$emit('closeModal')">
        <i class="bi bi-x-circle"></i>
        <span class="ml-1">ยกเลิก</span>
      </button>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { warning } from '@/services/alert/sweetAlerts.js'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

const interfaceCategoryFilter = {
  productType: null,
  productionType: null,
  productionTypeSize: null,
  receiptNumber: null
}

export default {
  name: 'CategorySelectModal',

  components: {
    modal
  },

  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },

  emits: ['closeModal', 'categorySelected'],

  data() {
    return {
      categoryFilter: { ...interfaceCategoryFilter }
    }
  },

  watch: {
    isShow(val) {
      if (val) {
        this.categoryFilter = { ...interfaceCategoryFilter }
      }
    }
  },

  methods: {
    onConfirm() {
      const hasFilter =
        this.categoryFilter.productType ||
        this.categoryFilter.productionType ||
        this.categoryFilter.productionTypeSize ||
        this.categoryFilter.receiptNumber

      if (!hasFilter) {
        warning('กรุณาระบุเงื่อนไขอย่างน้อย 1 ข้อ', 'ข้อมูลไม่ครบถ้วน')
        return
      }

      this.$emit('categorySelected', { ...this.categoryFilter })
      this.$emit('closeModal')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.title-text-lg {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--base-font-color);
}
</style>
