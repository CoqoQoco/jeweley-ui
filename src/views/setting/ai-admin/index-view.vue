<template>
  <div class="app-container ai-admin-page">
    <DashboardHeaderGeneric
      icon="bi-robot"
      :title="$t('view.aiAdmin.title')"
      :subtitle="$t('view.aiAdmin.subtitle')"
      @refresh="onRefresh"
    />

    <TabViewGeneric :modelValue="activeTab" :tabs="tabsConfig" variant="segmented" @update:modelValue="activeTab = $event">
      <template #users>
        <usersTab
          :users="users"
          :loading="usersLoading"
          :error="usersError"
          @changed="loadUsers(true)"
        />
      </template>
      <template #log>
        <accessLogTab :users="users" :refreshKey="logKey" />
      </template>
      <template #suspensions>
        <suspensionsTab :refreshKey="suspensionKey" @changed="loadUsers(true)" />
      </template>
    </TabViewGeneric>
  </div>
</template>

<script>
import { useAiAdminStore } from '@/stores/modules/api/ai-admin/ai-admin-store.js'

import DashboardHeaderGeneric from '@/components/generic/DashboardHeaderGeneric.vue'
import TabViewGeneric from '@/components/generic/TabViewGeneric.vue'

import usersTab from './components/users-tab.vue'
import accessLogTab from './components/access-log-tab.vue'
import suspensionsTab from './components/suspensions-tab.vue'
import { countActiveSuspensions } from './ai-admin-helpers.js'

export default {
  name: 'SettingAiAdmin',

  components: { DashboardHeaderGeneric, TabViewGeneric, usersTab, accessLogTab, suspensionsTab },

  setup() {
    return { store: useAiAdminStore() }
  },

  data() {
    return {
      activeTab: 'users',
      users: [],
      usersLoading: false,
      usersError: false,
      logKey: 0,
      suspensionKey: 0
    }
  },

  computed: {
    tabsConfig() {
      return [
        { value: 'users', label: this.$t('view.aiAdmin.tabs.users') },
        { value: 'log', label: this.$t('view.aiAdmin.tabs.log') },
        {
          value: 'suspensions',
          label: this.$t('view.aiAdmin.tabs.suspensions', { count: countActiveSuspensions(this.users) })
        }
      ]
    }
  },

  mounted() {
    this.loadUsers()
  },

  methods: {
    // try/catch เฉพาะหน้านี้: API ตอบ error เป็นข้อความล้วน (store ปิด popup กลางด้วย skipError) ต้องแสดงสถานะ error ในแท็บเอง
    async loadUsers(silent = false) {
      if (!silent) this.usersLoading = true
      this.usersError = false
      try {
        const res = await this.store.listUsers()
        this.users = res?.items || []
      } catch {
        this.usersError = true
      } finally {
        this.usersLoading = false
      }
      this.suspensionKey += 1
    },

    onRefresh() {
      this.logKey += 1
      this.loadUsers()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';
</style>
