<template>
  <div
    class="announcement-card"
    role="button"
    tabindex="0"
    @click="$emit('open')"
    @keydown.enter="$emit('open')"
  >
    <div class="announcement-card__header">
      <span v-if="item.isPinned" class="announcement-card__tag announcement-card__tag--pinned">
        <i class="bi bi-pin-angle-fill"></i>
        {{ $t('view.announcement.pinnedTag') }}
      </span>
      <span v-if="item.audience === 'dev'" class="announcement-card__tag announcement-card__tag--dev">
        <i class="bi bi-eye-slash"></i>
        {{ $t('view.announcement.devOnlyTag') }}
      </span>
      <span class="announcement-card__title">{{ item.title }}</span>
      <span class="announcement-card__date">{{ formattedDate }}</span>
    </div>

    <div class="announcement-card__body">
      <!-- see script comment: thumbnail ใช้ raw <img> แทน ImagePreview -->
      <img
        v-if="item.imageUrl"
        :src="item.imageUrl"
        :alt="item.title"
        class="announcement-card__thumb"
        loading="lazy"
      />
      <p class="announcement-card__text" :class="{ 'announcement-card__text--full': !compact }">{{ item.body }}</p>
    </div>

    <div class="announcement-card__footer">
      <span class="announcement-card__by">{{ $t('view.announcement.feed.by', { name: item.createBy }) }}</span>
      <span v-if="compact" class="announcement-card__more">
        {{ $t('view.announcement.feed.readMore') }}
        <i class="bi bi-chevron-right"></i>
      </span>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import 'dayjs/locale/th'

// ImagePreview บังคับ object-fit: contain ที่ wrapper <span> ไม่ใช่ตัว <img> จริง
// (ดู primevue/image/Image.vue — prop style ผูกกับ root, ไม่ใช่ imageStyle)
// ทำ thumbnail สี่เหลี่ยม object-fit:cover ผ่าน ImagePreview ไม่ได้ ใช้ <img> ตรงแทน
export default {
  name: 'AnnouncementCard',

  props: {
    item: {
      type: Object,
      required: true
    },
    compact: {
      type: Boolean,
      default: true
    }
  },

  emits: ['open'],

  computed: {
    formattedDate() {
      const isEn = this.$i18n.locale === 'en'
      dayjs.locale(isEn ? 'en' : 'th')
      return dayjs(this.item.publishStart).format('D MMM YYYY')
    }
  }
}
</script>

<style lang="scss" scoped>
.announcement-card {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
  padding: var(--sp-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:hover,
  &:focus-visible {
    border-color: var(--base-font-color);
    box-shadow: var(--shadow-sm);
    outline: none;
  }
}

.announcement-card__header {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
}

.announcement-card__tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  padding: 2px var(--sp-sm);
  border: 1px solid;
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
  font-weight: 600;

  &--pinned {
    border-color: var(--base-warning);
    color: var(--base-warning);
  }

  &--dev {
    border-color: var(--color-border);
    color: var(--base-sub-color);
  }
}

.announcement-card__title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-weight: 700;
  font-size: var(--fs-base);
  color: var(--base-font-color);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.announcement-card__date {
  flex-shrink: 0;
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.announcement-card__body {
  display: flex;
  gap: var(--sp-md);
}

.announcement-card__thumb {
  width: 88px;
  height: 88px;
  flex-shrink: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  object-fit: cover;
}

.announcement-card__text {
  flex: 1;
  min-width: 0;
  margin: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  font-size: var(--fs-base);
  line-height: var(--lh-md);
  color: var(--base-font-color);

  &--full {
    display: block;
    -webkit-line-clamp: unset;
    white-space: pre-line;
  }
}

.announcement-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-sm);
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.announcement-card__by {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.announcement-card__more {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: var(--base-font-color);
  font-weight: 600;
}
</style>
