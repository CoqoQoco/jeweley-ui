<template>
  <modal :showModal="isShowModal" @closeModal="closeModal" width="1100px">
    <template #title>
      <span class="title-text-lg px-3 pt-2 d-block">{{ $t('view.production.planCreate.selectPrePlanTitle') }}</span>
    </template>
    <template #content>
      <div class="p-3">
        <div class="d-flex mb-3">
          <input
            type="text"
            class="form-control"
            v-model="search.moldCode"
            :placeholder="$t('view.production.planCreate.prePlanPlaceholderMold')"
            style="max-width: 280px"
            @keyup.enter="onSearch"
          />
          <button class="btn btn-main btn-sm btn-input-group ml-1 mt-1" type="button" @click="onSearch">
            <i class="bi bi-search"></i>
          </button>
        </div>

        <BaseDataTable
          :items="items"
          :totalRecords="items.length"
          :columns="columns"
          :perPage="10"
          :paginator="true"
        >
          <template #actionTemplate="{ data }">
            <button class="btn btn-sm btn-main" type="button" @click="onSelect(data)">
              <i class="bi bi-check"></i> {{ $t('common.btn.select') }}
            </button>
          </template>

          <template #moldImageTemplate="{ data }">
            <imagePreview
              v-if="data.moldCode"
              :imageName="data.moldCode"
              type="MOLD"
              :width="50"
              :height="50"
            />
          </template>

          <template #productTypeTemplate="{ data }">
            <span>{{ getDesc(masterStore.productTypes, data.productType) }}</span>
          </template>

          <template #deliveryDateTemplate="{ data }">
            <span>{{ formatDate(data.deliveryDate) }}</span>
          </template>
        </BaseDataTable>
      </div>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import { usePrePlanStore } from '@/stores/modules/api/production/pre-plan-store.js'
import { useMasterPrePlanStore } from '@/stores/modules/api/master/master-pre-plan-store.js'
import { formatDate } from '@/services/utils/dayjs.js'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))
const imagePreview = defineAsyncComponent(() => import('@/components/prime-vue/ImagePreview.vue'))

export default {
  name: 'SelectPrePlanItemModal',

  components: { modal, BaseDataTable, imagePreview },

  props: {
    isShowModal: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['closeModal', 'select'],

  setup() {
    const prePlanStore = usePrePlanStore()
    const masterStore = useMasterPrePlanStore()
    return { prePlanStore, masterStore }
  },

  data() {
    return {
      search: {
        moldCode: '',
      },
      items: [],
    }
  },

  computed: {
    columns() {
      return [
        { field: 'action', header: '', width: '90px', sortable: false, align: 'center' },
        { field: 'moldImage', header: this.$t('view.production.planCreate.prePlanColImage'), width: '70px', sortable: false, align: 'center' },
        { field: 'orderNo', header: this.$t('view.production.planCreate.prePlanColOrderNo'), minWidth: '140px' },
        { field: 'moldCode', header: this.$t('view.production.planCreate.prePlanColMoldCode'), minWidth: '130px' },
        { field: 'productType', header: this.$t('view.production.planCreate.prePlanColProductType'), minWidth: '130px' },
        { field: 'productQty', header: this.$t('view.production.planCreate.prePlanColQty'), minWidth: '80px', align: 'center' },
        { field: 'deliveryDate', header: this.$t('view.production.planCreate.prePlanColDeliveryDate'), minWidth: '110px', sortable: false },
      ]
    }
  },

  watch: {
    async isShowModal(val) {
      if (val) {
        await this.masterStore.fetchAll()
        await this.loadData()
      }
    },
  },

  methods: {
    getDesc(list, code) {
      if (!code) return '-'
      if (typeof code === 'object') return code.description || code.code || '-'
      const found = (list || []).find((x) => x.code === code)
      return found?.description || code
    },

    async loadData() {
      const res = await this.prePlanStore.getAvailableForPlan(this.search.moldCode || undefined)
      if (res) {
        this.items = Array.isArray(res) ? res : res.data || []
      }
    },

    async onSearch() {
      await this.loadData()
    },

    onSelect(item) {
      this.$emit('select', item)
      this.closeModal()
    },

    closeModal() {
      this.$emit('closeModal')
    },

    formatDate,
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';
</style>
