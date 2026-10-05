<!--
  materials-gem-low-cover-panel — ตาราง "พลอยใกล้หมดเทียบการใช้งาน" (reportRef: matLowCover) ของหมวด
  "วัตถุดิบที่กระทบการผลิต" — เรียก ProductionInsight/MaterialGemLowCover (DataSourceRequest + coverDays) —
  ไม่มี start/end — coverDays เป็น local number filter ของกล่องนี้เอง (default 30 วัน ตามที่สั่ง) — item เป็น
  stock lot/batch (code/groupName) ไม่ใช่ gem-type code แบบ 2 ตารางอื่นในหมวดนี้ จึงไม่ resolve ผ่าน gem master
  (โชว์ตรงๆ ตามที่ backend ส่งมา)
-->
<template>
  <div id="insight-report-matLowCover" class="materials-gem-low-cover-panel">
    <SectionCardGeneric :title="$t('view.productionInsight.materials.lowCoverTitle')" icon="bi-exclamation-circle" accent="warning" headerStyle="legend">
      <div class="materials-gem-low-cover-panel__toolbar">
        <FormFieldGeneric :label="$t('view.productionInsight.materials.lowCoverFilterDays')" class="materials-gem-low-cover-panel__filter">
          <InputTextGeneric v-model.number="coverDays" type="number" :min="1" />
        </FormFieldGeneric>
      </div>

      <div class="responsive-table-wrapper">
        <BaseDataTable
          :items="items"
          :totalRecords="total"
          :columns="columns"
          :perPage="take"
          dataKey="code"
          @page="handlePageChange"
          @sort="handleSortChange"
        >
          <template #quantityTemplate="{ data }">
            <div class="text-right">{{ formatCount(data.quantity) }}</div>
          </template>
          <template #used90dTemplate="{ data }">
            <div class="text-right">{{ formatCount(data.used90d) }}</div>
          </template>
          <template #coverDaysTemplate="{ data }">
            <div class="text-right materials-gem-low-cover-panel__cover">{{ data.coverDays != null ? formatCount(data.coverDays) : '—' }}</div>
          </template>
        </BaseDataTable>
      </div>
    </SectionCardGeneric>
  </div>
</template>

<script>
import { useProductionInsightApiStore } from '@/stores/modules/api/production/production-insight-api.js'
import dataTablePaging from '@/composables/useDataTablePaging.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

const DEFAULT_COVER_DAYS = 30

export default {
  name: 'MaterialsGemLowCoverPanel',

  mixins: [dataTablePaging],

  components: {
    SectionCardGeneric,
    FormFieldGeneric,
    InputTextGeneric,
    BaseDataTable
  },

  setup() {
    const productionInsightStore = useProductionInsightApiStore()
    return { productionInsightStore }
  },

  data() {
    return {
      items: [],
      total: 0,
      coverDays: DEFAULT_COVER_DAYS
    }
  },

  computed: {
    columns() {
      return [
        { field: 'code', header: this.$t('view.productionInsight.materials.lowCoverColCode'), sortable: false, minWidth: '110px' },
        { field: 'groupName', header: this.$t('view.productionInsight.materials.lowCoverColGroup'), sortable: false, minWidth: '140px' },
        { field: 'shape', header: this.$t('view.productionInsight.materials.lowCoverColShape'), sortable: false, minWidth: '90px' },
        { field: 'size', header: this.$t('view.productionInsight.materials.lowCoverColSize'), sortable: false, minWidth: '80px' },
        { field: 'grade', header: this.$t('view.productionInsight.materials.lowCoverColGrade'), sortable: false, minWidth: '80px' },
        { field: 'quantity', header: this.$t('view.productionInsight.materials.lowCoverColQuantity'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'used90d', header: this.$t('view.productionInsight.materials.lowCoverColUsed90d'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'coverDays', header: this.$t('view.productionInsight.materials.lowCoverColCoverDays'), sortable: false, minWidth: '90px', align: 'right' }
      ]
    }
  },

  watch: {
    coverDays() {
      this.resetPaging()
    }
  },

  methods: {
    formatCount(value) {
      return value != null ? new Intl.NumberFormat('th-TH').format(value) : '—'
    },

    async fetchData() {
      const res = await this.productionInsightStore.fetchMaterialGemLowCover({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        coverDays: this.coverDays || DEFAULT_COVER_DAYS
      })
      this.items = res?.data || []
      this.total = res?.total || 0
    }
  },

  mounted() {
    this.fetchData()
  }
}
</script>

<style lang="scss" scoped>
.materials-gem-low-cover-panel {
  scroll-margin-top: calc(var(--mainbar-height) + 64px);
  min-width: 0;
}

.materials-gem-low-cover-panel__toolbar {
  margin-bottom: var(--sp-lg);
}

.materials-gem-low-cover-panel__filter {
  max-width: 200px;
}

.materials-gem-low-cover-panel__cover {
  color: var(--base-warning);
  font-weight: 700;
}
</style>
