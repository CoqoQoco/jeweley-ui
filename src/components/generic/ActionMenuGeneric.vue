<!--
  ActionMenuGeneric — ปุ่ม trigger (ButtonGeneric) + PrimeVue Menu popup
  ใช้แทนกลุ่มปุ่มที่ทำหน้าที่คล้ายกันหลายปุ่ม รวมเป็นเมนูเดียว (เช่น "เอกสารอื่น", "Excel", "เพิ่มเติม")

  ตัวอย่างการใช้งาน (มี label — เพิ่ม chevron ▾ ให้อัตโนมัติ):
  <ActionMenuGeneric
    :label="$t('view.sale.invoiceDetail.menuOtherDocs')"
    icon="bi-file-earmark-text"
    :items="otherDocMenuItems"
  />

  ตัวอย่างการใช้งาน (icon-only — ไม่ส่ง label ต้องส่ง :title เสมอเพื่อ tooltip):
  <ActionMenuGeneric icon="bi-three-dots" :title="$t('view.sale.invoiceDetail.menuMore')" :items="moreMenuItems" />

  items: [{
    key: 'delivery',              // unique, ใช้เป็น :key
    label: 'ใบส่งสินค้า',
    icon: 'bi-truck',
    command: () => {...},         // เรียกเมื่อคลิก (ไม่เรียกถ้า disabled — PrimeVue Menu จัดการเอง)
    disabled: false,
    hint: 'ต้องชำระเงินครบก่อน',   // optional บรรทัดเล็กใต้ label
    danger: false                 // true = label + icon สีแดง
  }]

  Props:
    label    — trigger button label (ไม่ส่ง = icon-only)
    icon     — bootstrap icon class ของปุ่ม trigger เช่น 'bi-file-earmark-text'
    items    — array ของ menu item (ดู shape ด้านบน)
    variant  — ส่งต่อให้ ButtonGeneric (default 'outline')
    disabled — disable ปุ่ม trigger ทั้งก้อน
    title    — tooltip ของปุ่ม trigger (จำเป็นเมื่อไม่มี label)

  Emits: ไม่มี — ใช้ item.command ต่อรายการ (ตาม pattern PrimeVue MenuItem)
-->
<template>
  <span class="action-menu-generic">
    <ButtonGeneric :variant="variant" :disabled="disabled" :title="title" @click="toggleMenu">
      <i v-if="icon" :class="['bi', icon, 'action-menu-trigger-icon']"></i>
      <span v-if="label" class="action-menu-label">{{ label }}</span>
      <i v-if="label" class="bi bi-chevron-down action-menu-chevron"></i>
    </ButtonGeneric>

    <PvMenu ref="menu" :model="items" :popup="true" appendTo="body">
      <template #item="{ item }">
        <div class="action-menu-item" :class="{ 'action-menu-item--danger': item.danger }">
          <i v-if="item.icon" :class="['bi', item.icon, 'action-menu-item__icon']"></i>
          <span class="action-menu-item__body">
            <span class="action-menu-item__label">{{ item.label }}</span>
            <span v-if="item.hint" class="action-menu-item__hint">{{ item.hint }}</span>
          </span>
        </div>
      </template>
    </PvMenu>
  </span>
</template>

<script>
import PvMenu from 'primevue/menu'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  name: 'ActionMenuGeneric',

  components: {
    ButtonGeneric,
    PvMenu
  },

  props: {
    label: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    items: {
      type: Array,
      default: () => []
    },
    variant: {
      type: String,
      default: 'outline'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    }
  },

  methods: {
    toggleMenu(event) {
      this.$refs.menu.toggle(event)
    }
  }
}
</script>

<style lang="scss" scoped>
.action-menu-generic {
  display: inline-flex;
}

// ButtonGeneric เว้นระยะ icon→label ด้วย `.btn i + span { margin-left: var(--sp-xs) }` แต่กฎนั้นใช้ scope-id ของ
// ButtonGeneric เอง ซึ่งไม่ match กับ slot content ที่มาจาก component นี้ (Vue คง scope-id ของผู้ประกาศ slot content
// ไว้ที่ parent) — เว้นระยะเองด้วย token เดียวกันให้ตรงกับปุ่มอื่นในแถบเดียวกัน (เช่น "เพิ่ม Version")
.action-menu-trigger-icon + .action-menu-label {
  margin-left: var(--sp-xs);
}

.action-menu-chevron {
  font-size: var(--fs-sm);
  margin-left: var(--sp-xs);
}

:deep(.p-menu.p-menu-overlay) {
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  min-width: 220px;
  padding: var(--sp-xs) 0;
}

:deep(.p-menuitem.p-disabled) {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-menu-item {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-sm);
  padding: var(--sp-sm) var(--sp-md);
  font-size: var(--fs-base);
  color: var(--base-sub-color);
  cursor: pointer;

  &__icon {
    width: 1.25rem;
    flex-shrink: 0;
    text-align: center;
    color: var(--base-font-color);
  }

  &__body {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &__label {
    line-height: var(--lh-sm);
  }

  &__hint {
    font-size: var(--fs-sm);
    color: var(--base-sub-color);
    opacity: 0.7;
    line-height: var(--lh-sm);
  }

  &--danger {
    .action-menu-item__icon,
    .action-menu-item__label {
      color: var(--base-red);
    }
  }
}
</style>
