<template>
  <div class="form-col-container">
    <div class="filter-container-img">
      <!-- Image preview -->
      <div class="image-preview">
        <imagePreview
          v-if="data.imagePath"
          :imageName="data.imagePath"
          :path="data.imagePath"
          :type="type"
          :width="150"
          :height="150"
          :preview="true"
          class="image-body"
        />
        <img
          v-else
          src="@/assets/no-image.png"
          :width="150"
          :height="150"
          alt="Image"
          class="image-body"
        />
      </div>

      <span v-if="data.imageSuggestAuto && data.imagePath" class="image-suggest-note">
        <i class="bi bi-magic"></i>
        {{ $t('view.receiptStock.product.grProduction.imageSuggestNote', { source: data.imageSuggestSource || '-' }) }}
      </span>

      <!-- Image controls -->
      <div class="image-controls mt-1">
        <button
          class="btn btn-green btn-sm ms-2"
          type="button"
          @click="$emit('selectImage', data)"
        >
          <span class="bi bi-image"></span>
          <span>{{ $t('view.receiptStock.product.grProduction.selectProductImage') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const imagePreview = defineAsyncComponent(() => import('@/components/prime-vue/ImagePreview.vue'))

export default {
  name: 'ProductImage',

  components: {
    imagePreview
  },

  props: {
    data: {
      type: Object,
      required: true
    },
    type: {
      type: String,
      required: true
    }
  },

  emits: ['selectImage']
}
</script>

<style lang="scss" scoped>
.filter-container-img {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  border: 2px dashed #dddddd;
  border-radius: 8px;
  background-color: #f8f9fa;
  transition: all 0.3s ease;

  &:hover {
    border-color: #adb5bd;
  }

  .image-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: white;
    border-radius: 4px;
  }

  .image-controls {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      transform: translateY(-1px);
    }
  }
}

.image-suggest-note {
  margin-top: var(--sp-xs);
  font-size: var(--fs-base);
  font-weight: 500;
  color: color-mix(in srgb, var(--base-green) 65%, black);
}

.image-body {
  border: 1px solid var(--base-color);
}
</style>