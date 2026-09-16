<template>
  <modal :showModal="isShow" @closeModal="$emit('closeModal')" width="1200px" :fitHeight="true" headerVariant="main">
    <template #title>
      <span class="title-text-lg px-3 pt-3 d-block">
        {{ $t('view.sale.pipelineDashboard.detailTitle', { code: design ? design.designKey : '' }) }}
        <span v-if="design" class="detail-title-type">{{ design.productTypeName }}</span>
      </span>
    </template>

    <template #content>
      <div v-if="design">
        <div class="detail-summary-strip">
          <div class="detail-summary-image">
            <ImagePreview :imageName="design.imageBlobPath || ''" :width="140" :height="140" :preview="true" />
          </div>
          <div class="detail-summary-body">
            <p class="detail-summary-text">
              {{
                $t('view.sale.pipelineDashboard.detailSummary', {
                  pieces: formatCount(design.pieceCount),
                  amount: formatMoneyValue(design.amountThb),
                  items: itemCount
                })
              }}
            </p>
            <p class="detail-summary-molds">
              <strong>{{ $t('view.sale.pipelineDashboard.detailMoldCodes') }}:</strong>
              {{ (design.moldCodes || []).join(', ') }}
            </p>
          </div>
        </div>

        <BaseDataTable
          :items="design.items || []"
          :totalRecords="itemCount"
          :columns="itemColumns"
          :paginator="false"
          dataKey="stockNumber"
          scrollHeight="360px"
        >
          <template #imageTemplate="{ data }">
            <ImagePreview :imageName="data.imageBlobPath || ''" :width="50" :height="50" :preview="true" />
          </template>
          <template #stockNumberOriginTemplate="{ data }">
            <router-link
              v-if="canViewStockDetail && data.stockNumberOrigin"
              :to="{ name: 'stock-product-detail', params: { stockNumber: data.stockNumber } }"
              class="stock-number-link"
            >
              <strong>{{ data.stockNumberOrigin }}</strong>
            </router-link>
            <strong v-else>{{ data.stockNumberOrigin || '—' }}</strong>
          </template>
          <template #stockNumberTemplate="{ data }">
            <router-link
              v-if="canViewStockDetail"
              :to="{ name: 'stock-product-detail', params: { stockNumber: data.stockNumber } }"
              class="stock-number-link"
            >
              {{ data.stockNumber }}
            </router-link>
            <span v-else>{{ data.stockNumber }}</span>
          </template>
          <template #pieceCountTemplate="{ data }">
            <div class="text-right">{{ formatCount(data.pieceCount) }}</div>
          </template>
          <template #amountThbTemplate="{ data }">
            <div class="text-right">{{ formatMoneyValue(data.amountThb) }}</div>
          </template>
        </BaseDataTable>
      </div>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { formatMoney } from '@/services/utils/decimal.js'
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { PermissionService } from '@/services/permission/permission.js'
import { PERMISSIONS } from '@/services/permission/config.js'

import ImagePreview from '@/components/prime-vue/ImagePreview.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'SalePipelineDashboardTopDesignDetailModal',

  components: {
    modal,
    ImagePreview,
    BaseDataTable
  },

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    design: {
      type: Object,
      default: null
    }
  },

  emits: ['closeModal'],

  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },

  computed: {
    canViewStockDetail() {
      const permissionService = new PermissionService(this.authStore.getUser, this.authStore.permissions)
      return permissionService.hasPermission(PERMISSIONS.STOCK_PRODUCT)
    },

    itemCount() {
      return this.design && this.design.items ? this.design.items.length : 0
    },

    itemColumns() {
      return [
        { field: 'image', header: this.$t('view.sale.pipelineDashboard.colImage'), minWidth: '70px', align: 'center', sortable: false },
        { field: 'stockNumberOrigin', header: this.$t('view.sale.pipelineDashboard.colStockNumberOld'), minWidth: '130px', sortable: false },
        { field: 'stockNumber', header: this.$t('view.sale.pipelineDashboard.colStockNumberNew'), minWidth: '150px', sortable: false },
        { field: 'mold', header: this.$t('view.sale.pipelineDashboard.colMold'), minWidth: '120px', sortable: false },
        { field: 'productionType', header: this.$t('view.sale.pipelineDashboard.colColor'), minWidth: '110px', sortable: false },
        { field: 'productionTypeSize', header: this.$t('view.sale.pipelineDashboard.colGoldSize'), minWidth: '90px', sortable: false },
        { field: 'skuCode', header: this.$t('view.sale.pipelineDashboard.colSku'), minWidth: '150px', sortable: false },
        { field: 'size', header: this.$t('view.sale.pipelineDashboard.colSize'), minWidth: '80px', sortable: false },
        { field: 'pieceCount', header: this.$t('view.sale.pipelineDashboard.colPieceCount'), minWidth: '90px', align: 'right', sortable: false },
        { field: 'amountThb', header: this.$t('view.sale.pipelineDashboard.colAmountThb'), minWidth: '110px', align: 'right', sortable: false }
      ]
    }
  },

  methods: {
    formatMoneyValue(value) {
      return formatMoney(value)
    },

    formatCount(value) {
      return new Intl.NumberFormat('th-TH').format(value || 0)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.detail-title-type {
  font-size: var(--fs-base);
  font-weight: 400;
  margin-left: var(--sp-sm);
  opacity: 0.85;
}

.detail-summary-strip {
  display: flex;
  gap: var(--sp-lg);
  align-items: center;
  margin-bottom: var(--sp-lg);
  padding-bottom: var(--sp-lg);
  border-bottom: 1px solid var(--color-border);
}

.detail-summary-image {
  flex-shrink: 0;
  width: 140px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-highlight-bg);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.detail-summary-body {
  flex: 1;
  min-width: 0;
}

.detail-summary-text {
  margin: 0 0 var(--sp-sm);
  font-weight: 600;
  color: var(--base-font-color);
}

.detail-summary-molds {
  margin: 0;
  color: var(--base-sub-color);
  font-size: var(--fs-sm);
}

.stock-number-link {
  color: var(--base-font-color);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
