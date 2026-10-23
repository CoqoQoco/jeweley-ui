<template>
  <modal :showModal="isShow" width="70%" @closeModal="$emit('closeModal')">
    <template v-slot:title>
      <span class="title-text-lg">{{ $t('view.stock.gem.docTitle', { running: currentRunning }) }}</span>
    </template>
    <template v-slot:content>
      <div v-if="header" class="doc-header">
        <div>
          <span class="doc-label">{{ $t('view.stock.gem.docType') }}</span>
          {{ typeName }}
        </div>
        <div>
          <span class="doc-label">{{ $t('view.stock.gem.docDate') }}</span>
          {{ formatDateTime(header.requestDate) }}
        </div>
        <div>
          <span class="doc-label">{{ $t('view.stock.gem.txOperatorBy') }}</span>
          {{ header.operatorBy || '-' }}
        </div>
        <div>
          <span class="doc-label">{{ $t('view.stock.gem.txCreateBy') }}</span>
          {{ header.createBy || '-' }}
        </div>
        <div v-if="header.refRunning1">
          <span class="doc-label">{{ $t('view.stock.gem.docRef1') }}</span>
          <GemDocLink :value="header.refRunning1" @open="switchDoc" />
        </div>
        <div v-if="header.refRunning2">
          <span class="doc-label">{{ $t('view.stock.gem.docRef2') }}</span>
          <GemDocLink :value="header.refRunning2" @open="switchDoc" />
        </div>
      </div>
      <div v-else-if="loaded" class="doc-empty">{{ $t('view.stock.gem.docNotFound') }}</div>

      <BaseDataTable
        v-if="rows.length > 0"
        :items="rows"
        :totalRecords="rows.length"
        :columns="columns"
        :perPage="rows.length"
        :paginator="false"
      >
        <template #indexTemplate="{ index }">{{ index + 1 }}</template>
        <template #qtyTemplate="{ data: row }">{{ toDecimal3(row.qty) }}</template>
        <template #qtyWeightTemplate="{ data: row }">{{ toDecimal3(row.qtyWeight) }}</template>
        <template #woTextTemplate="{ data: row }">{{ row.woText || '-' }}</template>
        <template #moldTemplate="{ data: row }">{{ row.mold || '-' }}</template>
        <template #remarkTemplate="{ data: row }">
          {{ [row.remark1, row.remark2].filter(Boolean).join(' / ') || '-' }}
        </template>
      </BaseDataTable>

      <div v-if="rows.length > 0" class="doc-total">
        <span>{{ $t('view.stock.gem.docTotal', { count: rows.length }) }}</span>
        <span>{{ $t('view.stock.gem.txQty') }} {{ toDecimal3(totalQty) }}</span>
        <span>{{ $t('view.stock.gem.txWeight') }} {{ toDecimal3(totalWeight) }}</span>
      </div>

      <div class="doc-actions">
        <ButtonGeneric
          v-if="canGoPickReturn"
          variant="green"
          :label="$t('view.stock.gem.docGoPickReturn')"
          @click="goPickReturn"
        />
        <ButtonGeneric variant="outline" :label="$t('common.btn.close')" @click="$emit('closeModal')" />
      </div>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import GemDocLink from './gem-doc-link.vue'

import api from '@/axios/axios-helper.js'
import { formatDateTime } from '@/services/utils/dayjs.js'
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { PermissionService } from '@/services/permission/permission.js'
import { PERMISSIONS } from '@/services/permission/config.js'

export default {
  components: {
    modal,
    BaseDataTable,
    ButtonGeneric,
    GemDocLink
  },
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    running: {
      type: String,
      default: ''
    }
  },
  emits: ['closeModal'],
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  data() {
    return {
      currentRunning: '',
      rows: [],
      loaded: false
    }
  },
  computed: {
    header() {
      return this.rows[0] ?? null
    },
    typeName() {
      const type = this.header?.type
      return type ? this.$t(`view.stock.gem.docType${type}`) : '-'
    },
    totalQty() {
      return this.rows.reduce((sum, row) => sum + Number(row.qty ?? 0), 0)
    },
    totalWeight() {
      return this.rows.reduce((sum, row) => sum + Number(row.qtyWeight ?? 0), 0)
    },
    canGoPickReturn() {
      if (!this.currentRunning.startsWith('PIF')) return false
      const service = new PermissionService(this.authStore.getUser, this.authStore.permissions)
      return service.hasPermission(PERMISSIONS.STOCK_GEM_EDIT)
    },
    columns() {
      return [
        { field: 'index', header: '#', minWidth: '60px', sortable: false },
        { field: 'name', header: this.$t('view.stock.gem.docColGem'), minWidth: '200px', sortable: false },
        { field: 'qty', header: this.$t('view.stock.gem.txQty'), minWidth: '120px', sortable: false },
        { field: 'qtyWeight', header: this.$t('view.stock.gem.txWeight'), minWidth: '120px', sortable: false },
        { field: 'woText', header: this.$t('view.stock.gem.txWo'), minWidth: '120px', sortable: false },
        { field: 'mold', header: this.$t('view.stock.gem.txMold'), minWidth: '120px', sortable: false },
        { field: 'remark', header: this.$t('view.stock.gem.docColRemark'), minWidth: '200px', sortable: false }
      ]
    }
  },
  watch: {
    isShow: {
      handler(val) {
        if (val) {
          this.currentRunning = this.running
          this.fetchDocument()
        }
      },
      immediate: true
    },
    running(val) {
      if (this.isShow) {
        this.currentRunning = val
        this.fetchDocument()
      }
    }
  },
  methods: {
    async fetchDocument() {
      this.rows = []
      this.loaded = false
      const res = await api.jewelry.post('ReceiptAndIssueStockGem/ListTransection', {
        take: 0,
        skip: 0,
        sort: [],
        search: { running: this.currentRunning }
      })
      this.rows = res?.data ?? []
      this.loaded = true
    },
    switchDoc(running) {
      this.currentRunning = running
      this.fetchDocument()
    },
    goPickReturn() {
      this.$router.push({
        name: 'stock-gem-pick-return-and-outbound-create',
        params: { id: this.currentRunning }
      })
    },
    formatDateTime(date) {
      return date ? formatDateTime(date) : '-'
    },
    toDecimal3(value) {
      return Number(value ?? 0).toFixed(3)
    }
  }
}
</script>

<style lang="scss" scoped>
.doc-header {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--sp-sm) var(--sp-lg);
  margin-bottom: var(--sp-lg);
}

.doc-label {
  display: inline-block;
  min-width: 130px;
  color: var(--base-sub-color);
}

.doc-empty {
  padding: var(--sp-lg) 0;
  text-align: center;
}

.doc-total {
  display: flex;
  justify-content: flex-end;
  gap: var(--sp-xl);
  margin-top: var(--sp-md);
  font-weight: 600;
}

.doc-actions {
  display: flex;
  justify-content: center;
  gap: var(--sp-md);
  margin-top: var(--sp-xl);
}
</style>
