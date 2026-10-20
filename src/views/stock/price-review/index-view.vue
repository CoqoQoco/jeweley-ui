<template>
  <div class="app-container">
    <PageHeaderGeneric :title="$t('view.stock.priceReview.title')" backRoute="stock-product-list">
      <template #actions>
        <ButtonGeneric
          icon="bi-file-earmark-excel"
          :label="$t('common.btn.export')"
          :disabled="!(total > 0)"
          @click="onExport"
        />
      </template>
    </PageHeaderGeneric>

    <p class="intro-text">
      <i class="bi bi-info-circle"></i>
      {{ $t('view.stock.priceReview.intro') }}
    </p>

    <StockSearch
      :modelForm="stockFilter"
      :title="$t('view.stock.priceReview.searchTitle')"
      :description="$t('view.stock.priceReview.searchDesc')"
      :showExport="false"
      @search="onSearch"
      @clear="onClear"
    >
      <template #extra-fields>
        <div>
          <span class="title-text">{{ $t('view.stock.priceReview.searchLabel') }}</span>
          <InputTextGeneric
            v-model="form.text"
            :trim="true"
            :bgInput="true"
            :placeholder="$t('view.stock.priceReview.searchPlaceholder')"
          />
        </div>
        <div>
          <span class="title-text">{{ $t('view.stock.priceReview.reasonFilter') }}</span>
          <DropdownGeneric
            :modelValue="form.reasonCode"
            :options="reasonOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="$t('common.label.all')"
            :showClear="true"
            :ariaLabel="$t('view.stock.priceReview.reasonFilter')"
            @update:modelValue="form.reasonCode = $event"
          />
        </div>
        <div>
          <span class="title-text">{{ $t('view.stock.priceReview.reviewStatusFilter') }}</span>
          <DropdownGeneric
            :modelValue="form.reviewStatus"
            :options="reviewStatusOptions"
            optionLabel="label"
            optionValue="value"
            :ariaLabel="$t('view.stock.priceReview.reviewStatusFilter')"
            @update:modelValue="form.reviewStatus = $event || 'PENDING'"
          />
        </div>
      </template>
    </StockSearch>

    <div v-if="canEdit" class="bulk-bar mt-2">
      <ButtonGeneric
        variant="green"
        icon="bi-check2-circle"
        :label="$t('view.stock.priceReview.ackBulkBtn', { count: ackableSelected.length })"
        :disabled="!ackableSelected.length"
        @click="openAck(ackableSelected)"
      />
    </div>

    <BaseDataTable
      class="mt-2"
      :items="items"
      :totalRecords="total"
      dataKey="stockNumber"
      :columns="columns"
      :perPage="take"
      :selectionMode="canEdit"
      :itemsSelection="selected"
      :emptyMessage="$t('view.stock.priceReview.empty')"
      @update:itemsSelection="selected = $event"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <template #imageTemplate="{ data }">
        <ImagePreview
          v-if="data.imagePath"
          :imageName="data.imagePath"
          type="STOCK-PRODUCT"
          :width="40"
          :height="40"
        />
      </template>

      <template #stockNumberOriginTemplate="{ data }">
        <div class="code-cell">
          <span class="code-main">{{ data.stockNumberOrigin || data.stockNumber }}</span>
          <span v-if="data.stockNumberOrigin" class="code-sub">{{ data.stockNumber }}</span>
        </div>
      </template>

      <template #productNumberTemplate="{ data }">
        <div class="code-cell">
          <span>{{ data.productNumber || '-' }}</span>
          <span class="code-sub">{{ data.productNameTh }}</span>
        </div>
      </template>

      <template #woTemplate="{ data }">
        <span>{{ formatWoText(data) || '-' }}</span>
      </template>

      <template #priceTemplate="{ data }">
        <span class="price-main">{{ formatPriceNumber(data.price) }}</span>
      </template>

      <template #reasonsTemplate="{ data }">
        <div v-if="data.priceChangedSinceAck" class="changed-tag">
          <i class="bi bi-exclamation-triangle"></i>
          {{
            $t('view.stock.priceReview.priceChanged', {
              old: formatPriceNumber(data.ackPrice),
              new: formatPriceNumber(data.price)
            })
          }}
        </div>
        <ul class="reason-list">
          <li v-for="(line, idx) in reasonLines(data)" :key="idx">{{ line }}</li>
        </ul>
        <div v-if="data.isAcked" class="acked-info">
          <div>
            <i class="bi bi-check2-circle"></i>
            {{ $t('view.stock.priceReview.ackedBy', { by: data.ackBy || '-', date: formatAckDate(data.ackDate) }) }}
          </div>
          <div v-if="data.ackNote">{{ $t('view.stock.priceReview.ackedNote', { note: data.ackNote }) }}</div>
        </div>
      </template>

      <template #suggestedPriceTemplate="{ data }">
        <span v-if="data.suggestedPrice !== null && data.suggestedPrice !== undefined">
          {{ formatPriceNumber(data.suggestedPrice) }}
        </span>
        <span v-else>-</span>
      </template>

      <template #actionTemplate="{ data }">
        <div class="btn-action-container">
          <a
            :href="getDetailHref(data)"
            target="_blank"
            rel="noopener"
            class="btn btn-sm view-link"
            :title="$t('common.btn.view')"
          >
            <i class="bi bi-eye"></i>
          </a>
          <ButtonGeneric
            v-if="canEdit"
            variant="outline"
            icon="bi-pencil"
            :title="$t('common.btn.edit')"
            @click="onEdit(data)"
          />
          <ButtonGeneric
            v-if="canEdit && !data.isAcked"
            variant="green"
            icon="bi-check2-circle"
            :title="$t('view.stock.priceReview.ackBtn')"
            @click="openAck([data])"
          />
          <ButtonGeneric
            v-if="canEdit && data.isAcked"
            variant="dark"
            icon="bi-arrow-counterclockwise"
            :title="$t('view.stock.priceReview.unackBtn')"
            @click="onUnack(data)"
          />
        </div>
      </template>
    </BaseDataTable>

    <UpdateModal :isShow="isShowUpdate" :modelStock="modelStock" @closeModal="onCloseUpdate" />
    <AckModal :isShow="isShowAck" :count="ackTargets.length" @close="isShowAck = false" @confirm="onConfirmAck" />
  </div>
