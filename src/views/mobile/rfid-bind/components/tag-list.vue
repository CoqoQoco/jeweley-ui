<template>
  <ul class="tag-list">
    <li v-for="tag in tags" :key="tag.epc">
      <div
        role="button"
        tabindex="0"
        class="tag-item"
        :class="{ selected: tag.epc === selectedEpc }"
        @click="$emit('select', tag)"
        @keyup.enter="$emit('select', tag)"
      >
        <i class="bi" :class="tag.epc === selectedEpc ? 'bi-check-circle-fill' : 'bi-circle'"></i>
        <span class="tag-body">
          <span class="tag-epc">{{ tag.epc }}</span>
          <span class="tag-meta">
            <span v-if="tag.rssi !== null">{{ $t('view.mobile.rfidBind.tagRssi', { rssi: tag.rssi }) }}</span>
            <span>{{ $t('view.mobile.rfidBind.tagCount', { count: tag.count }) }}</span>
          </span>
        </span>
      </div>
    </li>
  </ul>
</template>

<script>
export default {
  name: 'RfidTagList',

  props: {
    tags: { type: Array, default: () => [] },
    selectedEpc: { type: String, default: '' }
  },

  emits: ['select']
}
</script>

<style lang="scss" scoped>
.tag-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
}

.tag-item {
  display: flex;
  align-items: center;
  gap: var(--sp-md);
  width: 100%;
  min-height: 56px;
  padding: var(--sp-md);
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  text-align: left;
  color: var(--base-font-sub-color);

  > i {
    font-size: 1.4rem;
    flex-shrink: 0;
  }

  &.selected {
    border-color: var(--base-green);
    background: var(--color-green-bg);

    > i {
      color: var(--base-green);
    }
  }
}

.tag-body {
  display: flex;
  flex-direction: column;
  gap: var(--sp-xs);
  min-width: 0;
}

.tag-epc {
  font-weight: 600;
  word-break: break-all;
}

.tag-meta {
  display: flex;
  gap: var(--sp-md);
  font-size: 0.85rem;
  color: var(--base-sub-color);
}
</style>
