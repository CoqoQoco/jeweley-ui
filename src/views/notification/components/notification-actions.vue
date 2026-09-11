<!--
  NotificationActions — 3 ปุ่ม action ของแถวการแจ้งเตือน (ใช้ร่วมกันระหว่าง panel และหน้าเต็ม)
  ไม่มี logic เรียก store เอง — parent เป็นคนจัดการเมื่อรับ emit
-->
<template>
  <div class="notification-actions">
    <ButtonGeneric
      variant="green"
      icon="bi-box-arrow-up-right"
      :label="$t('view.notification.item.open')"
      @click="$emit('open')"
    />
    <ButtonGeneric
      variant="dark"
      icon="bi-clock-history"
      :label="$t('view.notification.item.snooze')"
      @click="$emit('snooze')"
    />
    <ButtonGeneric
      variant="main"
      icon="bi-check2-circle"
      :label="$t('view.notification.item.done')"
      @click="$emit('done')"
    />
  </div>
</template>

<script>
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  name: 'NotificationActions',

  components: {
    ButtonGeneric
  },

  emits: ['open', 'snooze', 'done']
}
</script>

<style lang="scss" scoped>
.notification-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-xs);
}
</style>
