<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal">
      <template v-slot:content>
        <div class="title-text-lg-bg">
          <span><i class="bi bi-collection mr-2"></i></span>
          <span>{{ $t('view.production.planCreate.modifyPlanSearchTitle') }}</span>
        </div>

        <div>
          <form @submit.prevent="handleSubmit">
            <div class="form-col-sm-container p-2">
              <div class="d-flex">
                <AutoCompleteGeneric
                  v-model="search.mold"
                  :suggestions="moldItemSearch"
                  @complete="onSearchMold"
                  :placeholder="$t('view.production.planCreate.modifyPlanPlaceholder')"
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
                  <span class="ml-1">{{ $t('view.production.planCreate.btnSelectStyle') }}</span>
                </button>
                <button class="btn btn-sm btn btn-green" @click="viewplan(data)">
                  <i class="bi bi-search"></i>
                </button>
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

import dataTablePaging from '@/composables/useDataTablePaging.js'
import { useLoadingStore } from '@/stores/modules/master/loading-store.js'
import { usePlanSearchApiStore } from '@/stores/modules/api/plan-search-store.js'
import api from '@/axios/axios-helper.js'

import AutoCompleteGeneric from '@/components/prime-vue/AutoCompleteGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))
const imagePreview = defineAsyncComponent(() => import('@/components/prime-vue/ImagePreview.vue'))

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
    AutoCompleteGeneric,
    BaseDataTable,
    imagePreview
  },

  mixins: [dataTablePaging],

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
      mold: 'MOLD'
    }
  },

  computed: {
    columns() {
      return [
        {
          field: 'action',
          header: '',
          minWidth: '50px',
          sortable: false,
          align: 'center',
          bodyTemplate: 'actionTemplate'
        },
        {
          field: 'woText',
          header: this.$t('view.production.planCreate.colWo'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'mold',
          header: this.$t('view.production.planCreate.colMold'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'status',
          header: this.$t('view.production.planCreate.colPlanStatus'),
          sortable: true,
          minWidth: '150px',
          align: 'center'
        },
        {
          field: 'lastUpdateStatus',
          header: this.$t('view.production.planCreate.colPlanStatusDate'),
          sortable: true,
          minWidth: '150px',
          format: 'datetime'
        },
        {
          field: 'productNumber',
          header: this.$t('view.production.planCreate.colProductCode'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productTypeName',
          header: this.$t('view.production.planCreate.colProductTypeName'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productQty',
          header: this.$t('view.production.planCreate.colProductQty'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'gold',
          header: this.$t('view.production.planCreate.colGoldColorTable'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'goldSize',
          header: this.$t('view.production.planCreate.colGoldTypeTable'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'customerNumber',
          header: this.$t('view.production.planCreate.colCustomerCode'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'customerName',
          header: this.$t('view.production.planCreate.colCustomerName'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'customerTypeName',
          header: this.$t('view.production.planCreate.colCustomerType'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'createDate',
          header: this.$t('view.production.planCreate.colCreateDate'),
          sortable: true,
          minWidth: '150px',
          format: 'date'
        }
      ]
    }
  },

  methods: {
    async fetchData() {
      if (this.validateForm()) {
        this.dataSearch = await this.planSearchStore.SearchData({
          take: this.take,
          skip: this.skip,
          sort: this.sort,
          formValue: this.search
        })
      }
    },

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
      const id = item.id
      window.open(`/plan-order-tracking-update/${id}`, '_blank')
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

    handleSubmit() {
      this.resetPaging()
    },

    async onSearchMold(e) {
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
    },

    async modifyPlan(data) {
      this.loadingStore.showLoading()

      const modifyData = {
        data: { ...data },
        header: {},
        headerMat: []
      }

      const id = {
        id: data.id
      }

      const header = await api.jewelry.get('ProductionPlan/ProductionPlanGet', id, {
        skipLoading: true
      })
      const headerMat = await api.jewelry.post('ProductionPlan/ProductionPlanMateriaGet', id, {
        skipLoading: true
      })

      if (header) {
        modifyData.header = { ...header }
      }
      if (headerMat) {
        modifyData.headerMat = [...headerMat]
      }

      this.$emit('modifyPlan', modifyData)
      this.onClear()
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
