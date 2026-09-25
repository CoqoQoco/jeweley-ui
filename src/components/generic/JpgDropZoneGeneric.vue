<!--
  JpgDropZoneGeneric — drag & drop + click-to-pick JPG upload zone
  บีบอัดไฟล์ด้วย compressOptimalImage แล้ว preview ให้อัตโนมัติ

  ตัวอย่างการใช้งาน:
  <JpgDropZoneGeneric
    v-model="uploadFile"
    v-model:previewUrl="uploadPreviewUrl"
    :dropLabel="$t('...dropHere')"
    :browseLabel="$t('...browse')"
    :hintLabel="$t('...supportedFormat')"
    :formatWarningLabel="$t('...uploadFormatWarning')"
  />

  หมายเหตุ: component ควบคุมด้วย v-if จากฝั่ง parent เสมอ (ไม่ใช่ v-show) — ตอน unmount จะ revoke
  object URL ที่สร้างไว้อัตโนมัติผ่าน beforeUnmount กัน memory leak

  Props:
    modelValue          — v-model ไฟล์ที่บีบอัดแล้ว (File | null)
    previewUrl           — v-model:previewUrl object URL สำหรับ preview (String | null)
    disabled             — ปิดการเลือกไฟล์
    dropLabel            — ข้อความหลัก (required)
    browseLabel          — ข้อความขีดเส้นใต้ต่อท้าย dropLabel (optional)
    hintLabel             — ข้อความบรรทัดเล็กใต้ dropLabel (optional)
    formatWarningLabel  — ข้อความเตือนเมื่อไฟล์ไม่ใช่ jpg/jpeg (required)

  Emits: update:modelValue, update:previewUrl, clear
-->
<template>
  <div class="jpg-dropzone" :class="{ 'is-disabled': disabled }" @dragover.prevent @drop.prevent="handleDrop">
    <div v-if="previewUrl" class="jpg-dropzone__preview">
      <img :src="previewUrl" alt="preview" class="jpg-dropzone__img" />
      <button
        type="button"
        class="jpg-dropzone__remove"
        :disabled="disabled"
        @click.stop="onRemove"
      >
        <i class="bi bi-x-lg"></i>
      </button>
    </div>
    <div v-else class="jpg-dropzone__empty" @click="triggerPick">
      <i class="bi bi-cloud-arrow-up jpg-dropzone__icon"></i>
      <p class="jpg-dropzone__text">
        {{ dropLabel }}
        <span v-if="browseLabel" class="jpg-dropzone__browse">{{ browseLabel }}</span>
      </p>
      <p v-if="hintLabel" class="jpg-dropzone__hint">{{ hintLabel }}</p>
    </div>
    <input
      ref="fileInput"
      type="file"
      class="jpg-dropzone__input"
      accept=".jpg,.jpeg,image/jpeg"
      :disabled="disabled"
      @change="handleFileInput"
    />
  </div>
</template>

<script>
import { compressOptimalImage } from '@/services/helper/file/compress-image.js'
import { warning } from '@/services/alert/sweetAlerts.js'

export default {
  name: 'JpgDropZoneGeneric',

  props: {
    modelValue: {
      type: File,
      default: null
    },
    previewUrl: {
      type: String,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    dropLabel: {
      type: String,
      required: true
    },
    browseLabel: {
      type: String,
      default: ''
    },
    hintLabel: {
      type: String,
      default: ''
    },
    formatWarningLabel: {
      type: String,
      required: true
    }
  },

  emits: ['update:modelValue', 'update:previewUrl', 'clear'],

  data() {
    return {
      objectUrl: null
    }
  },

  beforeUnmount() {
    this.revokeObjectUrl()
  },

  methods: {
    triggerPick() {
      if (this.disabled) return
      this.$refs.fileInput.value = ''
      this.$refs.fileInput.click()
    },

    handleDrop(e) {
      if (this.disabled) return
      const file = e.dataTransfer.files[0]
      if (file) this.processFile(file)
    },

    handleFileInput(e) {
      const file = e.target.files[0]
      if (file) this.processFile(file)
    },

    async processFile(file) {
      if (!file.type.match(/image\/(jpeg|jpg)/i)) {
        warning('', this.formatWarningLabel)
        return
      }

      const compressedFile = await compressOptimalImage(file)

      this.revokeObjectUrl()
      this.objectUrl = URL.createObjectURL(compressedFile)
      this.$emit('update:modelValue', compressedFile)
      this.$emit('update:previewUrl', this.objectUrl)
    },

    onRemove() {
      if (this.disabled) return
      this.revokeObjectUrl()
      this.$emit('update:modelValue', null)
      this.$emit('update:previewUrl', null)
      this.$emit('clear')
    },

    revokeObjectUrl() {
      if (this.objectUrl) {
        URL.revokeObjectURL(this.objectUrl)
        this.objectUrl = null
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.jpg-dropzone {
  position: relative;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-card-bg);
  min-height: 180px;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: var(--base-font-color);
  }

  &.is-disabled {
    opacity: 0.6;
    pointer-events: none;
  }
}

.jpg-dropzone__input {
  display: none;
}

.jpg-dropzone__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 180px;
  padding: var(--sp-xl);
  cursor: pointer;
  text-align: center;
}

.jpg-dropzone__icon {
  font-size: 2rem;
  color: var(--base-sub-color);
  margin-bottom: var(--sp-sm);
}

.jpg-dropzone__text {
  margin-bottom: var(--sp-xs);
  color: var(--base-font-color);
}

.jpg-dropzone__browse {
  color: var(--base-green);
  text-decoration: underline;
}

.jpg-dropzone__hint {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.jpg-dropzone__preview {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 180px;
  padding: var(--sp-md);
}

.jpg-dropzone__img {
  max-width: 100%;
  max-height: 220px;
  object-fit: contain;
  border-radius: var(--radius-sm);
}

.jpg-dropzone__remove {
  position: absolute;
  top: var(--sp-sm);
  right: var(--sp-sm);
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--base-font-color);
  color: var(--on-inverse);
  cursor: pointer;
  z-index: 1;
}
</style>
