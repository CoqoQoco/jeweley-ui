<template>
  <DashboardHeaderGeneric :title="greetingText" :subtitle="currentDateText" icon="bi-brightness-high" @refresh="$emit('refresh')" />
</template>

<script>
import dayjs from 'dayjs'
import 'dayjs/locale/th'

import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import DashboardHeaderGeneric from '@/components/generic/DashboardHeaderGeneric.vue'

export default {
  name: 'GreetingBar',

  components: {
    DashboardHeaderGeneric
  },

  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },

  emits: ['refresh'],

  computed: {
    userName() {
      const user = this.authStore.getUser
      return user?.firstName || user?.username || ''
    },

    greetingText() {
      return this.$t('view.dashboard.home.greeting.hello', { name: this.userName })
    },

    currentDateText() {
      const isEn = this.$i18n.locale === 'en'
      dayjs.locale(isEn ? 'en' : 'th')
      return dayjs().format(isEn ? 'dddd, D MMMM YYYY' : 'วันddddที่ D MMMM YYYY')
    }
  }
}
</script>
