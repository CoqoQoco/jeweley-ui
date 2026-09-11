<template>
  <div class="app-container notification-page">
    <DashboardHeaderGeneric
      :title="$t('view.notification.page.title')"
      :subtitle="$t('view.notification.page.subtitle', { total })"
      icon="bi-bell"
      @refresh="fetchData"
    />

    <div class="notification-layout">
      <SectionCardGeneric
        class="notification-filter"
        :title="$t('view.notification.page.filterTitle')"
        icon="bi-funnel"
        accent="main"
        headerStyle="legend"
      >
        <div class="filter-module-list">
          <button
            type="button"
            class="filter-module-item"
            :class="{ 'filter-module-item--active': selectedModule === null }"
            @click="onSelectModule(null)"
          >
            <span>{{ $t('view.notification.page.allModules') }}</span>
            <span class="filter-module-count">{{ notificationStore.count }}</span>
          </button>
          <button
            v-for="entry in notificationStore.countByModule"
            :key="entry.module"
            type="button"
            class="filter-module-item"
            :class="{ 'filter-module-item--active': selectedModule === entry.module }"
            @click="onSelectModule(entry.module)"
          >
            <span>{{ entry.module }}</span>
            <span class="filter-module-count">{{ entry.count }}</span>
          </button>
        </div>

        <div class="filter-divider"></div>

        <CheckboxGeneric
          v-model="includeClosed"
          :label="$t('view.notification.page.includeClosed')"
          @update:modelValue="onFilterChange"
        />
      </SectionCardGeneric>

      <SectionCardGeneric class="notification-list-card">
        <div v-if="items.length" class="notification-list">
          <NotificationItem
            v-for="item in items"
            :key="item.id"
            :item="item"
            @open="onOpen"
            @snooze="onSnooze"
            @done="onDone"
          />
        </div>
        <div v-else class="notification-empty">
          <i class="bi bi-bell-slash"></i>
          <span class="notification-empty__title">{{ $t('view.notification.page.emptyTitle') }}</span>
          <span class="notification-empty__hint">{{ $t('view.notification.page.emptyHint') }}</span>
        </div>

        <div v-if="total > 0" class="notification-pager">
          <span class="notification-pager__info">
            {{ $t('view.notification.page.pageInfo', { from: pageFrom, to: pageTo, total }) }}
          </span>
          <div class="notification-pager__buttons">
            <ButtonGeneric
              variant="outline"
              icon="bi-chevron-left"
              :disabled="skip === 0"
              :title="$t('view.notification.page.prevPage')"
              @click="prevPage"
            />
            <ButtonGeneric
              variant="outline"
              icon="bi-chevron-right"
              :disabled="!hasNextPage"
              :title="$t('view.notification.page.nextPage')"
              @click="nextPage"
            />
          </div>
        </div>
      </SectionCardGeneric>
    </div>
  </div>
</template>

<script>
import dataTablePaging from '@/composables/useDataTablePaging.js'

import { useNotificationStore } from '@/stores/modules/api/notification-store.js'

import DashboardHeaderGeneric from '@/components/generic/DashboardHeaderGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'
import NotificationItem from './components/notification-item.vue'

export default {
  name: 'NotificationListView',

  components: {
    DashboardHeaderGeneric,
    SectionCardGeneric,
    ButtonGeneric,
    CheckboxGeneric,
    NotificationItem
  },

  mixins: [dataTablePaging],

  setup() {
    const notificationStore = useNotificationStore()
    return { notificationStore }
  },

  data() {
    return {
      take: 20,
      selectedModule: null,
      includeClosed: false
    }
  },

  computed: {
    items() {
      return this.notificationStore.list
    },

    total() {
      return this.notificationStore.total
    },

    pageFrom() {
      return this.total === 0 ? 0 : this.skip + 1
    },

    pageTo() {
      return Math.min(this.skip + this.take, this.total)
    },

    hasNextPage() {
      return this.skip + this.take < this.total
    }
  },

  mounted() {
    this.notificationStore.fetchCount()
    this.fetchData()
  },

  methods: {
    fetchData() {
      this.notificationStore.fetchList({
        take: this.take,
        skip: this.skip,
        module: this.selectedModule || undefined,
        includeClosed: this.includeClosed
      })
    },

    onSelectModule(moduleValue) {
      this.selectedModule = moduleValue
      this.resetPaging()
    },

    onFilterChange() {
      this.resetPaging()
    },

    prevPage() {
      this.handlePageChange({ first: Math.max(0, this.skip - this.take), rows: this.take })
    },

    nextPage() {
      this.handlePageChange({ first: this.skip + this.take, rows: this.take })
    },

    onOpen(item) {
      if (item.actionUrl) {
        this.$router.push(item.actionUrl)
      }
      this.notificationStore.markRead([item.id])
    },

    async onSnooze(item) {
      await this.notificationStore.snooze(item.id, 3)
      this.fetchData()
    },

    async onDone(item) {
      await this.notificationStore.markDone(item.id)
      this.fetchData()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/mixin.scss';

.notification-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: var(--sp-lg);
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

.filter-module-list {
  display: flex;
  flex-direction: column;
  gap: var(--sp-xs);
  margin-bottom: var(--sp-lg);
}

.filter-module-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-sm);
  padding: var(--sp-sm) var(--sp-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  font: inherit;
  color: var(--base-sub-color);
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: var(--color-highlight-bg);
  }

  &--active {
    border-color: var(--base-font-color);
    background: var(--color-highlight-bg);
    color: var(--base-font-color);
    font-weight: 600;
  }
}

.filter-module-count {
  min-width: 24px;
  padding: 0 var(--sp-xs);
  border-radius: var(--radius-sm);
  background: var(--base-color);
  font-size: var(--fs-sm);
  font-weight: 700;
  text-align: center;
}

.filter-divider {
  height: 1px;
  background: var(--color-border);
  margin-bottom: var(--sp-lg);
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: var(--sp-md);
}

.notification-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sp-sm);
  padding: var(--sp-2xl) var(--sp-lg);
  text-align: center;

  i {
    font-size: calc(var(--fs-xl) * 1.6);
    color: var(--base-sub-color);
    opacity: 0.6;
  }

  &__title {
    font-weight: 700;
    color: var(--base-font-color);
  }

  &__hint {
    font-size: var(--fs-sm);
    color: var(--base-sub-color);
  }
}

.notification-pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-md);
  margin-top: var(--sp-lg);
  padding-top: var(--sp-lg);
  border-top: 1px solid var(--color-border);
}

.notification-pager__info {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.notification-pager__buttons {
  display: flex;
  gap: var(--sp-xs);
}
</style>
