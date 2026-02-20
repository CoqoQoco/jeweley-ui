<template>
  <div class="item-list-section">
    <div class="section-header">
      <h3 class="section-title">
        <i class="bi bi-box-seam"></i>
        รายการสินค้า ({{ items.length }})
      </h3>
    </div>

    <div v-if="items.length > 0" class="items-container">
      <ItemCard
        v-for="(item, index) in items"
        :key="item.stockNumber + '-' + index"
        :item="item"
        :index="index"
        @update="onUpdateItem"
        @remove="onRemoveItem"
      />
    </div>

    <div v-else class="empty-items">
      <i class="bi bi-cart"></i>
      <span>ยังไม่มีสินค้าในรายการ</span>
    </div>
  </div>
</template>

<script>
import ItemCard from './item-card.vue'

export default {
  name: 'ItemList',

  components: {
    ItemCard
  },

  props: {
    items: {
      type: Array,
      default: () => []
    }
  },

  emits: ['update-item', 'remove-item'],

  methods: {
    onUpdateItem(index, updatedItem) {
      this.$emit('update-item', index, updatedItem)
    },

    onRemoveItem(index) {
      this.$emit('remove-item', index)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.item-list-section {
  margin-top: 16px;

  .section-header {
    margin-bottom: 10px;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1rem;
    font-weight: 600;
    color: #333;
    margin: 0;

    i {
      color: var(--base-font-color);
    }
  }

  .items-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .empty-items {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 30px 20px;
    background: white;
    border-radius: 10px;
    border: 2px dashed #e0e0e0;
    color: #999;
    gap: 8px;

    i {
      font-size: 2rem;
    }

    span {
      font-size: 0.85rem;
    }
  }
}
</style>
