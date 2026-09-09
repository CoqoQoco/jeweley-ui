<template>
  <modal
    :showModal="showModal"
    width="700px"
    :clickToClose="true"
    :isShowActionPart="true"
    headerVariant="main"
    @closeModal="$emit('close')"
  >
    <template #title>
      <span class="title-text-lg d-block">{{ item.title }}</span>
    </template>

    <template #content>
      <div class="announcement-detail">
        <div class="announcement-detail__meta">
          <span v-if="item.isPinned" class="announcement-detail__pinned-tag">
            <i class="bi bi-pin-angle-fill"></i>
            {{ $t('view.announcement.pinnedTag') }}
          </span>
          <span v-if="item.audience === 'dev'" class="announcement-detail__dev-tag">
            <i class="bi bi-eye-slash"></i>
            {{ $t('view.announcement.devOnlyTag') }}
          </span>
          <span class="announcement-detail__date">{{ formattedDate }}</span>
          <span class="announcement-detail__by">{{ $t('view.announcement.feed.by', { name: item.createBy }) }}</span>
        </div>

        <ImagePreview
          v-if="item.imageUrl"
          :src="item.imageUrl"
          :preview="true"
          :width="680"
          :height="420"
          :alt="item.title"
          class="announcement-detail__image"
        />

        <p class="announcement-detail__body">{{ item.body }}</p>
      </div>
    </template>

    <template #action>
      <ButtonGeneric variant="main" :label="$t('view.announcement.action.close')" @click="$emit('close')" />
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/th'

import ImagePreview from '@/components/prime-vue/ImagePreview.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'AnnouncementDetailModal',

  components: {
    modal,
    ImagePreview,
    ButtonGeneric
  },

  props: {
    showModal: {
      type: Boolean,
      default: false
    },
    item: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['close'],

  computed: {
    formattedDate() {
      if (!this.item.publishStart) return ''
      const isEn = this.$i18n.locale === 'en'
      dayjs.locale(isEn ? 'en' : 'th')
      return dayjs(this.item.publishStart).format('D MMM YYYY')
    }
  }
}
</script>

<style lang="scss" scoped>
.announcement-detail {
  display: flex;
  flex-direction: column;
  gap: var(--sp-md);
}

.announcement-detail__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-sm);
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.announcement-detail__pinned-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px var(--sp-sm);
  border: 1px solid var(--base-warning);
  border-radius: var(--radius-sm);
  color: var(--base-warning);
  font-weight: 600;
}

.announcement-detail__dev-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px var(--sp-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--base-sub-color);
  font-weight: 600;
}

.announcement-detail__image {
  width: 100%;

  // ImagePreview บังคับ width/height เป็น HTML attribute บนตัว <img> จริง (ไม่ผ่าน CSS object-fit)
  // override ให้ responsive เต็มความกว้าง content ของ modal แทนขนาดที่ fix ไว้ตอนเรียกใช้
  :deep(.p-image img) {
    width: 100%;
    height: auto;
    border-radius: var(--radius-md);
    object-fit: contain;
  }
}

.announcement-detail__body {
  margin: 0;
  white-space: pre-line;
  font-size: var(--fs-base);
  line-height: var(--lh-md);
  color: var(--base-font-color);
}
</style>
