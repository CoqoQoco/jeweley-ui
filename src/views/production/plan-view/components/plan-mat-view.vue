<template>
  <div>
    <div class="filter-container-highlight">
      <div class="d-flex justify-content-between">
        <div class="title-text-white vertical-center-container">
          <span class="bi bi-list-check mr-2"></span>
          <span>{{ $t('view.production.planView.matSectionTitle') }}</span>
        </div>
        <div>
          <div class="btn-add" :title="$t('common.btn.add')" type="button" @click="onShowFormMaterialUpdate">
            <span class="bi bi-plus"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- plan gold -->
    <div>
      <BaseDataTable
        :items="modelMatValue"
        :columns="matColumns"
        :paginator="false"
        :showGridlines="true"
        :totalRecords="modelMatValue.length"
      >
        <template #actionTemplate="{ data }">
          <button
            class="btn btn-sm btn-red"
            :title="$t('common.btn.delete')"
            type="button"
            @click="onDeletItem(data)"
          >
            <i class="bi bi-trash-fill"></i>
          </button>
        </template>
        <template #goldNavigationTemplate="{ data }">
          <div v-if="data.goldNavigation?.code">
            {{ `${data.goldNavigation?.code}: ${data.goldNavigation?.nameTh}` }}
          </div>
          <div v-else>-</div>
        </template>
        <template #goldSizeNavigationTemplate="{ data }">
          <div v-if="data.goldSizeNavigation?.code">
            {{ `${data.goldSizeNavigation?.nameTh}` }}
          </div>
          <div v-else>-</div>
        </template>
        <template #goldQtyTemplate="{ data }">
          {{ `${data.goldQty ?? '-'}` }}
        </template>
        <template #gemNavigationTemplate="{ data }">
          <div v-if="data.gemNavigation?.code">
            {{ `${data.gemNavigation?.code}: ${data.gemNavigation?.nameTh}` }}
          </div>
          <div v-else>-</div>
        </template>
        <template #gemShapeNavigationTemplate="{ data }">
          <div v-if="data.gemShapeNavigation?.code">
            {{ `${data.gemShapeNavigation?.code}: ${data.gemShapeNavigation?.nameTh} ${data.gemSize ?? ''}` }}
          </div>
          <div v-else>-</div>
        </template>
        <template #gemQtyTemplate="{ data }">
          {{ `${data.gemQty ?? '-'} ${data.gemQty ? data.gemUnit : ''}` }}
        </template>
        <template #gemWeightTemplate="{ data }">
          {{ `${data.gemWeight ?? '-'} ${data.gemWeight ? data.gemWeightUnit : ''}` }}
        </template>
        <template #diamondQtyTemplate="{ data }">
          {{ `${data.diamondQty ?? '-'} ${data.diamondQty ? data.diamondUnit : ''}` }}
        </template>
        <template #diamondWeightTemplate="{ data }">
          {{ `${data.diamondWeight ?? '-'} ${data.diamondWeight ? data.diamondWeightUnit : ''}` }}
        </template>
        <template #diamondSizeTemplate="{ data }">
          {{ `${data.diamondSize ?? '-'}` }}
        </template>
        <template #diamondQualityTemplate="{ data }">
          {{ `${data.diamondQuality ?? '-'}` }}
        </template>
      </BaseDataTable>
    </div>

    <div class="filter-container-highlight mt-3">
      <div class="d-flex justify-content-between">
        <div class="title-text-white vertical-center-container">
          <span class="bi bi-list-check mr-2"></span>
          <span>{{ $t('view.production.planView.goldRequestSectionTitle') }}</span>
        </div>
      </div>
    </div>

    <!-- plan cost gold -->
    <div>
      <BaseDataTable
        :items="modelGold"
        :columns="goldColumns"
        :paginator="false"
        :showGridlines="true"
        :totalRecords="modelGold.length"
      >
        <template #goldCodeTemplate="{ data }">
          <div v-if="data.goldCode">
            {{ `${data.goldCode}: ${data.goldName}` }}
          </div>
          <div v-else>-</div>
        </template>
        <template #assignDateTemplate="{ data }">
          <span>{{ formatDate(data.assignDate) }}</span>
        </template>
      </BaseDataTable>
    </div>

    <!-- plan gold history -->
    <div class="mt-3">
      <planOverview :modelValue="modelHerder"></planOverview>
    </div>
  </div>
