<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal" width="400px">
      <template v-slot:content>
        <div>
          <div class="title-text-lg-bg">
            <span><i class="bi bi-brush mr-2"></i></span>
            <span>{{ `ค้นหาชื่อสินค้า ${typeMode === 'EN' ? '(EN)' : '(TH)'}` }}</span>
          </div>

          <div>
            <form @submit.prevent="handleSubmit">
              <div class="input-group input-group-sm pr-1 pl-2">
                <div class="input-group input-group-inner">
                  <input
                    class="form-control"
                    :style="getBgColor(search.name)"
                    type="text"
                    autocomplete="off"
                    autocorrect="off"
                    autocapitalize="off"
                    spellcheck="false"
                    v-model="search.name"
                    placeholder="พิมพ์ชื่อสินค้าที่ต้องการค้นหา"
                    required
                  />
                  <div class="input-group-append mr-1">
                    <button type="submit" class="btn btn-main btn-sm btn-input-group mt-1">
                      <span class="bi bi-search"></span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div class="pl-2 pr-2">
            <BaseDataTable
              scrollHeight="400px"
              :items="nameList"
              :paginator="false"
              :columns="columns"
              :selectionMode="true"
              :itemsSelection="selectedItems"
              :selectionType="selectionType"
              @update:itemsSelection="updateSelection"
            >
            </BaseDataTable>
            <div class="d-flex justify-content-between mt-2 pb-2">
              <div class="check-return-container">
                <Checkbox v-model="editAll" :binary="true" />
                <span for="ingredient1" class="ml-2">เเก้ไขทุกรายการสินค้า</span>
              </div>
              <div>
                <button
                  :class="['btn btn-sm', !selectedItems.length > 0 ? 'btn-secondary' : 'btn-main']"
                  type="button"
                  :disabled="!selectedItems.length > 0"
                  title="ปรับปรุง"
                  @click="onSelect"
                >
                  <span><i class="bi bi-pencil-square"></i></span>
                  <span class="ml-2">ปรับปรุง</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

import Checkbox from 'primevue/checkbox'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'

const interfaceSearch = {
  name: null
}

export default {
  components: {
    modal,
    BaseDataTable,
    Checkbox
  },

  setup() {
    const stockProductStore = usrStockProductApiStore()
    return { stockProductStore }
  },

  props: {
    isShow: {
      type: Boolean,
      required: true,
      default: false
    },
    modelStock: {
      type: Object,
      required: true,
      default: () => ({})
    },
    mode: {
      type: String,
      required: true,
      default: 'EN'
    }
  },

  computed: {},

  watch: {
    isShow: {
      async handler(val) {
        this.isShowModal = val
        //await this.fetchLatestImage()
      },
      immediate: true
    },
    modelStock: {
      handler(val) {
        this.stock = val
        //console.log('modelStock', val)
      },
      immediate: true
    },
    mode: {
      handler(val) {
        this.typeMode = val
        //console.log('mode', val)
      },
      immediate: true
    }
  },

  data() {
    return {
      isShowModal: this.isShow,
      stock: this.modelStock,
      search: {
        ...interfaceSearch
      },

      type: 'STOCK-PRODUCT',
      typeMode: this.mode,
      editAll: false,

      nameList: [],
      nameListTotalRecords: 0,
      selectedItems: [],
      selectionType: 'single',

      columns: [
        {
          field: 'text',
          header: 'ชื่อสินค้า',
          sortable: false
        }
      ],
      tableHeight: '800px',
      take: 10,
      skip: 0,
      sort: []
    }
  },

  methods: {
    onClear() {
      this.search = { ...interfaceSearch }
      this.selectedItems = []
      this.nameList = []
      this.editAll = false
    },
    closeModal() {
      this.onClear()
      this.$emit('closeModal')
    },
    getBgColor(data) {
      if (data) {
        return 'background-color: #b5dad4'
      } else {
        return 'background-color: #dad4b5'
      }
    },
    handleSubmit() {
      //console.log('submit')
      this.fetchData()
    },
    onSelect() {
      //console.log('selectedItems:', this.selectedItems[0])
      //console.log('stock:', this.stock)
      this.$emit('select', this.selectedItems[0], this.stock, this.typeMode, this.editAll)
      this.onClear
    },

    updateSelection(newSelection) {
      this.selectedItems = newSelection
      //console.log('updateSelection:', this.selectedItems.length)
    },

    async fetchData() {
      this.selectedItems = []
      const res = await this.stockProductStore.fetchDataSearchProductName({
        formValue: {
          mode: this.typeMode,
          text: this.search.name
        },
        skipLoading: true
      })

      if (res) {
        let id = 1
        this.nameList = res.map((item) => {
          return {
            id: id++,
            text: item.text
          }
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.btn-input-group {
  height: 35px;
  padding: 6px 12px;
  margin-top: 5px !important;
}
</style>
