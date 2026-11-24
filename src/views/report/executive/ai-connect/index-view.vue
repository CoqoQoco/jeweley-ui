<template>
  <div class="app-container ai-connect-page">
    <PageHeaderGeneric :title="$t('view.aiConnector.title')" backRoute="executive" />
    <p class="ai-connect-page__subtitle">{{ $t('view.aiConnector.subtitle') }}</p>

    <TabViewGeneric :modelValue="activeTab" :tabs="tabsConfig" variant="segmented" @update:modelValue="activeTab = $event">
      <template #connect>
        <connectTab :mcpUrl="info.mcpUrl" :configured="info.configured" />
      </template>
      <template #connections>
        <connectionsTab :items="connections" @create="isShowCreate = true" @revoke="onRevoke" />
      </template>
      <template #log>
        <logTab :connections="connections" />
      </template>
    </TabViewGeneric>

    <createPatModal
      :isShow="isShowCreate"
      :patScopes="info.patScopes"
      @closeModal="isShowCreate = false"
      @created="loadConnections"
    />
  </div>
</template>

<script>
import { useAiConnectorStore } from '@/stores/modules/api/ai-connector/ai-connector-store.js'
import { success } from '@/services/alert/sweetAlerts.js'

import PageHeaderGeneric from '@/components/generic/PageHeaderGeneric.vue'
import TabViewGeneric from '@/components/generic/TabViewGeneric.vue'

import connectTab from './components/connect-tab.vue'
import connectionsTab from './components/connections-tab.vue'
import logTab from './components/log-tab.vue'
import createPatModal from './modal/create-pat-modal.vue'

const TAB_VALUES = ['connect', 'connections', 'log']

export default {
  name: 'ExecutiveAiConnect',

  components: { PageHeaderGeneric, TabViewGeneric, connectTab, connectionsTab, logTab, createPatModal },

  setup() {
    return { store: useAiConnectorStore() }
  },

  data() {
    const queryTab = this.$route.query.tab
    return {
      activeTab: TAB_VALUES.includes(queryTab) ? queryTab : 'connect',
      info: { mcpUrl: '', configured: false, patScopes: [] },
      connections: [],
      isShowCreate: false
    }
  },

  computed: {
    tabsConfig() {
      return [
        { value: 'connect', label: this.$t('view.aiConnector.tabs.connect') },
        {
          value: 'connections',
          label: this.$t('view.aiConnector.tabs.connections', { count: this.connections.length })
        },
        { value: 'log', label: this.$t('view.aiConnector.tabs.log') }
      ]
    }
  },

  mounted() {
    this.loadInfo()
    this.loadConnections()
  },

  methods: {
    async loadInfo() {
      const res = await this.store.getInfo()
      if (res) this.info = { mcpUrl: res.mcpUrl || '', configured: !!res.configured, patScopes: res.patScopes || [] }
    },

    async loadConnections() {
      const res = await this.store.listConnections()
      this.connections = res?.items || []
    },

    async onRevoke(item) {
      await this.store.revoke(item.id)
      success(this.$t('view.aiConnector.connections.revokeDone'))
      await this.loadConnections()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.ai-connect-page__subtitle {
  margin: 0 0 var(--sp-lg);
  color: var(--base-sub-color);
  font-size: var(--fs-base);
}
</style>
