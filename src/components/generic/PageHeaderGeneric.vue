<!--
  PageHeaderGeneric — หัวหน้าหน้า create/edit
  ตาม ui-layout skill §1: back btn วงกลม + title + border-bottom สีหลัก

  ตัวอย่างการใช้งาน:
  กรณีมี backRoute — กดแล้ว push route อัตโนมัติ:
  [PageHeaderGeneric title="สร้างใบสั่งผลิต" backRoute="production-list" /]

  กรณีไม่มี backRoute — emit 'back' ให้ parent จัดการ:
  [PageHeaderGeneric title="แก้ไขข้อมูลลูกค้า" @back="onBack" /]

  กรณีมีปุ่ม action ฝั่งขวา (หน้า detail/edit):
  [PageHeaderGeneric title="รายละเอียดใบสั่งผลิต" backRoute="production-list"]
    [template #actions]
      [button class="btn btn-sm btn-main" @click="onEdit"]แก้ไข[/button]
      [button class="btn btn-sm btn-red ml-2" @click="onDelete"]ลบ[/button]
    [/template]
  [/PageHeaderGeneric]

  Props:
    title     — page title text (i18n caller ส่ง $t(...) มา)
    backRoute — route name string (optional); ถ้ามี → $router.push({name: backRoute})

  Slots:
    #actions  — ปุ่ม action ฝั่งขวาของ header (optional); ถ้าไม่ส่ง → layout เหมือนเดิม

  Emits: back (เมื่อไม่มี backRoute)
-->
<template>
  <div class="page-header-bar">
    <div class="page-header-left">
      <button class="btn-back" type="button" title="กลับ" @click="onBack">
        <i class="bi bi-arrow-left"></i>
      </button>
      <h2 class="page-title">{{ title }}</h2>
    </div>
    <div v-if="$slots.actions" class="page-header-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageHeaderGeneric',

  props: {
    title: {
      type: String,
      default: ''
    },
    backRoute: {
      type: String,
      default: ''
    }
  },

  emits: ['back'],

  methods: {
    onBack() {
      if (this.backRoute) {
        this.$router.push({ name: this.backRoute })
      } else {
        this.$emit('back')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.page-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-md);
  padding: var(--sp-md) var(--sp-lg);
  background: var(--surface-inverse);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--sp-lg);
}

.page-header-left {
  display: flex;
  align-items: center;
  gap: var(--sp-md);
}

.page-header-actions {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  flex-shrink: 0;
}

.btn-back {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--on-inverse);
  color: var(--on-inverse);
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: var(--color-card-bg);
    color: var(--base-font-color);
  }
}

.page-title {
  margin: 0;
  font-size: var(--fs-xl);
  font-weight: 600;
  color: var(--on-inverse);
}

.page-header-actions :deep(.btn) {
  background: transparent !important;
  border: 1px solid var(--on-inverse) !important;
  color: var(--on-inverse) !important;

  &:hover {
    background: var(--color-card-bg) !important;
    color: var(--base-font-color) !important;
  }
}
</style>
