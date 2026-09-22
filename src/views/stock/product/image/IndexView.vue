<template>
  <div class="app-container">
    <TabViewGeneric v-model="activeTab" :tabs="tabs">
      <template #customer>
        <customerGalleryView></customerGalleryView>
      </template>
      <template #internal>
        <search></search>
        <imageView></imageView>
      </template>
    </TabViewGeneric>
  </div>
</template>

<script>
import TabViewGeneric from '@/components/generic/TabViewGeneric.vue'

import search from './components/create-view.vue'
import imageView from './components/image-view.vue'
import customerGalleryView from './components/customer-gallery/customer-gallery-view.vue'

const VALID_TABS = ['customer', 'internal']

export default {
  name: 'ProductImage',

  components: {
    TabViewGeneric,
    search,
    imageView,
    customerGalleryView
  },

  data() {
    return {
      activeTab: 'customer'
    }
  },

  computed: {
    tabs() {
      return [
        { value: 'customer', label: this.$t('view.stock.productGallery.tabCustomer') },
        { value: 'internal', label: this.$t('view.stock.productGallery.tabInternal') }
      ]
    }
  },

  watch: {
    activeTab(value) {
      this.$router.replace({ query: { ...this.$route.query, tab: value } }).catch(() => {})
    }
  },

  created() {
    this.activeTab = VALID_TABS.includes(this.$route.query.tab) ? this.$route.query.tab : 'customer'
  }
}
</script>

<style  lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form';
</style>
