<!--
  insight-action-list — รายการวิธีแก้/สิ่งที่ควรทำแบบมีเลขลำดับ + owner-role chip + ปัญหาที่แก้ (ถ้ามี)
  ไม่มี logic แปล i18n เอง (รับ text/ownerRoleLabel/relatedText ที่ resolve มาแล้วจาก parent)

  ตัวอย่างการใช้งาน:
  <InsightActionList :actions="resolvedActions" :loading="loading" />

  Props:
    actions — Array (required) ของ { key, text, ownerRoleLabel, relatedText? }
    loading — Boolean (false)
-->
<template>
  <div class="insight-action-list">
    <div v-if="loading" class="insight-action-list__loading">
      <i class="bi bi-arrow-repeat spin"></i>
    </div>
    <div v-else-if="!actions.length" class="insight-action-list__empty">
      {{ $t('view.productionInsight.actionEmpty') }}
    </div>
    <ol v-else class="insight-action-list__items">
      <li v-for="action in actions" :key="action.key" class="insight-action-list__item">
        <div class="insight-action-list__row">
          <span class="insight-action-list__text">{{ action.text }}</span>
          <span v-if="action.ownerRoleLabel" class="insight-action-list__owner">{{ action.ownerRoleLabel }}</span>
        </div>
        <div v-if="action.relatedText" class="insight-action-list__related">{{ action.relatedText }}</div>
      </li>
    </ol>
  </div>
</template>

<script>
export default {
  name: 'InsightActionList',

  props: {
    actions: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
@keyframes insight-action-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.insight-action-list__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--sp-xl) 0;

  i {
    font-size: var(--fs-lg);
    color: var(--base-sub-color);
    animation: insight-action-spin 0.8s linear infinite;
  }
}

.insight-action-list__empty {
  text-align: center;
  padding: var(--sp-xl) 0;
  color: var(--base-sub-color);
}

.insight-action-list__items {
  margin: 0;
  padding-left: var(--sp-xl);
  display: flex;
  flex-direction: column;
  gap: var(--sp-md);
}

.insight-action-list__item {
  padding-left: var(--sp-xs);
}

.insight-action-list__row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--sp-md);
}

.insight-action-list__text {
  font-size: var(--fs-base);
  color: var(--base-font-color);
  font-weight: 500;
}

.insight-action-list__owner {
  flex-shrink: 0;
  font-size: var(--fs-sm);
  font-weight: 700;
  padding: 2px var(--sp-sm);
  border-radius: var(--radius-sm);
  border: 1px solid var(--base-green);
  color: var(--base-green);
}

.insight-action-list__related {
  margin-top: var(--sp-xs);
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}
</style>
