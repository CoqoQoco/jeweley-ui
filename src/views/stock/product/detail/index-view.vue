<template>
  <div class="app-container">
    <PageHeaderGeneric :title="pageTitle" @back="goBack">
      <template #actions>
        <template v-if="item">
          <ButtonGeneric
            variant="outline"
            icon="bi-upc-scan"
            :label="$t('view.stock.product.printBarcode')"
            @click="isShow.isBarcode = true"
          />
          <ButtonGeneric
            variant="outline"
            icon="bi-calculator"
            :label="$t('view.stock.product.viewCost')"
            @click="costDetailVisible = true"
          />
          <ButtonGeneric
            variant="outline"
            icon="bi-clock-history"
            :label="$t('view.stock.product.viewHistory')"
            @click="costHistoryVisible = true"
          />
          <ButtonGeneric
            variant="outline"
            icon="bi-qr-code"
            :label="$t('view.public.share.buttonTitle')"
            @click="shareVisible = true"
          />
          <ButtonGeneric
            variant="main"
            class="is-primary"
            icon="bi-pencil"
            :label="$t('common.btn.edit')"
            @click="isShow.isUpdate = true"
          />
        </template>
      </template>
    </PageHeaderGeneric>

    <div v-if="item">
      <div class="detail-top">
        <SectionCardGeneric :title="$t('view.stock.product.imageProduct')" headerStyle="legend" icon="bi-image" accent="main">
          <div class="image-box">
            <imagePreview
              v-if="item.imagePath"
              :imageName="item.imagePath"
              type="STOCK-PRODUCT"
              :width="280"
              :height="280"
              :preview="true"
            />
            <img v-else src="@/assets/no-image.png" width="280" height="280" alt="No Image" />
          </div>
        </SectionCardGeneric>

        <SectionCardGeneric :title="$t('view.stock.product.stockInfo')" headerStyle="legend" icon="bi-clipboard2-check-fill" accent="main">
          <div class="detail-grid">
            <div v-if="statusChip" class="detail-field detail-field--full">
              <span class="detail-label">{{ $t('view.stock.product.pieceStatus') }}</span>
              <span class="detail-value">
                <span class="status-chip" :class="statusChip.className">{{ statusChip.label }}</span>
              </span>
            </div>
            <div class="detail-field">
              <span class="detail-label">{{ $t('view.stock.product.stockNumberNew') }}</span>
              <span class="detail-value detail-value--strong">{{ item.stockNumber || '—' }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">{{ $t('view.stock.product.stockNumberOld') }}</span>
              <span class="detail-value detail-value--strong">{{ item.stockNumberOrigin || '—' }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">{{ $t('view.stock.product.productNumber') }}</span>
              <span class="detail-value">{{ item.productNumber || '—' }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">{{ $t('view.stock.product.mold') }}</span>
              <span class="detail-value">{{ item.mold || '—' }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">{{ $t('view.stock.product.productNameEn') }}</span>
              <span class="detail-value">{{ item.productNameEn || '—' }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">{{ $t('view.stock.product.productNameTh') }}</span>
              <span class="detail-value">{{ item.productNameTh || '—' }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">{{ $t('view.stock.product.productType') }}</span>
              <span class="detail-value">{{ item.productTypeName || '—' }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">{{ $t('view.stock.product.size') }}</span>
              <span class="detail-value">{{ item.size || '—' }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">{{ $t('view.stock.product.earringStemSize') }}</span>
              <span class="detail-value">{{ item.earringStemSize || '—' }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">{{ $t('view.stock.product.goldColor') }}</span>
              <span class="detail-value">{{ item.productionType || '—' }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">{{ $t('view.stock.product.goldType') }}</span>
              <span class="detail-value">{{ item.productionTypeSize || '—' }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">{{ $t('view.stock.product.wo') }}</span>
              <span class="detail-value">{{ woText }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">{{ $t('view.stock.product.locationHeader') }}</span>
              <span class="detail-value">{{ item.location || '—' }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">{{ $t('view.stock.product.salePrice') }}</span>
              <span class="detail-value">{{ formatDecimal(item.productPrice, 2) }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">{{ $t('view.stock.product.tagPriceMultiplierLabel') }}</span>
              <span class="detail-value">× {{ formatDecimal(item.tagPriceMultiplier ?? 1, 2) }}</span>
            </div>
            <div class="detail-field detail-field--full">
              <span class="detail-label">{{ $t('common.field.remark') }}</span>
              <span class="detail-value">{{ item.remark || '—' }}</span>
            </div>
          </div>
        </SectionCardGeneric>
      </div>

      <SectionCardGeneric :title="$t('view.stock.product.materialsTitle')" headerStyle="legend" icon="bi-gem" accent="main">
        <materialTable :items="item.materials || []" variant="full" />
      </SectionCardGeneric>

      <div class="detail-bottom">
        <SectionCardGeneric :title="$t('view.stock.product.balanceTitle')" headerStyle="legend" icon="bi-box-seam" accent="main">
          <balancePanel :item="item" />
        </SectionCardGeneric>

        <SectionCardGeneric :title="$t('view.stock.product.receiptInfoTitle')" headerStyle="legend" icon="bi-clock-history" accent="main">
          <div class="detail-grid">
            <div class="detail-field">
              <span class="detail-label">{{ $t('view.stock.product.receiptNumber') }}</span>
              <span class="detail-value">{{ item.receiptNumber || '—' }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">{{ $t('view.stock.product.receiptType') }}</span>
              <span class="detail-value">{{ item.receiptType || '—' }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">{{ $t('view.stock.product.receiptDate') }}</span>
              <span class="detail-value">{{ item.receiptDate ? formatDate(item.receiptDate) : '—' }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">{{ $t('view.stock.product.productionDate') }}</span>
              <span class="detail-value">{{ item.productionDate ? formatDate(item.productionDate) : '—' }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">{{ $t('view.stock.product.receiver') }}</span>
              <span class="detail-value">{{ item.createBy || '—' }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">{{ $t('view.stock.product.receivedAt') }}</span>
              <span class="detail-value">{{ item.createDate ? formatDate(item.createDate) : '—' }}</span>
            </div>
            <template v-if="item.updateBy || item.updateDate">
              <div class="detail-field">
                <span class="detail-label">{{ $t('view.stock.product.updatedBy') }}</span>
                <span class="detail-value">{{ item.updateBy || '—' }}</span>
              </div>
              <div class="detail-field">
                <span class="detail-label">{{ $t('view.stock.product.updatedAt') }}</span>
                <span class="detail-value">{{ item.updateDate ? formatDate(item.updateDate) : '—' }}</span>
              </div>
            </template>
          </div>
        </SectionCardGeneric>
      </div>
    </div>

    <div v-else-if="notFound">
      <SectionCardGeneric :title="$t('view.stock.product.notFoundTitle')" headerStyle="legend" icon="bi-exclamation-circle" accent="main">
        <div class="not-found-box">
          <p>{{ $t('view.stock.product.notFoundDesc', { stockNumber }) }}</p>
          <ButtonGeneric
            variant="outline"
            icon="bi-arrow-left"
            :label="$t('view.stock.product.backToList')"
            @click="$router.push({ name: 'stock-product-list' })"
          />
        </div>
      </SectionCardGeneric>
    </div>

    <update :isShow="isShow.isUpdate" :modelStock="item || {}" @closeModal="onCloseModal" />
    <barcode :isShow="isShow.isBarcode" :modelStock="item || {}" @closeModal="onCloseModal" />
    <costDetailModal v-model:visible="costDetailVisible" :stockNumber="stockNumber" :stockData="item" />
    <costHistoryModal v-model:visible="costHistoryVisible" :stockNumber="stockNumber" :stockData="item" />
    <productShareDialog v-model:visible="shareVisible" :stockNumber="stockNumber" />
  </div>
</template>

<script>
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { useStockBalanceApiStore } from '@/stores/modules/api/stock/stock-balance-api.js'
import { useStockLocationApiStore } from '@/stores/modules/api/stock/stock-location-api.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { mergeBalanceIntoItems } from '@/composables/useStockBalanceMerge.js'
import { formatDecimal } from '@/services/utils/decimal.js'
import { formatDate } from '@/services/utils/dayjs.js'

import PageHeaderGeneric from '@/components/generic/PageHeaderGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import imagePreview from '@/components/prime-vue/ImagePreview.vue'
import productShareDialog from '@/components/public/product-share-dialog.vue'

import materialTable from '../components/material-table.vue'
import balancePanel from '../components/balance-panel.vue'
import update from '../list/modal/update-view.vue'
import barcode from '../list/modal/barcode-view.vue'
import costDetailModal from '../list/components/cost-detail-modal.vue'
import costHistoryModal from '../list/components/cost-history-modal.vue'

const interfaceShow = {
  isUpdate: false,
  isBarcode: false
}

export default {
  name: 'StockProductDetailView',

  components: {
    PageHeaderGeneric,
    ButtonGeneric,
    SectionCardGeneric,
    imagePreview,
    materialTable,
    balancePanel,
    update,
    barcode,
    costDetailModal,
    costHistoryModal,
    productShareDialog
  },

  setup() {
    const productStore = usrStockProductApiStore()
    const balanceStore = useStockBalanceApiStore()
    const locationStore = useStockLocationApiStore()
    const masterStore = useMasterApiStore()
    return { productStore, balanceStore, locationStore, masterStore }
  },

  data() {
    return {
      item: null,
      notFound: false,
      isShow: { ...interfaceShow },
      costDetailVisible: false,
      costHistoryVisible: false,
      shareVisible: false
    }
  },

  computed: {
    stockNumber() {
      return this.$route.params.stockNumber
    },

    pageTitle() {
      return `${this.$t('view.stock.product.detailPageTitle')} · ${this.stockNumber}`
    },

    woText() {
      if (!this.item?.wo && !this.item?.woNumber) return '—'
      return `${this.item.wo ?? ''}-${this.item.woNumber ?? ''}`
    },

    statusChip() {
      const status = this.item?.status
      if (status === 'IN_STOCK') {
        return { label: this.$t('view.stock.product.inStock'), className: 'status-chip--in-stock' }
      }
      if (status === 'RESERVED') {
        return { label: this.$t('view.stock.product.reserved'), className: 'status-chip--reserved' }
      }
      if (status === 'SOLD') {
        return { label: this.$t('view.stock.product.sold'), className: 'status-chip--sold' }
      }
      return null
    }
  },

  watch: {
    '$route.params.stockNumber'() {
      this.loadItem()
    }
  },

  created() {
    this.masterStore.fetchGold()
    this.masterStore.fetchProductType()
    this.loadItem()
  },

  methods: {
    formatDecimal,
    formatDate,

    async loadItem() {
      const res = await this.productStore.fetchDataGet({
        formValue: { stockNumber: this.stockNumber },
        skipError: true
      })
      if (!res) {
        this.item = null
        this.notFound = true
        return
      }
      this.notFound = false
      this.item = res
      await mergeBalanceIntoItems([this.item], { balanceStore: this.balanceStore, locationStore: this.locationStore })
    },

    goBack() {
      if (window.history.state && window.history.state.back) {
        this.$router.back()
      } else {
        this.$router.push({ name: 'stock-product-list' })
      }
    },

    onCloseModal(action) {
      this.isShow = { ...interfaceShow }
      if (action === 'fetch') {
        this.loadItem()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-top {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: var(--sp-lg);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

.detail-bottom {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--sp-lg);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

.image-box {
  display: flex;
  justify-content: center;
  align-items: center;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--sp-sm) var(--sp-lg);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

.detail-field {
  display: flex;
  flex-direction: column;
  gap: var(--sp-xs);

  &--full {
    grid-column: 1 / -1;
  }
}

.detail-label {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  font-weight: 400;
}

.detail-value {
  font-size: var(--fs-base);
  font-weight: 600;

  &--strong {
    font-weight: 700;
    color: var(--base-font-color);
  }
}

.status-chip {
  display: inline-flex;
  padding: var(--sp-xs) var(--sp-sm);
  border-radius: var(--radius-md);
  font-size: var(--fs-sm);
  font-weight: 600;

  &--in-stock {
    background: var(--color-green-bg);
    color: var(--base-green);
  }

  &--reserved {
    background: var(--base-warning);
    color: var(--base-sub-color);
  }

  &--sold {
    background: var(--color-border);
    color: var(--base-sub-color);
  }
}

.not-found-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-md);
  padding: var(--sp-2xl) 0;
  text-align: center;
}
</style>
