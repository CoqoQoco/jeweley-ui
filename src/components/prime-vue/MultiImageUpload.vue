<template>
  <div class="multi-image-upload">
    <div class="thumbnail-grid">
      <div
        v-for="(file, index) in modelValue"
        :key="index"
        class="thumbnail-tile"
      >
        <img :src="previewUrls[index]" :alt="`image-${index}`" class="thumbnail-img" />
        <ButtonGeneric
          type="button"
          variant="red"
          icon="bi-x"
          class="remove-btn"
          :title="$t('common.btn.delete')"
          @click="removeFile(index)"
        />
      </div>

      <div
        v-if="modelValue.length < max"
        class="add-tile"
        @click="triggerFilePicker"
        :title="$t('view.ticket.label.addImage')"
      >
        <i class="bi bi-plus-lg add-icon"></i>
        <span class="add-label">{{ $t('view.ticket.label.addImage') }}</span>
      </div>
    </div>

    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      multiple
      class="hidden-input"
      @change="onFilesSelected"
    />
  </div>
</template>

<script>
import { warning } from '@/services/alert/sweetAlerts.js'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  name: 'MultiImageUpload',

  components: { ButtonGeneric },

  props: {
    modelValue: {
      type: Array,
      default: () => []
    },
    max: {
      type: Number,
      default: 5
    },
    accept: {
      type: String,
      default: 'image/*'
    },
    maxSizeMB: {
      type: Number,
      default: 5
    }
  },

  emits: ['update:modelValue'],

  data() {
    return {
      previewUrls: []
    }
  },

  watch: {
    modelValue: {
      immediate: true,
      handler(newFiles) {
        this.syncPreviews(newFiles)
      }
    }
  },

  beforeUnmount() {
    this.revokeAllUrls()
  },

  methods: {
    triggerFilePicker() {
      this.$refs.fileInput.value = ''
      this.$refs.fileInput.click()
    },

    onFilesSelected(event) {
      const selected = Array.from(event.target.files)
      if (!selected.length) return

      const current = [...this.modelValue]
      const remaining = this.max - current.length

      for (const file of selected) {
        if (current.length >= this.max) break

        if (!this.validateType(file)) {
          warning(
            this.$t('view.ticket.warning.imageTypeInvalid'),
            this.$t('view.ticket.warning.requiredFields')
          )
          continue
        }

        if (!this.validateSize(file)) {
          warning(
            this.$t('view.ticket.warning.imageSizeExceeded', { max: this.maxSizeMB }),
            this.$t('view.ticket.warning.requiredFields')
          )
          continue
        }

        if (current.length < this.max) {
          current.push(file)
        }
      }

      this.$emit('update:modelValue', current)
      void remaining
    },

    validateType(file) {
      if (!this.accept || this.accept === '*') return true
      if (this.accept === 'image/*') return file.type.startsWith('image/')
      const acceptedTypes = this.accept.split(',').map((t) => t.trim())
      return acceptedTypes.some((t) => {
        if (t.endsWith('/*')) {
          return file.type.startsWith(t.replace('/*', '/'))
        }
        return file.type === t || file.name.endsWith(t.replace('*', ''))
      })
    },

    validateSize(file) {
      if (!this.maxSizeMB) return true
      return file.size <= this.maxSizeMB * 1024 * 1024
    },

    removeFile(index) {
      const updated = [...this.modelValue]
      updated.splice(index, 1)
      this.$emit('update:modelValue', updated)
    },

    syncPreviews(files) {
      this.revokeAllUrls()
      this.previewUrls = files.map((f) => URL.createObjectURL(f))
    },

    revokeAllUrls() {
      this.previewUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.multi-image-upload {
  width: 100%;
}

.hidden-input {
  display: none;
}

.thumbnail-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-md);
}

.thumbnail-tile {
  position: relative;
  width: 90px;
  height: 90px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  overflow: hidden;
  flex-shrink: 0;
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.remove-btn {
  position: absolute;
  top: var(--sp-xs);
  right: var(--sp-xs);
  padding: 0 !important;
  width: 20px !important;
  height: 20px !important;
  min-width: 20px !important;
  border-radius: var(--radius-sm) !important;
  font-size: 0.7rem !important;
  line-height: 1 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  opacity: 0.85;

  &:hover {
    opacity: 1;
  }
}

.add-tile {
  width: 90px;
  height: 90px;
  border-radius: var(--radius-md);
  border: 2px dashed var(--color-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sp-xs);
  cursor: pointer;
  color: var(--base-font-color);
  transition: border-color 0.2s, background 0.2s;
  flex-shrink: 0;

  &:hover {
    border-color: var(--base-font-color);
    background: var(--color-highlight-bg);
  }
}

.add-icon {
  font-size: 1.2rem;
}

.add-label {
  font-size: var(--fs-sm);
  font-weight: 500;
}
</style>
