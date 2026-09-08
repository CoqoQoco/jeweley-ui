<template>
  <SectionCardGeneric
    :title="$t('view.announcement.feed.title')"
    icon="bi-megaphone"
    accent="main"
    headerStyle="legend"
  >
    <div v-if="canManage && items.length" class="feed-toolbar">
      <ButtonGeneric
        variant="outline"
        icon="bi-gear"
        :label="$t('view.announcement.feed.manage')"
        @click="$router.push('/announcement')"
      />
    </div>

    <div v-if="items.length" class="announcement-feed-list">
      <announcementCard
        v-for="entry in items"
        :key="entry.id"
        :item="entry"
        :compact="true"
        @open="openDetail(entry)"
      />
    </div>
    <div v-else class="empty-state">
      <div class="empty-state__icon"><i class="bi bi-megaphone"></i></div>
      <span class="empty-state__title">{{ $t('view.announcement.feed.emptyTitle') }}</span>
      <span class="empty-state__hint">{{
        canManage ? $t('view.announcement.feed.emptyHintManager') : $t('view.announcement.feed.emptyHint')
      }}</span>
      <ButtonGeneric
        v-if="canManage"
        variant="main"
        icon="bi-plus-lg"
        :label="$t('view.announcement.feed.createFirst')"
        @click="$router.push('/announcement/create')"
      />
      <div v-if="canManage" class="empty-state__tips">
        <span><i class="bi bi-pin-angle"></i>{{ $t('view.announcement.feed.tipPin') }}</span>
        <span><i class="bi bi-calendar-event"></i>{{ $t('view.announcement.feed.tipSchedule') }}</span>
        <span><i class="bi bi-image"></i>{{ $t('view.announcement.feed.tipImage') }}</span>
      </div>
    </div>

    <div v-if="items.length < total" class="load-more-row">
      <ButtonGeneric
        variant="outline"
        icon="bi-arrow-down-circle"
        :label="$t('view.announcement.feed.loadMore', { remaining: total - items.length })"
        @click="$emit('load-more')"
      />
    </div>

    <announcementDetailModal
      :showModal="detailModal.isShow"
      :item="detailModal.item"
      @close="detailModal.isShow = false"
    />
  </SectionCardGeneric>
</template>

<script>
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

import announcementCard from '@/views/announcement/components/announcement-card.vue'
import announcementDetailModal from '@/views/announcement/modal/announcement-detail-modal.vue'

// SectionCardGeneric ไม่รองรับ slot #header-actions ในโหมด legend (มีเฉพาะโหมด filled)
// ปุ่มจัดการจึงย้ายมาไว้เป็นแถว toolbar บนสุดของเนื้อหาแทน (ดู .feed-toolbar ใน template)
export default {
  name: 'AnnouncementFeed',

  components: {
    SectionCardGeneric,
    ButtonGeneric,
    announcementCard,
    announcementDetailModal
  },

  props: {
    items: {
      type: Array,
      default: () => []
    },
    total: {
      type: Number,
      default: 0
    },
    canManage: {
      type: Boolean,
      default: false
    }
  },

  emits: ['load-more'],

  data() {
    return {
      detailModal: {
        isShow: false,
        item: {}
      }
    }
  },

  methods: {
    openDetail(item) {
      this.detailModal = { isShow: true, item }
    }
  }
}
</script>

<style lang="scss" scoped>
.feed-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--sp-md);
}

.announcement-feed-list {
  display: flex;
  flex-direction: column;
  gap: var(--sp-md);
}

.load-more-row {
  display: flex;
  justify-content: center;
  margin-top: var(--sp-md);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sp-md);
  min-height: calc(var(--sp-2xl) * 11);
  padding: var(--sp-2xl) var(--sp-lg);
  text-align: center;
}

.empty-state__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(var(--sp-2xl) * 3);
  height: calc(var(--sp-2xl) * 3);
  border-radius: 50%;
  background: var(--color-highlight-bg);

  i {
    font-size: calc(var(--fs-xl) * 1.6);
    color: var(--base-font-color);
  }
}

.empty-state__title {
  font-weight: 700;
  font-size: var(--fs-lg);
  color: var(--base-font-color);
}

.empty-state__hint {
  font-size: var(--fs-base);
  color: var(--base-sub-color);
}

.empty-state__tips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--sp-lg);
  width: 100%;
  margin-top: var(--sp-lg);
  padding-top: var(--sp-lg);
  border-top: 1px solid var(--color-border);

  span {
    display: inline-flex;
    align-items: center;
    gap: var(--sp-xs);
    font-size: var(--fs-sm);
    color: var(--base-sub-color);
  }
}
</style>
