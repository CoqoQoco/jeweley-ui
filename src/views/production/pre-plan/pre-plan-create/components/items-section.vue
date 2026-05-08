<template>
  <div class="items-section">
    <itemCard
      v-for="(item, idx) in items"
      :key="item._localId"
      :item="item"
      :index="idx"
      @edit="openEditModal(idx)"
      @remove="onRemoveItem(idx)"
    />

    <div class="d-flex justify-content-start mt-2">
      <button type="button" class="btn btn-sm btn-main" @click="openCreateModal">
        <i class="bi bi-plus"></i> เพิ่มรายการ
      </button>
    </div>

    <itemFormModal
      :isShow="showItemModal"
      :item="editingItem"
      :index="editingIndex"
      :masterGold="masterGold"
      :masterGoldSize="masterGoldSize"
      :masterGem="masterGem"
      :masterGemShape="masterGemShape"
      :masterProduct="masterProduct"
      @closeModal="onCloseModal"
      @submit="onModalSubmit"
    />
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { confirmSubmit } from '@/services/alert/sweetAlerts.js'

const itemCard = defineAsyncComponent(() => import('./item-card.vue'))
const itemFormModal = defineAsyncComponent(() => import('../modal/item-form-modal.vue'))

let localIdCounter = 1

export default {
  name: 'ItemsSection',

  components: { itemCard, itemFormModal },

  props: {
    items: { type: Array, default: () => [] },
    masterGold: { type: Array, default: () => [] },
    masterGoldSize: { type: Array, default: () => [] },
    masterGem: { type: Array, default: () => [] },
    masterGemShape: { type: Array, default: () => [] },
    masterProduct: { type: Array, default: () => [] },
  },

  emits: ['update:items'],

  data() {
    return {
      showItemModal: false,
      editingIndex: null,
      editingItem: null,
    }
  },

  methods: {
    openCreateModal() {
      this.editingIndex = null
      this.editingItem = null
      this.showItemModal = true
    },

    openEditModal(idx) {
      this.editingIndex = idx
      this.editingItem = JSON.parse(JSON.stringify(this.items[idx]))
      this.showItemModal = true
    },

    onCloseModal() {
      this.showItemModal = false
      this.editingIndex = null
      this.editingItem = null
    },

    onModalSubmit(formData) {
      if (this.editingIndex === null) {
        const newItem = { ...formData, _localId: localIdCounter++ }
        this.$emit('update:items', [...this.items, newItem])
      } else {
        const newItems = this.items.map((item, i) =>
          i === this.editingIndex ? { ...formData, _localId: item._localId } : item
        )
        this.$emit('update:items', newItems)
      }
      this.onCloseModal()
    },

    onRemoveItem(index) {
      confirmSubmit('ต้องการลบรายการนี้หรือไม่?', 'ยืนยัน', () => {
        const newItems = this.items.filter((_, i) => i !== index)
        this.$emit('update:items', newItems)
      })
    },
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';
</style>
