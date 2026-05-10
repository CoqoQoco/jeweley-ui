<template>
  <modal :showModal="isShowModal" @closeModal="closeModal" width="1100px">
    <template #title>
      <span class="title-text-lg px-3 pt-2 d-block">เลือกใบสั่งผลิต (Pre-Plan) เพื่อสร้างแผน</span>
    </template>
    <template #content>
      <div class="p-3">
        <div class="d-flex mb-3">
          <input
            type="text"
            class="form-control"
            v-model="search.moldCode"
            placeholder="รหัสแม่พิมพ์ (ไม่บังคับ)"
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
              <i class="bi bi-check"></i> เลือก
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

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))
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
      columns: [
        { field: 'action', header: '', width: '90px', sortable: false, align: 'center' },
        { field: 'moldImage', header: 'รูป', width: '70px', sortable: false, align: 'center' },
        { field: 'orderNo', header: 'เลขที่ใบสั่ง', minWidth: '140px' },
        { field: 'moldCode', header: 'รหัสแม่พิมพ์', minWidth: '130px' },
        { field: 'productType', header: 'ประเภทสินค้า', minWidth: '130px' },
        { field: 'productQty', header: 'จำนวน', minWidth: '80px', align: 'center' },
        { field: 'deliveryDate', header: 'วันที่ส่ง', minWidth: '110px', sortable: false },
      ],
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