</template>

<script>
import { usrStockProductApiStore, buildSearchParam } from '@/stores/modules/api/stock/product-api.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import dataTablePaging from '@/composables/useDataTablePaging.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'
import { formatDateTime } from '@/services/utils/dayjs.js'
import { success } from '@/services/alert/sweetAlerts.js'
import { hasQuickPriceAccess } from '@/services/permission/quick-price-access.js'
import { formatReasons, formatPriceNumber } from '@/services/helper/price-check/price-check.js'
import {
  REASON_CODES,
  REVIEW_STATUSES,
  EXPORT_TAKE,
  createStockFilter,
  buildPriceReviewSearch,
  buildPriceReviewExportRows,
  formatWoText
} from './price-review-helpers.js'

import PageHeaderGeneric from '@/components/generic/PageHeaderGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import ImagePreview from '@/components/prime-vue/ImagePreview.vue'
import UpdateModal from '@/views/stock/product/list/modal/update-view.vue'
import StockSearch from '@/views/stock/product/list/components/search-view.vue'
import AckModal from './components/price-review-ack-modal.vue'

const interfaceForm = {
  text: '',
  reasonCode: null,
  reviewStatus: 'PENDING'
}

export default {
  name: 'StockPriceReview',

  components: {
    PageHeaderGeneric,
    StockSearch,
    InputTextGeneric,
    ButtonGeneric,
    DropdownGeneric,
    BaseDataTable,
    ImagePreview,
    UpdateModal,
    AckModal
  },

  mixins: [dataTablePaging],

  setup() {
    const productStore = usrStockProductApiStore()
    const masterStore = useMasterApiStore()
    return { productStore, masterStore }
  },

  data() {
    return {
      form: { ...interfaceForm },
      stockFilter: createStockFilter(),
      items: [],
      total: 0,
      selected: [],
      isShowAck: false,
      ackTargets: [],
      isShowUpdate: false,
      modelStock: {}
    }
  },

  computed: {
    // StockProduct/Update, PriceReviewAck เช็คสิทธิ์ update_stock (Dev/Admin/StockOperator) — ใช้ role เดียวกับ backend
    canEdit() {
      return hasQuickPriceAccess()
    },

    reasonOptions() {
      return REASON_CODES.map((code) => ({
        value: code,
        label: this.$t(`view.stock.priceReview.reasonCode.${code}`)
      }))
    },

    reviewStatusOptions() {
      return REVIEW_STATUSES.map((value) => ({
        value,
        label: this.$t(`view.stock.priceReview.reviewStatus.${value}`)
      }))
    },

    ackableSelected() {
      return this.selected.filter((row) => !row.isAcked)
    },

    columns() {
      return [
        { field: 'action', header: '', minWidth: '130px', sortable: false, align: 'center' },
        { field: 'image', header: '', minWidth: '60px', sortable: false, align: 'center' },
        {
          field: 'stockNumberOrigin',
          header: this.$t('view.stock.priceReview.colStockCode'),
          sortable: true,
          minWidth: '160px'
        },
        {
          field: 'productNumber',
          header: this.$t('view.stock.priceReview.colProduct'),
          sortable: true,
          minWidth: '200px'
        },
        {
          field: 'productTypeName',
          header: this.$t('view.stock.product.productType'),
          sortable: true,
          minWidth: '120px'
        },
        {
          field: 'wo',
          header: this.$t('view.stock.product.wo'),
          sortable: true,
          minWidth: '110px'
        },
        {
          field: 'price',
          header: this.$t('common.field.price'),
          sortable: true,
          minWidth: '120px',
          align: 'right'
        },
        {
          field: 'reasons',
          header: this.$t('view.stock.priceReview.colReasons'),
          sortable: false,
          minWidth: '320px'
        },
        {
          field: 'suggestedPrice',
          header: this.$t('view.stock.priceReview.colSuggested'),
          sortable: false,
          minWidth: '120px',
          align: 'right'
        }
      ]
    }
  },

  methods: {
    formatWoText,
    formatPriceNumber,

    formatAckDate(value) {
      return value ? formatDateTime(value) : '-'
    },

    reasonLines(row) {
      return formatReasons(this.$t, row.reasons)
    },

    getDetailHref(row) {
      return this.$router.resolve({
        name: 'stock-product-detail',
        params: { stockNumber: row.stockNumber }
      }).href
    },

    buildSearch() {
      return buildPriceReviewSearch(this.form, buildSearchParam(this.stockFilter))
    },

    async fetchData() {
      const res = await this.productStore.fetchPriceOutlierList({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        search: this.buildSearch()
      })
      if (res) {
        this.items = res.data || []
        this.total = res.total || 0
        this.selected = []
      }
    },

    onSearch(filter) {
      this.stockFilter = { ...filter }
      this.resetPaging()
    },

    onClear() {
      this.form = { ...interfaceForm }
      this.stockFilter = createStockFilter()
      this.resetPaging()
    },

    openAck(rows) {
      this.ackTargets = rows
      this.isShowAck = true
    },

    async onConfirmAck(note) {
      const res = await this.productStore.fetchPriceReviewAck({
        stockNumbers: this.ackTargets.map((row) => row.stockNumber),
        note
      })
      this.isShowAck = false
      if (!res) return
      success(this.$t('view.stock.priceReview.ackSuccess', { count: res.count ?? this.ackTargets.length }))
      this.ackTargets = []
      this.fetchData()
    },

    onUnack(row) {
      confirmThenSubmit(
        this.$t('view.stock.priceReview.unackConfirmMsg', {
          stockNumber: row.stockNumberOrigin || row.stockNumber
        }),
        this.$t('view.stock.priceReview.unackConfirmTitle'),
        async () => {
          const res = await this.productStore.fetchPriceReviewUnack({ stockNumbers: [row.stockNumber] })
          if (!res) return
          success(this.$t('view.stock.priceReview.unackSuccess', { count: res.count ?? 1 }))
          this.fetchData()
        },
        { confirmText: this.$t('common.btn.confirm'), cancelText: this.$t('common.btn.cancel') }
      )
    },

    // แก้ไข: โหลด record เต็ม (materials, skuPieceCount ฯลฯ) แล้วเปิด modal เดียวกับหน้าตรวจคลัง
    async onEdit(row) {
      const res = await this.productStore.fetchDataGet({
        formValue: { stockNumber: row.stockNumber }
      })
      if (!res) return
      this.modelStock = res
      this.isShowUpdate = true
    },

    onCloseUpdate(action) {
      this.isShowUpdate = false
      this.modelStock = {}
      if (action === 'fetch') this.fetchData()
    },

    async onExport() {
      const res = await this.productStore.fetchPriceOutlierList({
        take: EXPORT_TAKE,
        skip: 0,
        sort: this.sort,
        search: this.buildSearch()
      })
      const rows = res?.data || []
      if (!rows.length) return

      const headers = {
        stockNumberOrigin: this.$t('view.stock.product.stockNumberOld'),
        stockNumber: this.$t('view.stock.product.stockNumberNew'),
        productNumber: this.$t('view.stock.product.productNumber'),
        productName: this.$t('view.stock.product.productNameTh'),
        productType: this.$t('view.stock.product.productType'),
        wo: this.$t('view.stock.product.wo'),
        price: this.$t('common.field.price'),
        reasons: this.$t('view.stock.priceReview.colReasons'),
        suggestedPrice: this.$t('view.stock.priceReview.colSuggested'),
        ackStatus: this.$t('view.stock.priceReview.colAckStatus'),
        ackBy: this.$t('view.stock.priceReview.colAckBy'),
        ackDate: this.$t('view.stock.priceReview.colAckDate'),
        ackNote: this.$t('view.stock.priceReview.colAckNote')
      }
      const ackLabels = {
        acked: this.$t('view.stock.priceReview.reviewStatus.ACKED'),
        pending: this.$t('view.stock.priceReview.reviewStatus.PENDING'),
        changed: this.$t('view.stock.priceReview.statusChanged')
      }
      const data = buildPriceReviewExportRows(this.$t, rows, headers, ackLabels, formatDateTime)
      const title = this.$t('view.stock.priceReview.title')
      await ExcelHelper.exportToExcel(data, {
        filename: `${title}.xlsx`,
        sheetName: title,
        columns: Object.values(headers).map((header) => ({ header, key: header }))
      })
    }
  },

  created() {
    this.masterStore.fetchGold()
    this.masterStore.fetchGoldSize()
    this.masterStore.fetchProductType()
    this.masterStore.fetchGem()
    this.fetchData()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/custom-style/standard-data-table';

.intro-text {
  margin: 0 0 var(--sp-lg);
  color: var(--base-sub-color);
  font-size: var(--fs-base);
  line-height: var(--lh-md);
}

.bulk-bar {
  display: flex;
  justify-content: flex-end;
}

.code-cell {
  display: flex;
  flex-direction: column;
}

.code-main {
  font-weight: 700;
}

.code-sub {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.price-main {
  font-weight: 700;
  color: var(--base-font-color);
}

.changed-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
  margin-bottom: var(--sp-xs);
  padding: var(--sp-xs) var(--sp-sm);
  border: 1px solid var(--status-open);
  border-radius: var(--radius-md);
  background: var(--status-open-bg);
  color: var(--base-font-color);
  font-size: var(--fs-sm);
  font-weight: 600;
}

.acked-info {
  margin-top: var(--sp-xs);
  font-size: var(--fs-sm);
  color: var(--base-green);
}

.reason-list {
  margin: 0;
  padding-left: var(--sp-lg);
  font-size: var(--fs-sm);
}

.view-link {
  background-color: var(--base-font-color);
  color: var(--on-inverse);
  text-decoration: none;

  &:hover {
    color: var(--on-inverse);
    filter: brightness(0.92);
  }
}
</style>
