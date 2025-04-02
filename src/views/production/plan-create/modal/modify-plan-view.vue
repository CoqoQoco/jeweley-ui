<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal">
      <template v-slot:content>
        <div class="title-text-lg-bg">
          <span><i class="bi bi-collection mr-2"></i></span>
          <span>ค้นหาใบจา่ย-รับคืน | ระบุเเม่พิมพ์เพื่อสร้างเเบบงาน</span>
        </div>

        <div>
          <form @submit.prevent="handleSubmit">
            <div class="form-col-sm-container p-2">
              <div class="d-flex">
                <AutoComplete
                  v-model="search.mold"
                  :suggestions="moldItemSearch"
                  @complete="onSearchMold"
                  placeholder="พิมพ์รหัสเเม่พิมพ์ที่ต้องการค้นหา"
                  :class="val.isValMold === true ? `p-invalid` : ``"
                  forceSelection
                  @change="clearDataSearch"
                />
                <button type="submit" class="btn btn-main btn-sm btn-input-group ml-1">
                  <span class="bi bi-search"></span>
                </button>
              </div>
              <div></div>
              <div></div>
            </div>
          </form>
        </div>

        <div class="pb-2">
          <BaseDataTable
            :items="dataSearch.data"
            :totalRecords="dataSearch.total"
            :columns="columns"
            :perPage="take"
            @page="handlePageChange"
            @sort="handleSortChange"
          >
            <template #actionTemplate="{ data }">
              <div class="btn-action-container">
                <button class="btn btn-sm btn btn-dark mr-2" @click="modifyPlan(data)">
                  <i class="bi bi-collection"></i>
                  <span class="ml-1">เลือกเเบบงาน</span>
                </button>
                <button class="btn btn-sm btn btn-green" @click="viewplan(data)">
                  <i class="bi bi-search"></i>
                </button>
                <!-- <button class="ml-1 btn btn-sm btn btn-dark" title="โหมดดูรายละเอียด">
              <i class="bi bi-clipboard2-data-fill"></i>
            </button> -->
              </div>
            </template>

            <!-- Image Column -->
            <template #imageTemplate="{ data }">
              <div class="image-container">
                <div>
                  <imagePreview :imageName="data.mold" :type="mold" :width="25" :height="25" />
                </div>
                <div v-if="data.moldSub" class="ml-2">
                  <imagePreview :imageName="data.moldSub" :type="mold" :width="25" :height="25" />
                </div>
              </div>
            </template>

            <!-- Status Column -->
            <template #statusTemplate="{ data }">
              <div style="width: 150px" :class="getStatusSeverity(data.status)">
                {{ data.statusName }}
              </div>
            </template>

            <!-- WO Column -->
            <template #woTextTemplate="{ data }">
              {{ `${data.wo}-${data.woNumber}` }}
            </template>
          </BaseDataTable>
        </div>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))
const imagePreview = defineAsyncComponent(() => import('@/components/prime-vue/ImagePreview.vue'))

import AutoComplete from 'primevue/autocomplete'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

import { useLoadingStore } from '@/stores/modules/master/loading-store.js'
import { usePlanSearchApiStore } from '@/stores/modules/api/plan-search-store.js'
import api from '@/axios/axios-helper.js'

const interfaceSearch = {
  mold: null
}
const interfaceValid = {
  isValMold: false
}

