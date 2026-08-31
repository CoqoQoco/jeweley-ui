<template>
  <SectionCardGeneric headerStyle="legend" icon="bi-gem" accent="main" :title="$t('view.production.planGold.subHeaderReturnBody')" class="mt-4">
    <div class="table-toolbar">
      <ButtonGeneric
        variant="main"
        type="button"
        icon="bi-plus-square-fill"
        :label="$t('common.btn.add')"
        @click="addItems"
      />
    </div>

    <!-- eslint-disable-next-line no-restricted-imports -- DataTable + ColumnGroup + always-editable cells exception, see native-call-policy skill -->
    <DataTable
      class="p-datatable-sm"
      showGridlines
      dataKey="id"
      :value="items"
      scrollable
      resizableColumns
      :pt="{ table: { style: 'min-width: calc(var(--sp-2xl) * 33)' } }"
    >
      <ColumnGroup type="header">
        <Row>
          <Column header=""></Column>
          <Column :header="$t('view.production.planGold.colWoBody')"></Column>
          <Column :header="$t('view.production.planGold.colReturnQty')"></Column>
          <Column :header="$t('view.production.planGold.colReturnWeight')"></Column>
          <Column :header="$t('view.production.planGold.colRemark')"></Column>
        </Row>
      </ColumnGroup>

      <template #empty>
        <div class="empty-return-body">{{ $t('view.production.planGold.emptyReturnBody') }}</div>
      </template>

      <Column style="width: var(--sp-2xl)">
        <template #body="{ data }">
          <ButtonGeneric variant="red" type="button" icon="bi-trash-fill" class="w-100" @click="onDelItem(data)" />
        </template>
      </Column>

      <Column field="productionPlan" style="min-width: calc(var(--sp-2xl) * 6)">
        <template #body="{ data }">
          <AutoCompleteGeneric
            :modelValue="data.productionPlan"
            :suggestions="productItemSearch"
            optionLabel="woText"
            :aria-label="$t('view.production.planGold.colWoBody')"
            :placeholder="$t('view.production.planGold.placeholderWoBody')"
            :forceSelection="true"
            :minLength="2"
            @complete="onSearchProductionPlanId"
            @update:modelValue="onFieldUpdate(data.id, 'productionPlan', $event)"
          >
            <template #option="{ option }">
              <div class="wo-option">
                <div class="wo-option-main">{{ `${option.wo}-${option.woNumber}` }}</div>
                <div class="wo-option-meta">{{ option.statusName }} · {{ option.mold }}</div>
              </div>
            </template>
          </AutoCompleteGeneric>
        </template>
      </Column>

      <Column field="returnQTY" style="width: var(--sp-2xl)">
        <template #body="{ data }">
          <InputTextGeneric
            type="number"
            min="1"
            step="any"
            class="text-right"
            :aria-label="$t('view.production.planGold.colReturnQty')"
            :modelValue="data.returnQTY"
            @update:modelValue="onFieldUpdate(data.id, 'returnQTY', toNum($event))"
          />
        </template>
      </Column>

      <Column field="returnWeight" style="width: var(--sp-2xl)">
        <template #body="{ data }">
          <InputTextGeneric
            type="number"
            min="1"
            step="any"
            class="text-right"
            :aria-label="$t('view.production.planGold.colReturnWeight')"
            :modelValue="data.returnWeight"
            @update:modelValue="onFieldUpdate(data.id, 'returnWeight', toNum($event))"
          />
        </template>
      </Column>

      <Column field="remark" style="min-width: calc(var(--sp-2xl) * 6)">
        <template #body="{ data }">
          <InputTextGeneric
            type="text"
            :aria-label="$t('view.production.planGold.colRemark')"
            :modelValue="data.remark"
            @update:modelValue="onFieldUpdate(data.id, 'remark', $event)"
          />
        </template>
      </Column>

      <ColumnGroup type="footer">
        <Row>
          <Column :footer="$t('view.production.planGold.footerReturnWeight')" footerStyle="text-align:right" :colspan="3" />
          <Column :footer="fmt2(sumWeight)" footerStyle="text-align:right" />
          <Column />
        </Row>
      </ColumnGroup>
    </DataTable>
  </SectionCardGeneric>
</template>

<script>
// External dependencies
import api from '@/axios/axios-helper.js'
import { fmt2 } from '@/services/utils/gold-loss-tang-calc.js'
import { toNullableNumber } from '@/services/utils/decimal.js'
import { GOLD_SLIP_SELECTABLE_STATUSES } from '@/constants/production-plan-status.js'

// Local components
// eslint-disable-next-line no-restricted-imports -- DataTable+ColumnGroup exception, see native-call-policy skill
import DataTable from 'primevue/datatable'
// eslint-disable-next-line no-restricted-imports -- DataTable+ColumnGroup exception, see native-call-policy skill
import Column from 'primevue/column'
// eslint-disable-next-line no-restricted-imports -- DataTable+ColumnGroup exception, see native-call-policy skill
import Row from 'primevue/row'
// eslint-disable-next-line no-restricted-imports -- DataTable+ColumnGroup exception, see native-call-policy skill
import ColumnGroup from 'primevue/columngroup'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import AutoCompleteGeneric from '@/components/prime-vue/AutoCompleteGeneric.vue'

export default {
  name: 'BodyReturnTable',

  components: {
    DataTable,
    Column,
    Row,
    ColumnGroup,
    SectionCardGeneric,
    ButtonGeneric,
    InputTextGeneric,
    AutoCompleteGeneric
  },

  props: {
    items: {
      type: Array,
      default: () => []
    }
  },

  emits: ['update:items'],

  data() {
    return {
      productItemSearch: []
    }
  },

  computed: {
    sumWeight() {
      return this.items.reduce((sum, x) => sum + (parseFloat(x.returnWeight) || 0), 0)
    }
  },

  methods: {
    fmt2(val) {
      return fmt2(val)
    },
    toNum(val) {
      return toNullableNumber(val)
    },
    onFieldUpdate(id, field, value) {
      const newItems = this.items.map((x) => (x.id === id ? { ...x, [field]: value } : x))
      this.$emit('update:items', newItems)
    },
    addItems() {
      const nextId = this.items.reduce((max, x) => Math.max(max, x.id || 0), 0) + 1
      const newItems = [
        ...this.items,
        { id: nextId, productionPlan: null, returnQTY: 0, returnWeight: 0, remark: null }
      ]
      this.$emit('update:items', newItems)
    },
    onDelItem(item) {
      const newItems = this.items.filter((x) => x.id !== item.id)
      this.$emit('update:items', newItems)
    },
    async onSearchProductionPlanId(e) {
      const params = {
        take: 20,
        skip: 0,
        search: {
          text: e.query ?? null,
          status: GOLD_SLIP_SELECTABLE_STATUSES
        }
      }
      const res = await api.jewelry.post('ProductionPlan/ProductionPlanSearchByProductionPlanId', params)
      if (res) {
        this.productItemSearch = [...res.data]
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.table-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--sp-sm);
}

.empty-return-body {
  text-align: center;
  padding: var(--sp-md) 0;
  color: var(--base-sub-color);
}

.wo-option {
  display: flex;
  flex-direction: column;
  gap: var(--sp-xs);
}

.wo-option-main {
  font-weight: 600;
}

.wo-option-meta {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}
</style>
