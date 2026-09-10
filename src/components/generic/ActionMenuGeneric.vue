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

  items รองรับ 3 แบบ ผสมกันใน array เดียวได้ (PrimeVue Menu v3 native):

  1) item ปกติ:
  { key: 'delivery', label: 'ใบส่งสินค้า', icon: 'bi-truck', command: () => {...}, disabled: false,
    hint: 'ต้องชำระเงินครบก่อน', danger: false }
    - command      เรียกเมื่อคลิก (ไม่เรียกถ้า disabled — PrimeVue Menu จัดการเอง)
    - hint         optional บรรทัดเล็กใต้ label
    - danger:true  label สีแดง + icon ขึ้น chip วงกลมพื้นแดงอ่อน (แทน icon เปล่า) + hover/focus พื้นแดงอ่อน

  2) separator (เส้นคั่น — PrimeVue render เอง ไม่ต้องทำอะไรเพิ่ม):
  { separator: true }

  3) group (หัวข้อ section + รายการย่อย — render label ผ่าน slot #submenuheader):
  { key: 'cancel-group', label: 'การยกเลิก', items: [ ...item ปกติ/danger... ] }

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
      <template #submenuheader="{ item }">
        <span class="action-menu-group-label">{{ item.label }}</span>
      </template>
      <template #item="{ item }">
        <div
          class="action-menu-item"
          :class="{ 'action-menu-item--danger': item.danger, 'action-menu-item--disabled': item.disabled }"
        >
          <span v-if="item.icon && item.danger" class="action-menu-item__icon-chip">
            <i :class="['bi', item.icon]"></i>
          </span>
          <i v-else-if="item.icon" :class="['bi', item.icon, 'action-menu-item__icon']"></i>
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
  min-width: 260px;
  max-width: 340px;
  padding: var(--sp-xs) 0;
}

:deep(.p-menuitem.p-disabled) {
  opacity: 0.5;
  cursor: not-allowed;
}

:deep(.p-menu .p-submenu-header) {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  opacity: 0.6;
  padding: var(--sp-sm) var(--sp-md) var(--sp-xs);
  background: transparent;
}

:deep(.p-menu .p-menuitem-separator) {
  border-top: 1px solid var(--color-border);
  margin: var(--sp-xs) 0;
}

// keyboard focus (.p-focus ถูกใส่บน <li class="p-menuitem"> โดย PrimeVue — ต้องใช้ :deep เพราะเป็น element
// ของ Menuitem.vue ไม่ใช่ template ของ component นี้) ให้ผลเดียวกับ :hover ด้านล่างของ .action-menu-item
:deep(.p-menuitem.p-focus) .action-menu-item:not(.action-menu-item--disabled) {
  background: var(--color-highlight-bg);
}

:deep(.p-menuitem.p-focus) .action-menu-item--danger:not(.action-menu-item--disabled) {
  background: var(--status-cancelled-bg);

  .action-menu-item__icon-chip {
    background: var(--base-red);
    color: var(--color-card-bg);
  }
}

.action-menu-group-label {
  display: block;
}

.action-menu-item {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-sm);
  padding: var(--sp-sm) var(--sp-md);
  font-size: var(--fs-base);
  color: var(--base-sub-color);
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: var(--color-highlight-bg);
  }

  &__icon {
    width: 1.25rem;
    flex-shrink: 0;
    text-align: center;
    color: var(--base-font-color);
  }

  &__icon-chip {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--status-cancelled-bg);
    color: var(--base-red);
    font-size: 0.95rem;
    transition: background 0.15s ease, color 0.15s ease;
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
    .action-menu-item__label {
      color: var(--base-red);
      font-weight: 600;
    }

    &:hover {
      background: var(--status-cancelled-bg);

      .action-menu-item__icon-chip {
        background: var(--base-red);
        color: var(--color-card-bg);
      }
    }
  }

  &--disabled {
    &:hover {
      background: transparent;
    }
  }
}
</style>
