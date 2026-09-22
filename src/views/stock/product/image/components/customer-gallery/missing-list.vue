<template>
  <div class="missing-list">
    <SearchBarGeneric
      :title="$t('view.stock.productGallery.missingListTitle')"
      :description="$t('view.stock.productGallery.missingListDesc')"
      @search="onSearch"
      @clear="onClear"
    >
      <template #fields>
        <div>
          <span class="title-text">{{ $t('view.stock.productGallery.missingSearchLabel') }}</span>
          <InputTextGeneric
            v-model="form.text"
            :trim="true"
            :bgInput="true"
            :placeholder="$t('view.stock.productGallery.missingSearchPlaceholder')"
          />
        </div>
        <div>
          <span class="title-text">{{ $t('view.stock.product.productType') }}</span>
          <MultiSelectGeneric
            v-model="form.productTypes"
            :options="productTypeOptions"
            optionLabel="description"
            optionValue="code"
            :placeholder="$t('view.stock.productGallery.missingProductTypePlaceholder')"
            :showClear="true"
          />
        </div>
      </template>

      <template #actions-right>
        <ButtonGeneric variant="main" icon="bi-search" type="submit" :title="$t('common.btn.search')" />
        <ButtonGeneric variant="dark" icon="bi-x-circle" class="ml-2" :title="$t('common.btn.clear')" @click="onClear" />
      </template>
    </SearchBarGeneric>

    <div v-if="summaryText" class="missing-list__summary">{{ summaryText }}</div>

    <BaseDataTable
      class="mt-2"
      :items="items"
      :totalRecords="total"
      dataKey="sampleStockNumber"
      :columns="columns"
      :perPage="take"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <template #internalImageTemplate="{ data }">
        <div class="missing-list__thumb">
          <ImagePreview v-if="data.internalImagePath" :imageName="data.internalImagePath" :width="40" :height="40" />
          <span class="missing-list__thumb-tag">{{ $t('view.stock.productGallery.colInternalImage') }}</span>
        </div>
      </template>

      <template #nameTemplate="{ data }">
        <div class="missing-list__name">
          <span class="missing-list__name-th">{{ data.productNameTh || '-' }}</span>
          <span v-if="data.productNameEn" class="missing-list__name-en">{{ data.productNameEn }}</span>
        </div>
      </template>

      <template #actionTemplate="{ data }">
        <ButtonGeneric variant="green" icon="bi-images" :label="$t('view.stock.productGallery.manageBtn')" @click="onManage(data)" />
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import ImagePreview from '@/components/prime-vue/ImagePreview.vue'

import dataTablePaging from '@/composables/useDataTablePaging.js'
import { formatNumber } from '@/services/utils/decimal.js'
import { useStockProductGalleryApiStore } from '@/stores/modules/api/stock/product-gallery-api.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

const interfaceForm = {
  text: '',
  productTypes: []
}

export default {
  name: 'MissingList',

  components: {
    SearchBarGeneric,
    InputTextGeneric,
    ButtonGeneric,
    MultiSelectGeneric,
    BaseDataTable,
    ImagePreview
  },

  mixins: [dataTablePaging],

  emits: ['manage'],

  setup() {
    const galleryStore = useStockProductGalleryApiStore()
    const masterApiStore = useMasterApiStore()
    return { galleryStore, masterApiStore }
  },

  data() {
    return {
      form: { ...interfaceForm },
      items: [],
      total: 0,
      // เก็บ response ทั้งก้อนไว้ใช้ res.summary (ยอดรวม backlog ทั้งหมด ไม่ใช่ตามหน้า) — ดู summaryText
      lastResponse: null
    }
  },

  computed: {
    productTypeOptions() {
      return this.masterApiStore.productType
    },

    isFilterActive() {
      return !!this.form.text || this.form.productTypes.length > 0
    },

    // res.summary คำนวณจาก backlog ทั้งหมดที่ยังไม่กรอง (ไม่ใช่ total ที่เป็นจำนวนแถวหลังกรอง) — ไม่มี summary
    // (เช่น backend เก่า) ก็ไม่แสดงบรรทัดนี้เฉยๆ
    summaryText() {
      const summary = this.lastResponse?.summary
      if (!summary || typeof summary.moldCount !== 'number' || typeof summary.missingPieceCount !== 'number') {
        return ''
      }

      let text = this.$t('view.stock.productGallery.missingSummary', {
        molds: formatNumber(summary.moldCount, 0),
        pieces: formatNumber(summary.missingPieceCount, 0)
      })

      if (this.isFilterActive && this.total !== summary.moldCount) {
        text += ` ${this.$t('view.stock.productGallery.missingSummaryFiltered', { count: formatNumber(this.total, 0) })}`
      }

      return text
    },

    columns() {
      return [
        {
          field: 'internalImage',
          header: '',
          minWidth: '80px',
          sortable: false,
          align: 'center'
        },
        {
          field: 'mold',
          header: this.$t('view.stock.productGallery.colMold'),
          sortable: true,
          minWidth: '140px'
        },
        {
          field: 'name',
          header: this.$t('view.stock.productGallery.colName'),
          sortable: false,
          minWidth: '220px'
        },
        {
          field: 'productTypeName',
          header: this.$t('view.stock.productGallery.colType'),
          sortable: true,
          minWidth: '120px'
        },
        {
          field: 'missingPieceCount',
          header: this.$t('view.stock.productGallery.colMissingPieces'),
          sortable: true,
          minWidth: '100px',
          align: 'right',
          format: 'number'
        },
        {
          field: 'inStockPieceCount',
          header: this.$t('view.stock.productGallery.colInStockPieces'),
          sortable: true,
          minWidth: '100px',
          align: 'right',
          format: 'number'
        },
        {
          field: 'action',
          header: '',
          minWidth: '150px',
          sortable: false,
          align: 'center'
        }
      ]
    }
  },

  methods: {
    async fetchData() {
      const res = await this.galleryStore.fetchMissingList({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        search: {
          text: this.form.text || undefined,
          productTypes: this.form.productTypes.length ? this.form.productTypes : undefined
        },
        skipLoading: true
      })

      if (res) {
        this.items = res.data || []
        this.total = res.total || 0
        this.lastResponse = res
      }
    },

    onSearch() {
      this.resetPaging()
    },

    onClear() {
      this.form = { ...interfaceForm }
      this.resetPaging()
    },

    onManage(row) {
      this.$emit('manage', row)
    }
  },

  created() {
    if (!this.masterApiStore.productType.length) this.masterApiStore.fetchProductType()
    this.fetchData()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';

.missing-list__summary {
  font-size: var(--fs-base);
  font-weight: 600;
  color: var(--base-font-color);
  margin-top: var(--sp-md);
}

.missing-list__thumb {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.missing-list__thumb-tag {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.missing-list__name {
  display: flex;
  flex-direction: column;
}

.missing-list__name-en {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}
</style>
