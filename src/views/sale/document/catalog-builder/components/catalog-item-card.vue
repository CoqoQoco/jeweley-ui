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

      <div class="size-group mb-3">
        <span class="title-text d-block mb-2">{{ $t('view.sale.document.productSize') }}</span>
        <div class="form-row two-col">
          <div class="form-field">
            <span class="title-text">{{ $t('view.sale.document.dimensionHeight') }}</span>
            <input
              class="form-control"
              type="text"
              :value="item.dimension1"
              @input="updateField('dimension1', $event.target.value)"
              :placeholder="$t('view.sale.document.placeholder.size')"
            />
          </div>
          <div class="form-field">
            <span class="title-text">{{ $t('view.sale.document.dimensionWidth') }}</span>
            <input
              class="form-control"
              type="text"
              :value="item.dimension2"
              @input="updateField('dimension2', $event.target.value)"
              :placeholder="$t('view.sale.document.placeholder.size')"
            />
          </div>
        </div>
        <p class="size-hint mb-0 mt-1">{{ $t('view.sale.document.imageHint') }}</p>
      </div>

      <div class="images-row">
        <div v-for="(preview, imgIdx) in imagePreviews" :key="imgIdx" class="image-slot">
          <div class="image-upload-area">
            <div class="image-preview-wrap">
              <img v-if="preview" :src="preview" class="image-preview" :alt="`${$t('view.sale.document.imageLabel')} ${imgIdx + 1}`" />
              <div v-else class="image-placeholder">
                <i class="bi bi-image"></i>
                <span>{{ $t('view.sale.document.imageLoading') }}</span>
              </div>
              <ButtonGeneric
                variant="red"
                icon="bi-x"
                class="btn-clear-img"
                :title="$t('view.sale.document.removeImage')"
                @click="removeImageAt(imgIdx)"
              />
            </div>
          </div>
          <div v-if="imagePreviews.length > 1" class="image-nav">
            <ButtonGeneric
              v-if="imgIdx > 0"
              variant="outline"
              icon="bi-chevron-left"
              :title="$t('view.sale.document.moveImageLeft')"
              @click="moveImage(imgIdx, -1)"
            />
            <ButtonGeneric
              v-if="imgIdx < imagePreviews.length - 1"
              variant="outline"
              icon="bi-chevron-right"
              :title="$t('view.sale.document.moveImageRight')"
              @click="moveImage(imgIdx, 1)"
            />
          </div>
          <div v-if="imgIdx === imagePreviews.length - 1 && imagePreviews.length >= 2" class="mt-1">
            <span class="title-text">{{ $t('view.sale.document.imageCaption') }}</span>
            <input
              class="form-control"
              type="text"
              :value="item.dimension3"
              @input="updateField('dimension3', $event.target.value)"
            />
          </div>
        </div>

        <div v-if="imagePreviews.length < 3" class="image-slot add-slot">
          <div class="image-upload-area">
            <label class="upload-label" :for="`img-${index}-add`">
              <i class="bi bi-plus-circle"></i>
              <span>{{ $t('view.sale.document.addImage') }}</span>
              <input
                :id="`img-${index}-add`"
                type="file"
                accept="image/*"
                class="d-none"
                @change="onFileChange($event, imagePreviews.length)"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  name: 'CatalogItemCard',

  components: { ButtonGeneric },

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
      return this.item.imagePreviews || []
    }
  },

  methods: {
    updateField(field, value) {
      this.$emit('update:item', { ...this.item, [field]: value })
    },

    removeImageAt(imgIdx) {
      const previews = [...(this.item.imagePreviews || [])]
      const blobPaths = [...(this.item.imageBlobPaths || [])]
      previews.splice(imgIdx, 1)
      blobPaths.splice(imgIdx, 1)
      this.$emit('update:item', { ...this.item, imagePreviews: previews, imageBlobPaths: blobPaths })
    },

    moveImage(imgIdx, direction) {
      const targetIdx = imgIdx + direction
      const previews = [...(this.item.imagePreviews || [])]
      const blobPaths = [...(this.item.imageBlobPaths || [])]
      if (targetIdx < 0 || targetIdx >= previews.length) return

      ;[previews[imgIdx], previews[targetIdx]] = [previews[targetIdx], previews[imgIdx]]
      ;[blobPaths[imgIdx], blobPaths[targetIdx]] = [blobPaths[targetIdx], blobPaths[imgIdx]]
      this.$emit('update:item', { ...this.item, imagePreviews: previews, imageBlobPaths: blobPaths })
    },

    async onFileChange(event, appendIdx) {
      const file = event.target.files?.[0]
      if (!file) return
      if (!file.type.startsWith('image/')) return

      const previewUrl = URL.createObjectURL(file)
      this.$emit('upload-image', { index: this.index, imgIdx: appendIdx, file, previewUrl })

      event.target.value = ''
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

.size-hint {
  font-size: 0.8rem;
  color: #888;
}

.images-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-md);
}

.image-slot {
  display: flex;
  flex-direction: column;
  flex: 1 1 200px;
  max-width: 260px;

  @media (max-width: 768px) {
    flex: 1 1 100%;
    max-width: 100%;
  }
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

.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #aaa;
  gap: 6px;
  font-size: 0.85rem;

  i {
    font-size: 1.5rem;
  }
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

.image-nav {
  display: flex;
  justify-content: center;
  gap: var(--sp-xs);
  margin-top: var(--sp-xs);

  :deep(.btn) {
    padding: 2px 8px;
    font-size: 0.75rem;
  }
}
</style>
