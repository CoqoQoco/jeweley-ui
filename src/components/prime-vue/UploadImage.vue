<template>
  <div :class="['upload-container', { compact: compact }]" :style="!compact ? `height:${hight};` : ''">
    <h6 v-if="compact && title" class="compact-title">{{ title }}</h6>

    <div v-if="!compact" class="upload-header">
      <div class="row form-group">
        <div class="col-md-4">
          <div class="upload-btn">
            <input
              class="hidden-input"
              type="file"
              ref="fileInput"
              :accept="accept"
              @change="onImportIamge"
            />
            <button class="btn btn-sm btn-warning btn-upload-custom" type="button">
              เลือกรูปภาพ
            </button>
          </div>
        </div>
        <div class="col-md-8">
          <div class="row form-group">
            <div class="col-md-12">
              <input class="form-control" type="text" disabled v-model="name" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!compact" class="upload-preview">
      <div v-if="name">
        <img
          :src="currentPreviewUrl || imgUrl"
          alt="Preview"
          class="preview-image"
          :style="`width:${previewSize}px;height:${previewSize}px;`"
        />
      </div>
    </div>

    <div v-if="compact" class="upload-preview compact-row">
      <input
        class="hidden-input"
        type="file"
        ref="fileInput"
        :accept="accept"
        @change="onImportIamge"
        style="display:none;"
      />
      <div>
        <button class="btn btn-sm btn-outline-main mb-2" type="button" @click="triggerFileInput">
          <i class="bi bi-image"></i> เลือกรูป
        </button>
      </div>
      <div v-if="currentPreviewUrl" class="compact-preview">
        <img
          :src="currentPreviewUrl"
          alt="Preview"
          :style="`width:${previewSize}px;height:${previewSize}px;`"
        />
        <button
          v-if="showClear"
          type="button"
          class="btn btn-sm btn-red mt-2 d-block text-center mx-auto"
          @click="onClear"
        
        >
          <i class="bi bi-trash"></i> ลบรูป
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { warning } from '@/services/alert/sweetAlerts.js'

export default {
  props: {
    hight: {
      type: String,
      default: 'auto'
    },
    reset: {
      type: Boolean,
      default: false
    },
    modelValue: {
      type: File,
      default: null
    },
    previewUrl: {
      type: String,
      default: null
    },
    title: {
      type: String,
      default: ''
    },
    accept: {
      type: String,
      default: '.jpg, .png'
    },
    maxSizeMB: {
      type: Number,
      default: 0
    },
    previewSize: {
      type: Number,
      default: 300
    },
    compact: {
      type: Boolean,
      default: false
    },
    showClear: {
      type: Boolean,
      default: false
    }
  },

  emits: ['onImportFile', 'update:modelValue', 'update:previewUrl', 'clear'],

  data() {
    return {
      name: '',
      imgUrl: '',
      objectUrl: null
    }
  },

  computed: {
    currentPreviewUrl() {
      return this.previewUrl || null
    }
  },

  watch: {
    reset() {
      this.clearFileInput()
    }
  },

  beforeUnmount() {
    this.revokeObjectUrl()
  },

  methods: {
    triggerFileInput() {
      this.$refs.fileInput.value = ''
      this.$refs.fileInput.click()
    },

    onImportIamge(e) {
      const file = e.target.files[0]
      if (!file) return

      if (this.maxSizeMB > 0 || this.accept === 'image/*') {
        if ((this.accept === 'image/*' || this.accept.includes('image/')) && !file.type.startsWith('image/')) {
          warning('ไฟล์ที่เลือกต้องเป็นรูปภาพเท่านั้น', 'ประเภทไฟล์ไม่ถูกต้อง')
          return
        }

        if (this.maxSizeMB > 0 && file.size > this.maxSizeMB * 1024 * 1024) {
          warning(`ขนาดรูปภาพต้องไม่เกิน ${this.maxSizeMB}MB`, 'รูปภาพขนาดใหญ่เกินไป')
          return
        }
      }

      this.name = file.name

      if (this.compact) {
        this.revokeObjectUrl()
        this.objectUrl = URL.createObjectURL(file)
        this.$emit('update:modelValue', file)
        this.$emit('update:previewUrl', this.objectUrl)
        this.$emit('onImportFile', file)
      } else {
        const reader = new FileReader()
        reader.onload = (event) => {
          this.imgUrl = event.target.result
        }
        reader.readAsDataURL(file)
        this.$emit('onImportFile', file)
        this.$emit('update:modelValue', file)
      }
    },

    onClear() {
      this.revokeObjectUrl()
      this.name = ''
      this.imgUrl = ''
      this.$emit('update:modelValue', null)
      this.$emit('update:previewUrl', null)
      this.$emit('clear')
    },

    revokeObjectUrl() {
      if (this.objectUrl) {
        URL.revokeObjectURL(this.objectUrl)
        this.objectUrl = null
      }
    },

    clearFileInput() {
      const fileInput = this.$refs.fileInput
      if (fileInput) {
        fileInput.value = ''
      }
      this.name = ''
      this.imgUrl = ''
      this.revokeObjectUrl()
    }
  }
}
</script>

<style lang="scss">
.upload-container {
  border: 1px solid var(--base-color);
  background-color: #ffff;
  padding: 0px;

  display: grid;
}
.upload-header {
  padding: 10px;
  height: 55px;
  background-color: var(--base-color);
}
.hidden-input {
  opacity: 0;
  overflow: hidden;
  position: absolute;
  width: 80%;
  height: 35px;
}
.btn-upload-custom {
  width: 100%;
  height: 35px;
}
.upload-preview {
  display: grid;
  place-items: center;
}
.preview-image {
  width: 300px;
  height: 300px;
  border: 1px solid var(--base-sub-color);
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  border-radius: 10px;
}
.del-iamge-x {
}

.upload-container.compact {
  border: none;
  background: transparent;
  padding: 0;
  display: block;

  .upload-header { display: none; }
  .upload-preview { padding: 0; display: block; }
}
.compact-title {
  color: var(--base-font-color);
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
  background: transparent !important;
  margin-bottom: 12px;
}
.compact-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
}
.compact-preview img {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 4px;
  background: #fff;
  object-fit: contain;
  display: block;
}
</style>
