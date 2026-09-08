<template>
  <SectionCardGeneric
    :title="$t('view.announcement.feed.title')"
    icon="bi-megaphone"
    accent="main"
    headerStyle="legend"
  >
    <!-- SectionCardGeneric ไม่รองรับ slot #header-actions ในโหมด legend (มีเฉพาะโหมด filled)
         ปุ่มจัดการจึงย้ายมาไว้เป็นแถว toolbar บนสุดของเนื้อหาแทน -->
    <div v-if="canManage" class="feed-toolbar">
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
      <i class="bi bi-megaphone"></i>
      <span>{{ $t('view.announcement.feed.empty') }}</span>
      <span class="empty-hint">{{ $t('view.announcement.feed.emptyHint') }}</span>
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
  gap: var(--sp-sm);
  padding: var(--sp-xl) 0;
  color: var(--base-sub-color);

  i {
    font-size: 28px;
  }

  .empty-hint {
    font-size: var(--fs-sm);
  }
}
</style>
