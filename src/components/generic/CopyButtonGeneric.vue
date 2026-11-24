<!--
  CopyButtonGeneric — ปุ่มคัดลอกข้อความลงคลิปบอร์ด
  กดแล้วไอคอน bi-clipboard เปลี่ยนเป็น bi-check2 + ข้อความ "คัดลอกแล้ว" (aria-live ให้ screen reader อ่านผล)
  คัดลอกไม่ได้ (เบราว์เซอร์ไม่อนุญาต) → ลอง execCommand ก่อน แล้วยัง fail ยิง `fail` ให้ parent เลือกข้อความที่แสดงอยู่ให้ผู้ใช้คัดลอกเอง

  ตัวอย่างการใช้งาน:
  <CopyButtonGeneric :value="mcpUrl" />
  <CopyButtonGeneric :value="token" variant="main" @fail="selectTokenText" />

  Props:
    value       — ข้อความที่จะคัดลอก (String, required)
    label       — ข้อความปุ่ม (default: $t('common.btn.copy'))
    copiedLabel — ข้อความหลังคัดลอก (default: $t('common.btn.copied'))
    variant     — ButtonGeneric variant (default: 'outline')
    disabled    — ปิดปุ่ม (ว่างค่า value ก็ปิดให้อัตโนมัติ)
    resetMs     — เวลาที่ค้างสถานะ "คัดลอกแล้ว" (default: 2000)

  Emits: copied, fail
-->
<template>
  <span class="copy-button-generic">
    <ButtonGeneric
      :variant="variant"
      :icon="isCopied ? 'bi-check2' : 'bi-clipboard'"
      :label="isCopied ? resolvedCopiedLabel : resolvedLabel"
      :disabled="disabled || !value"
      @click="onCopy"
    />
    <span class="visually-hidden" role="status" aria-live="polite">{{ isCopied ? resolvedCopiedLabel : '' }}</span>
  </span>
</template>

<script>
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  name: 'CopyButtonGeneric',

  components: { ButtonGeneric },

  props: {
    value: { type: String, required: true },
    label: { type: String, default: '' },
    copiedLabel: { type: String, default: '' },
    variant: { type: String, default: 'outline' },
    disabled: { type: Boolean, default: false },
    resetMs: { type: Number, default: 2000 }
  },

  emits: ['copied', 'fail'],

  data() {
    return { isCopied: false, timer: null }
  },

  computed: {
    resolvedLabel() {
      return this.label || this.$t('common.btn.copy')
    },
    resolvedCopiedLabel() {
      return this.copiedLabel || this.$t('common.btn.copied')
    }
  },

  beforeUnmount() {
    clearTimeout(this.timer)
  },

  methods: {
    async onCopy() {
      const ok = await this.writeClipboard(this.value)
      if (!ok) {
        this.$emit('fail')
        return
      }
      this.isCopied = true
      this.$emit('copied')
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.isCopied = false
      }, this.resetMs)
    },

    async writeClipboard(text) {
      if (navigator.clipboard?.writeText) {
        const ok = await navigator.clipboard.writeText(text).then(
          () => true,
          () => false
        )
        if (ok) return true
      }
      return this.copyByExecCommand(text)
    },

    copyByExecCommand(text) {
      const area = document.createElement('textarea')
      area.value = text
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      const ok = typeof document.execCommand === 'function' && document.execCommand('copy')
      document.body.removeChild(area)
      return !!ok
    }
  }
}
</script>

<style lang="scss" scoped>
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
</style>
