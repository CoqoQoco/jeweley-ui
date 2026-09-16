<template>
  <TabViewGeneric v-model="activeTab" :tabs="tabs">
    <template #news>
      <announcementFeed :items="items" :total="total" :canManage="canManage" @load-more="$emit('load-more')" />
    </template>
    <template #gold>
      <goldPricePanel />
    </template>
  </TabViewGeneric>
</template>

<script>
import TabViewGeneric from '@/components/generic/TabViewGeneric.vue'
import announcementFeed from './announcement-feed.vue'
import goldPricePanel from './gold-price-panel.vue'

export default {
  name: 'HomeFeedTabs',

  components: {
    TabViewGeneric,
    announcementFeed,
    goldPricePanel
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
      activeTab: 'news'
    }
  },

  computed: {
    tabs() {
      return [
        { value: 'news', label: this.$t('view.goldPrice.tabs.news') },
        { value: 'gold', label: this.$t('view.goldPrice.tabs.gold') }
      ]
    }
  }
}
</script>
