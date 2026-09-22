<template>
  <div class="showcase-gallery">
    <div class="gallery-frame">
      <template v-if="mainImage">
        <span v-if="images.length > 1" class="gallery-counter">{{ counterText }}</span>
        <div class="gallery-frame-image">
          <imagePreview :imageName="mainImage" :width="900" :height="900" :preview="true" :borderShow="false" :alt="alt" />
        </div>
      </template>
      <div v-else class="gallery-placeholder">
        <i class="bi bi-gem"></i>
      </div>
    </div>

    <div v-if="images.length > 1" class="gallery-thumbs">
      <button
        v-for="(img, index) in images"
        :key="index"
        type="button"
        class="gallery-thumb"
        :class="{ 'gallery-thumb--active': index === selectedIndex }"
        :aria-label="$t('view.public.showcase.thumbAria', { n: index + 1 })"
        @click="selectedIndex = index"
      >
        <imagePreview :imageName="img" :width="200" :height="200" :preview="false" :borderShow="false" :alt="alt" />
      </button>
    </div>
  </div>
</template>

<script>
import imagePreview from '@/components/prime-vue/ImagePreview.vue'

export default {
  name: 'ShowcaseGallery',

  components: {
    imagePreview
  },

  props: {
    images: {
      type: Array,
      default: () => []
    },
    alt: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      selectedIndex: 0
    }
  },

  computed: {
    mainImage() {
      return this.images[this.selectedIndex] || this.images[0] || ''
    },

    counterText() {
      return `${this.selectedIndex + 1} / ${this.images.length}`
    }
  },

  watch: {
    images() {
      this.selectedIndex = 0
    }
  }
}
</script>

<style lang="scss" scoped>
.gallery-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: var(--showcase-radius-md);
  border: 1px solid var(--showcase-line);
  background: var(--color-card-bg);
}

.gallery-frame-image {
  width: 100%;
  height: 100%;

  // ImagePreview → PrimeVue Image root เป็น <span> ครอบ <img> — บังคับเต็มกรอบ + คงสัดส่วนภาพ
  :deep(div),
  :deep(span) {
    display: block;
    width: 100%;
    height: 100%;
  }

  :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  // ธีม PrimeVue ทำ mask มืดเต็มรูปตอน hover (rgba(0,0,0,.5)) — ลดให้จางลงไม่ให้รูปมืดจนดูสินค้าไม่ออก
  :deep(.p-image-preview-container:hover > .p-image-preview-indicator) {
    background-color: var(--showcase-image-mask);
  }
}

.gallery-counter {
  position: absolute;
  top: var(--sp-sm);
  left: var(--sp-sm);
  z-index: 1;
  padding: var(--sp-xs) var(--sp-sm);
  border-radius: var(--radius-sm);
  background: var(--color-card-bg);
  box-shadow: var(--shadow-sm);
  color: var(--showcase-ink);
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 600;
  font-size: var(--showcase-fs-label);
}

.gallery-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--showcase-tile);

  i {
    font-size: 3.5rem;
    color: var(--showcase-box-border);
  }
}

.gallery-thumbs {
  margin-top: var(--sp-sm);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--sp-sm);
}

.gallery-thumb {
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  height: var(--showcase-thumb-h);
  border-radius: var(--radius-lg);
  overflow: hidden;

  :deep(div),
  :deep(span) {
    display: block;
    width: 100%;
    height: 100%;
  }

  :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &--active {
    box-shadow: 0 0 0 2px var(--base-font-color);
  }
}

@media (min-width: 900px) {
  .gallery-frame {
    border-radius: var(--showcase-radius-lg);
  }

  .gallery-thumbs {
    gap: var(--sp-md);
  }

  .gallery-thumb {
    height: var(--showcase-thumb-h-lg);
  }

  .gallery-counter {
    font-size: var(--fs-base);
  }
}
</style>
