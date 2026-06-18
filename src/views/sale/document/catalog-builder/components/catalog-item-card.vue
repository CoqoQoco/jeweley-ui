<template>
  <div class="item-card">
    <div class="item-card-header d-flex justify-content-between align-items-center">
      <span class="fw-semibold">#{{ item.productNumber || `${$t('view.sale.document.itemLabel')} ${index + 1}` }}</span>
      <div>
        <button class="btn btn-sm btn-outline-main" :title="$t('view.sale.document.moveUp')" :disabled="index === 0" @click="$emit('move-up', index)" type="button">
          <i class="bi bi-arrow-up"></i>
        </button>
        <button class="btn btn-sm btn-outline-main ml-1" :title="$t('view.sale.document.moveDown')" :disabled="isLast" @click="$emit('move-down', index)" type="button">
          <i class="bi bi-arrow-down"></i>
        </button>
        <button class="btn btn-sm btn-red ml-2" :title="$t('view.sale.document.removeItem')" @click="$emit('remove', index)" type="button">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </div>

    <div class="item-card-body">
      <div class="form-row two-col mb-3">
        <div class="form-field">
          <span class="title-text">{{ $t('view.sale.document.descLine1') }}</span>
          <input
            class="form-control"
            type="text"
            :value="item.descriptionLine1"
            @input="updateField('descriptionLine1', $event.target.value)"
            :placeholder="$t('view.sale.document.placeholder.descLine1')"
          />
        </div>
        <div class="form-field">
          <span class="title-text">{{ $t('view.sale.document.descLine2') }}</span>
          <input
            class="form-control"
            type="text"
            :value="item.descriptionLine2"
            @input="updateField('descriptionLine2', $event.target.value)"
            :placeholder="$t('view.sale.document.placeholder.descLine2')"
          />
        </div>
      </div>

      <div class="images-row">
        <div v-for="(imgSlot, imgIdx) in 3" :key="imgIdx" class="image-slot">
          <span class="title-text">{{ $t('view.sale.document.imageLabel') }} {{ imgIdx + 1 }}</span>
          <div class="image-upload-area">
            <div v-if="getImagePreview(imgIdx)" class="image-preview-wrap">
              <img :src="getImagePreview(imgIdx)" class="image-preview" :alt="`${$t('view.sale.document.imageLabel')} ${imgIdx + 1}`" />
              <button class="btn btn-sm btn-red btn-clear-img" @click="clearImage(imgIdx)" type="button" :title="$t('view.sale.document.removeImage')">
                <i class="bi bi-x"></i>
              </button>
            </div>
            <label v-else class="upload-label" :for="`img-${index}-${imgIdx}`">
              <i class="bi bi-camera"></i>
              <span>{{ $t('view.sale.document.selectImage') }}</span>
              <input
                :id="`img-${index}-${imgIdx}`"
                type="file"
                accept="image/*"
                class="d-none"
                @change="onFileChange($event, imgIdx)"
              />
            </label>
          </div>
          <div class="mt-1">
            <span class="title-text">{{ $t('view.sale.document.tagSize') }}</span>
            <input
              class="form-control"
              type="text"
              :value="getDimension(imgIdx)"
              @input="updateDimension(imgIdx, $event.target.value)"
              :placeholder="$t('view.sale.document.placeholder.size')"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CatalogItemCard',

  props: {
    item: {
      type: Object,
      default: () => ({})
    },
    index: {
      type: Number,
      default: 0
    },
    isLast: {
      type: Boolean,
      default: false
    }
  },

  emits: ['update:item', 'move-up', 'move-down', 'remove', 'upload-image'],

  computed: {
    imagePreviews() {
      return this.item.imagePreviews || [null, null, null]
    }
  },

  methods: {
    updateField(field, value) {
      this.$emit('update:item', { ...this.item, [field]: value })
    },

    getDimension(idx) {
      const key = `dimension${idx + 1}`
      return this.item[key] || ''
    },

    updateDimension(idx, value) {
      const key = `dimension${idx + 1}`
      this.$emit('update:item', { ...this.item, [key]: value })
    },

    getImagePreview(idx) {
      const previews = this.item.imagePreviews || []
      return previews[idx] || null
    },

    async onFileChange(event, imgIdx) {
      const file = event.target.files?.[0]
      if (!file) return
      if (!file.type.startsWith('image/')) return

      const previewUrl = URL.createObjectURL(file)
      this.$emit('upload-image', { index: this.index, imgIdx, file, previewUrl })

      event.target.value = ''
    },

    clearImage(imgIdx) {
      const previews = [...(this.item.imagePreviews || [null, null, null])]
      previews[imgIdx] = null
      const blobPaths = [...(this.item.imageBlobPaths || [null, null, null])]
      blobPaths[imgIdx] = null
      this.$emit('update:item', { ...this.item, imagePreviews: previews, imageBlobPaths: blobPaths })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.item-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
}

.item-card-header {
  background: #fdf2f2;
  color: var(--base-font-color);
  padding: 10px 16px;
}

.item-card-body {
  padding: 16px;
  background: #ffffff;
}

.form-row {
  &.two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  @media (max-width: 768px) {
    &.two-col { grid-template-columns: 1fr; }
  }
}

.form-field {
  width: 100%;
}

input.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.875rem;

  &:focus {
    border-color: var(--base-font-color);
    box-shadow: none;
    outline: none;
  }
}

.images-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.image-slot {
  display: flex;
  flex-direction: column;
}

.image-upload-area {
  height: 130px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  background: #fafafa;
}

.upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  cursor: pointer;
  color: #aaa;
  gap: 6px;
  font-size: 0.85rem;

  i {
    font-size: 1.5rem;
  }

  &:hover {
    background: #f5f5f5;
    color: var(--base-font-color);
    border-color: var(--base-font-color);
  }
}

.image-preview-wrap {
  position: relative;
  width: 100%;
  height: 100%;
}

.image-preview {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.btn-clear-img {
  position: absolute;
  top: 4px;
  right: 4px;
  padding: 0 4px;
  font-size: 0.75rem;
  line-height: 1.4;
  opacity: 0.85;
}
</style>
