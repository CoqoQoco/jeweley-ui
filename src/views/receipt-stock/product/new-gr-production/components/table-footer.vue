<template>
  <div>
    <div class="line"></div>
    <div class="d-flex justify-content-between items-center">
      <div class="vertical-center-container">
        <span class="title-text">จำนวนรายการที่เลือก: {{ selectedItemsLength }}</span>
      </div>
      <div>
        <button class="btn btn-sm btn-green" type="button" @click="$emit('fetchDraft')">
          <span v-if="isOnDraft" class="spinner-border spinner-border-sm"></span>
          <span v-else class="bi bi-clipboard2-pulse-fill"></span>
          <span class="ml-2">บันทึกฉบับร่าง</span>
        </button>
        <button
          :class="[
            'btn btn-sm ml-2',
            selectedItemsLength === 0 ? 'btn-secondary' : 'btn-main'
          ]"
          type="submit"
          :disabled="selectedItemsLength === 0"
          @click="$emit('submit')"
        >
          <span class="bi bi-upload"></span>
          <span class="ml-2">บันทึกสินค้า</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TableFooter',
  
  props: {
    selectedItemsLength: {
      type: Number,
      required: true
    },
    isOnDraft: {
      type: Boolean,
      default: false
    }
  },

  emits: ['fetchDraft', 'submit']
}
</script>

<style lang="scss" scoped>
.line {
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 1rem;
}

.vertical-center-container {
  display: flex;
  align-items: center;
}

.title-text {
  font-weight: 500;
  color: var(--base-font-color);
}
</style>