</template>

<script>
import { confirmSubmit, success } from '@/services/alert/sweetAlerts.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'
import api from '@/axios/axios-helper.js'

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import planOverview from './plan-overview.vue'

export default {
  components: {
    BaseDataTable,
    planOverview
  },
  props: {
    modelValue: {
      type: Object,
      required: true,
      default: () => {}
    },
    modelMatValue: {
      type: Array,
      required: true,
      default: () => []
    },
    modelGoldItem: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  computed: {
    modelGold() {
      return this.modelGoldItem
    },
    modelHerder() {
      return this.modelValue
    },
    matColumns() {
      return [
        { field: 'action', header: '', minWidth: '60px', sortable: false },
        { field: 'goldNavigation', header: this.$t('view.production.planView.colGoldType'), minWidth: '120px', sortable: false },
        { field: 'goldSizeNavigation', header: this.$t('view.production.planView.colGoldPercent'), minWidth: '100px', sortable: false },
        { field: 'goldQty', header: this.$t('view.production.planView.colGoldQty'), minWidth: '80px', sortable: false },
        { field: 'gemNavigation', header: this.$t('view.production.planView.colGemType'), minWidth: '120px', sortable: false },
        { field: 'gemShapeNavigation', header: this.$t('view.production.planView.colGemShape'), minWidth: '150px', sortable: false },
        { field: 'gemQty', header: this.$t('view.production.planView.colGemQty'), minWidth: '100px', sortable: false },
        { field: 'gemWeight', header: this.$t('view.production.planView.colGemWeight'), minWidth: '100px', sortable: false },
        { field: 'diamondQty', header: this.$t('view.production.planView.colDiamondQty'), minWidth: '100px', sortable: false },
        { field: 'diamondWeight', header: this.$t('view.production.planView.colDiamondWeight'), minWidth: '100px', sortable: false },
        { field: 'diamondSize', header: this.$t('view.production.planView.colDiamondSize'), minWidth: '80px', sortable: false },
        { field: 'diamondQuality', header: this.$t('view.production.planView.colDiamondQuality'), minWidth: '100px', sortable: false }
      ]
    },
    goldColumns() {
      return [
        { field: 'goldCode', header: this.$t('view.production.planView.colGoldType'), minWidth: '120px', sortable: false },
        { field: 'goldSizeName', header: this.$t('view.production.planView.colGoldPercent'), minWidth: '100px', sortable: false },
        { field: 'goldReceipt', header: this.$t('view.production.planView.colGoldReceipt'), minWidth: '100px', sortable: false },
        { field: 'bookNo', header: this.$t('view.production.planView.colBookNo'), minWidth: '80px', sortable: false },
        { field: 'no', header: this.$t('common.field.code'), minWidth: '80px', sortable: false },
        { field: 'cost', header: this.$t('common.field.price'), minWidth: '80px', sortable: false },
        { field: 'assignDate', header: this.$t('view.production.planView.colAssignDate'), minWidth: '150px', sortable: false }
      ]
    }
  },

  data() {
    return {
      mat: []
    }
  },
  methods: {
    onDeletItem(item) {
      confirmSubmit(
        `${item.goldNavigation.code}-${item.goldNavigation.nameTh}, จำนวน ${item.goldQty ?? 0}`,
        'ยืนยันลบ',
        async () => {
          await this.DeletMatItem(item)
        }
      )
    },
    onShowFormMaterialUpdate() {
      this.$emit('onShowFormMaterialUpdate')
    },
    async DeletMatItem(item) {
      const params = {
        planId: this.modelValue.id,
        wo: this.modelValue.wo,
        woNumber: this.modelValue.woNumber,
        materialId: item.id
      }

      const res = await api.jewelry.post('ProductionPlan/ProductionPlanDeleteMaterial', params)
      if (res) {
        success(``, '', async () => {
          this.$emit('fetch')
        })
      }
    },

    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return formatDate(date)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
@import '@/assets/scss/custom-style/standard-form.scss';

.btn-add {
  display: grid;
  place-items: center;
  background-color: white;
  width: 20px;
}
</style>