export default {
  name: 'ModifyPlanView',
  components: {
    modal,
    AutoComplete,
    BaseDataTable,
    imagePreview
  },

  setup() {
    const planSearchStore = usePlanSearchApiStore()
    const loadingStore = useLoadingStore()
    return { planSearchStore, loadingStore }
  },

  props: {
    isShow: {
      type: Boolean,
      required: true,
      default: false
    }
  },

  watch: {
    isShow: {
      handler(val) {
        //console.log('isShow', val)
        this.isShowModal = val
      },
      immediate: true
    },
    'search.mold'() {
      if (this.search.mold) {
        this.val.isValMold = false
      }
    }
  },

  data() {
    return {
      isShowModal: false,

      search: {
        ...interfaceSearch
      },
      val: {
        ...interfaceValid
      },

      moldItemSearch: [],

      dataSearch: {},
      take: 10,
      skip: 0,
      sort: [],
      mold: 'MOLD',

      // Columns Configuration
      columns: [
        {
          field: 'action',
          header: '',
          minWidth: '50px',
          sortable: false,
          align: 'center',
          bodyTemplate: 'actionTemplate'
        },
        // {
        //   field: 'image',
        //   header: '',
        //   minWidth: '50px',
        //   sortable: false,
        //   align: 'center'
        // },
        {
          field: 'woText',
          header: 'W.O.',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'mold',
          header: 'เเม่พิมพ์',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'status',
          header: 'สถานะใบงาน',
          sortable: true,
          minWidth: '150px',
          align: 'center'
        },
        {
          field: 'lastUpdateStatus',
          header: 'สถานะใบงาน (วันที่)',
          sortable: true,
          minWidth: '150px',
          format: 'datetime'
        },
        {
          field: 'productNumber',
          header: 'รหัสสินค้า',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productTypeName',
          header: 'ประเภทสินค้า',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productQty',
          header: 'จำนวนสินค้า',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'gold',
          header: 'สีของทอง/เงิน',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'goldSize',
          header: 'ประเภททอง/เงิน',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'customerNumber',
          header: 'รหัสลูกค้า',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'customerName',
          header: 'ชื่อลูกค้า',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'customerTypeName',
          header: 'ประเภทลูกค้า',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'createDate',
          header: 'วันสร้างใบสินค้า',
          sortable: true,
          minWidth: '150px',
          format: 'date'
        }
      ]
    }
  },
  methods: {
    onClear() {
      this.search = {
        ...interfaceSearch
      }
      this.dataSearch = {}
    },
    closeModal() {
      this.$emit('closeModal')
      this.onClear()
    },

    clearDataSearch() {
      this.dataSearch = {}
    },

    getBgColor(data) {
      if (data) {
        return 'background-color: #b5dad4'
      } else {
        return 'background-color: #dad4b5'
      }
    },
    // handle page
    getStatusSeverity(status) {
      switch (status) {
        case 9999:
          return 'box-status-process'
        case 500:
          return 'box-status-disable'
        case 100:
        case 95:
          return 'box-status-success'
        case 10:
          return 'box-status-process'
        case 49:
        case 54:
        case 59:
        case 69:
        case 79:
        case 84:
        case 89:
        case 94:
          return 'box-status-process'
        case 50:
        case 55:
        case 60:
        case 70:
        case 80:
        case 85:
        case 90:
          return 'box-status-show'
      }
    },

    viewplan(item) {
      console.log('viewplan', item)
      const id = item.id
      window.open(`/plan-order-tracking-update/${id}`, '_blank')
      //this.$router.push({ name: 'plan-order-tracking-detail', params: { id: 123 } })
    },

    validateForm() {
      if (!this.search.mold) {
        this.val = {
          isValMold: true
        }
        return false
      }

      return true
    },

    // ----- data table hnadle
    handlePageChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.handleSubmit()
    },
    handleSortChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.sort = e.multiSortMeta.map((item) => ({
        field: item.field,
        dir: item.order === 1 ? 'asc' : 'desc'
      }))
      this.handleSubmit()
    },
    async handleSubmit() {
      if (this.validateForm()) {
        this.dataSearch = await this.planSearchStore.SearchData({
          take: this.take,
          skip: this.skip,
          sort: this.sort,
          formValue: this.search
        })

        //console.log('dataSearch', this.dataSearch)
      }
    },

    async onSearchMold(e) {
      try {
        //this.isLoading = true

        const param = {
          take: 0,
          skip: 0,
          search: {
            text: e.query ?? null
          }
        }

        const res = await api.jewelry.post('Mold/SearchMold', param, { skipLoading: true })
        if (res) {
          this.moldItemSearch = res.data.map((x) => `${x.code}`)
        }
      } catch (error) {
        console.log(error)
      }
    },

    async modifyPlan(data) {
      //console.log('modifyPlan', data)
      this.loadingStore.showLoading()

      const modifyData = {
        data: { ...data },
        header: {},
        headerMat: []
      }

      const id = {
        id: data.id
      }
      //   const planNumber = {
      //     take: 0,
      //     skip: 0,
      //     sort: [],
      //     search: {
      //       ProductionPlanNumber: `${data.wo}-${data.woNumber}`
      //     }
      //   }

      const header = await api.jewelry.get('ProductionPlan/ProductionPlanGet', id, {
        skipLoading: true
      })
      const headerMat = await api.jewelry.post('ProductionPlan/ProductionPlanMateriaGet', id, {
        skipLoading: true
      })
      //   const headerMatGoldCostItem = await api.jewelry.post(
      //     'ProductionPlanCost/ListGoldCostItem',
      //     planNumber,
      //     { skipLoading: true }
      //   )

      if (header) {
        modifyData.header = { ...header }
      }
      if (headerMat) {
        modifyData.headerMat = [...headerMat]
      }
      //   if (headerMatGoldCostItem) {
      //     modifyData.headerMatGoldCostItem = [...headerMatGoldCostItem.data]
      //   }

      //console.log('modifyData', modifyData)
      this.$emit('modifyPlan', modifyData)
      this.onClear()
      //this.loadingStore.hideLoading()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form';

.btn-input-group {
  height: 35px;
  padding: 6px 12px;
  margin-top: 5px !important;
}
.image-container {
  display: flex;
  justify-content: start;
  align-items: center;
  margin-left: 4px;
}
</style>
