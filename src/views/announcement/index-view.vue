<template>
  <div class="app-container">
    <SearchBarGeneric
      :title="$t('view.announcement.list.title')"
      :description="$t('view.announcement.list.description')"
      icon="bi-megaphone"
      @search="onSearch"
      @clear="onClear"
    >
      <template #fields>
        <div class="form-field">
          <span class="title-text">{{ $t('view.announcement.list.keyword') }}</span>
          <InputTextGeneric
            v-model="filter.keyword"
            :placeholder="$t('view.announcement.list.keywordPlaceholder')"
          />
        </div>
        <div class="form-field">
          <span class="title-text">{{ $t('view.announcement.list.status') }}</span>
          <DropdownGeneric
            :modelValue="filter.status"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="$t('view.announcement.status.all')"
            @update:modelValue="filter.status = $event"
          />
        </div>
        <div class="form-field">
          <span class="title-text">{{ $t('view.announcement.list.pinned') }}</span>
          <DropdownGeneric
            :modelValue="filter.pinned"
            :options="pinnedOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="$t('view.announcement.pinnedFilter.all')"
            @update:modelValue="filter.pinned = $event"
          />
        </div>
        <div class="form-field">
          <span class="title-text">{{ $t('view.announcement.list.audience') }}</span>
          <DropdownGeneric
            :modelValue="filter.audience"
            :options="audienceFilterOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="$t('view.announcement.audience.filterAll')"
            @update:modelValue="filter.audience = $event"
          />
        </div>
      </template>

      <template #actions-right>
        <ButtonGeneric variant="main" icon="bi-search" type="submit" :title="$t('common.btn.search')" />
        <ButtonGeneric variant="dark" icon="bi-x-circle" class="ml-2" :title="$t('common.btn.clear')" @click="onClear" />
        <ButtonGeneric
          variant="main"
          icon="bi-plus-lg"
          class="ml-2"
          :label="$t('view.announcement.list.create')"
          @click="$router.push('/announcement/create')"
        />
      </template>
    </SearchBarGeneric>

    <div class="mt-2">
      <BaseDataTable
        :items="dataList"
        :totalRecords="total"
        :columns="columns"
        :perPage="take"
        @page="handlePageChange"
        @sort="handleSortChange"
      >
        <template #isPinnedTemplate="{ data }">
          <i v-if="data.isPinned" class="bi bi-pin-angle-fill pinned-icon" :title="$t('view.announcement.pinnedTag')"></i>
        </template>

        <template #windowTemplate="{ data }">
          <span>{{ formatWindow(data) }}</span>
        </template>

        <template #displayStatusTemplate="{ data }">
          <span :class="['status-badge', statusClass(data.displayStatus)]">{{ statusLabel(data.displayStatus) }}</span>
          <span v-if="data.audience === 'dev'" class="status-badge status-dev">{{ $t('view.announcement.devOnlyTag') }}</span>
        </template>

        <template #actionTemplate="{ data }">
          <ButtonGeneric
            variant="green"
            icon="bi-pencil"
            :title="$t('view.announcement.action.edit')"
            @click="onEdit(data)"
          />
          <ButtonGeneric
            variant="dark"
            :icon="data.isPublished ? 'bi-eye-slash' : 'bi-eye'"
            class="ml-1"
            :title="data.isPublished ? $t('view.announcement.action.hide') : $t('view.announcement.action.show')"
            @click="onTogglePublish(data)"
          />
          <ButtonGeneric
            variant="red"
            icon="bi-trash"
            class="ml-1"
            :title="$t('view.announcement.action.delete')"
            @click="onDelete(data)"
          />
        </template>
      </BaseDataTable>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import 'dayjs/locale/th'

import { useAnnouncementStore } from '@/stores/modules/api/announcement/announcement-store.js'
import dataTablePaging from '@/composables/useDataTablePaging.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { success } from '@/services/alert/sweetAlerts.js'
import {
  getDisplayStatusOptions,
  DISPLAY_STATUS_META,
  statusFilterToIsPublished,
  getAudienceFilterOptions
} from './constants/display-status.js'

