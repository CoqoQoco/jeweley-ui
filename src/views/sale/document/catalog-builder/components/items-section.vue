<template>
  <div class="section-card">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h6 class="mb-0">{{ $t('view.sale.document.itemsTitle') }}</h6>
      <button class="btn btn-sm btn-main" @click="$emit('add-item')" type="button">
        <i class="bi bi-plus-circle mr-1"></i> {{ $t('view.sale.document.addItem') }}
      </button>
    </div>

    <div v-if="items.length === 0" class="empty-state">
      <i class="bi bi-box-seam"></i>
      <p>{{ $t('view.sale.document.emptyItems') }}</p>
    </div>

    <catalogItemCard
      v-for="(item, idx) in items"
      :key="item._key || idx"
      :item="item"
      :index="idx"
      :isLast="idx === items.length - 1"
      @update:item="onUpdateItem(idx, $event)"
      @move-up="onMoveUp"
      @move-down="onMoveDown"
      @remove="onRemove"
      @upload-image="$emit('upload-image', $event)"
    />
  </div>
</template>

<script>
import catalogItemCard from './catalog-item-card.vue'

export default {
  name: 'ItemsSection',

  components: { catalogItemCard },

  props: {
    items: {
      type: Array,
      default: () => []
    }
  },

  emits: ['update:items', 'add-item', 'upload-image'],

  methods: {
    onUpdateItem(idx, updatedItem) {
      const newItems = [...this.items]
      newItems[idx] = updatedItem
      this.$emit('update:items', newItems)
    },

    onMoveUp(idx) {
      if (idx <= 0) return
      const newItems = [...this.items]
      ;[newItems[idx - 1], newItems[idx]] = [newItems[idx], newItems[idx - 1]]
      this.$emit('update:items', newItems)
    },

    onMoveDown(idx) {
      if (idx >= this.items.length - 1) return
      const newItems = [...this.items]
      ;[newItems[idx], newItems[idx + 1]] = [newItems[idx + 1], newItems[idx]]
      this.$emit('update:items', newItems)
    },

    onRemove(idx) {
      const newItems = this.items.filter((_, i) => i !== idx)
      this.$emit('update:items', newItems)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.section-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: rgba(0, 0, 0, 0.06) 0 2px 8px;
  padding: 20px;
  background: #ffffff !important;
  margin-bottom: 16px;

  h6 {
    color: var(--base-font-color);
    font-weight: 600;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
    background: transparent !important;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #aaa;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;

  i {
    font-size: 2.5rem;
    margin-bottom: 8px;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
  }
}
</style>
