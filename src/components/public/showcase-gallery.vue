<template>
  <div class="showcase-gallery-frame">
    <div v-if="imagePath" class="showcase-gallery-image">
      <imagePreview
        :imageName="imagePath"
        :width="900"
        :height="900"
        :preview="true"
        :borderShow="false"
        :alt="alt"
      />
    </div>
    <div v-else class="showcase-gallery-placeholder">
      <i class="bi bi-gem"></i>
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
    imagePath: {
      type: String,
      default: ''
    },
    alt: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>
.showcase-gallery-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: var(--radius-lg);
  background: var(--color-card-bg);
  box-shadow: var(--shadow-sm);
}

.showcase-gallery-image {
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
}

.showcase-gallery-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  i {
    font-size: 3.5rem;
    color: var(--color-border);
  }
}
</style>