import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'AnnouncementIndexView',

  components: {
    SearchBarGeneric,
    InputTextGeneric,
    ButtonGeneric,
    DropdownGeneric,
    BaseDataTable
  },

  mixins: [dataTablePaging],

  setup() {
    const announcementStore = useAnnouncementStore()
    return { announcementStore }
  },

  data() {
    return {
      dataList: [],
      total: 0,
      filter: {
        keyword: null,
        status: null,
        pinned: null,
        audience: null
      }
    }
  },

  computed: {
    statusOptions() {
      return getDisplayStatusOptions(this.$t)
    },

    pinnedOptions() {
      return [
        { value: null, label: this.$t('view.announcement.pinnedFilter.all') },
        { value: true, label: this.$t('view.announcement.pinnedFilter.yes') },
        { value: false, label: this.$t('view.announcement.pinnedFilter.no') }
      ]
    },

    audienceFilterOptions() {
      return getAudienceFilterOptions(this.$t)
    },

    columns() {
      return [
        { field: 'id', header: this.$t('view.announcement.list.col.id'), width: '70px', sortable: false },
        { field: 'title', header: this.$t('view.announcement.list.col.title'), minWidth: '220px' },
        { field: 'isPinned', header: this.$t('view.announcement.list.col.pinned'), width: '90px', align: 'center', sortable: false },
        { field: 'window', header: this.$t('view.announcement.list.col.window'), minWidth: '220px', sortable: false },
        { field: 'displayStatus', header: this.$t('view.announcement.list.col.status'), minWidth: '120px', sortable: false },
        { field: 'createBy', header: this.$t('view.announcement.list.col.createBy'), minWidth: '120px' },
        { field: 'action', header: this.$t('view.announcement.list.col.action'), width: '140px', align: 'center', sortable: false }
      ]
    }
  },

  mounted() {
    this.fetchData()
  },

  methods: {
    async fetchData() {
      const res = await this.announcementStore.searchAnnouncements({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        keyword: this.filter.keyword || undefined,
        isPublished: statusFilterToIsPublished(this.filter.status),
        isPinned: this.filter.pinned === null ? undefined : this.filter.pinned,
        audience: this.filter.audience || undefined
      })
      if (res) {
        this.dataList = res.data
        this.total = res.total
      }
    },

    onSearch() {
      this.resetPaging()
    },

    onClear() {
      this.filter = { keyword: null, status: null, pinned: null, audience: null }
      this.resetPaging()
    },

    formatWindow(row) {
      const start = row.publishStart ? this.formatShortDate(row.publishStart) : '-'
      const end = row.publishEnd ? this.formatShortDate(row.publishEnd) : this.$t('view.announcement.list.noEnd')
      return `${start} – ${end}`
    },

    formatShortDate(date) {
      const isEn = this.$i18n.locale === 'en'
      dayjs.locale(isEn ? 'en' : 'th')
      return dayjs(date).format('D MMM YYYY')
    },

    statusLabel(status) {
      const meta = DISPLAY_STATUS_META[status]
      return meta ? this.$t(meta.i18nKey) : status || '-'
    },

    statusClass(status) {
      const meta = DISPLAY_STATUS_META[status]
      return meta ? meta.badgeClass : ''
    },

    onEdit(row) {
      this.$router.push({ name: 'announcement-edit', params: { id: row.id } })
    },

    onTogglePublish(row) {
      const messageKey = row.isPublished ? 'view.announcement.confirm.hide' : 'view.announcement.confirm.show'
      confirmThenSubmit(row.title, this.$t(messageKey), async () => {
        const res = await this.announcementStore.togglePublish(row.id, !row.isPublished)
        if (res) this.fetchData()
      })
    },

    onDelete(row) {
      confirmThenSubmit(row.title, this.$t('view.announcement.confirm.delete'), async () => {
        const res = await this.announcementStore.deleteAnnouncement(row.id)
        if (res) {
          success(this.$t('view.announcement.alert.deleted'))
          this.fetchData()
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.mt-2 {
  margin-top: var(--sp-sm);
}

.pinned-icon {
  color: var(--base-warning);
  font-size: var(--fs-lg);
}

.status-badge {
  display: inline-block;
  padding: var(--sp-xs) var(--sp-sm);
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
  font-weight: 600;

  &.status-visible {
    background: var(--status-resolved-bg);
    color: var(--status-resolved);
  }

  &.status-hidden {
    background: var(--status-closed-bg);
    color: var(--status-closed);
  }

  &.status-scheduled {
    background: var(--status-open-bg);
    color: var(--status-open);
  }

  &.status-expired {
    background: var(--status-cancelled-bg);
    color: var(--status-cancelled);
  }

  &.status-dev {
    margin-left: var(--sp-xs);
    background: transparent;
    border: 1px solid var(--color-border);
    color: var(--base-sub-color);
  }
}
</style>
