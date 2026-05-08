<template>
  <div class="items-section">
    <itemCard
      v-for="(item, idx) in items"
      :key="item._localId"
      :item="item"
      :index="idx"
      @update:item="onUpdateItem(idx, $event)"
      @remove="onRemoveItem(idx)"
    />

    <div class="d-flex justify-content-start mt-2">
      <button type="button" class="btn btn-sm btn-main" @click="onAddItem">
        <i class="bi bi-plus"></i> เพิ่มรายการ
      </button>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { confirmSubmit } from '@/services/alert/sweetAlerts.js'

const itemCard = defineAsyncComponent(() => import('./item-card.vue'))

let localIdCounter = 1

function createEmptyItem() {
  return {
    _localId: localIdCounter++,
    moldCode: null,
    moldDetail: null,
    moldImageCad: null,
    moldImageFinish: null,
    productImageFile: null,
    productImagePreview: null,
    customerNumber: null,
    customerType: null,
    productName: null,
    productType: null,
    productQty: null,
    productQtyUnit: null,
    productDetail: null,
    goldType: '18K',
    goldSize: null,
    materials: [],
  }
}

export default {
  name: 'ItemsSection',

  components: { itemCard },

  props: {
    items: {
      type: Array,
      default: () => [],
    },
  },

  emits: ['update:items'],

  methods: {
    onUpdateItem(index, updatedItem) {
      const newItems = this.items.map((item, i) => (i === index ? updatedItem : item))
      this.$emit('update:items', newItems)
    },

    onRemoveItem(index) {
      confirmSubmit('ต้องการลบรายการนี้หรือไม่?', 'ยืนยัน', () => {
        const newItems = this.items.filter((_, i) => i !== index)
        this.$emit('update:items', newItems)
      })
    },

    onAddItem() {
      const newItems = [...this.items, createEmptyItem()]
      this.$emit('update:items', newItems)
    },
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';
</style>
