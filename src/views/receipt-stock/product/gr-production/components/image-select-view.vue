<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal" width="900px">
      <template v-slot:content>
        <div>
          <div class="title-text">
            <span><i class="bi bi-image mr-2"></i></span>
            <span>เลือกรูปสินค้า | เลขที่ตั้งรับ :</span>
            <span class="ml-2">{{ stock.stockReceiptNumber }}</span>
          </div>

          <div class="line"></div>

          <div>
            <form @submit.prevent="handleSubmit">
              <div class="input-group input-group-sm">
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
                    placeholder="ค้นหาด้วยชื่อรูปภาพ"
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

          <div class="mt-1">
            <BaseDataTable
              scrollHeight="400px"
              :items="latestImage"
              :totalRecords="latestImageTotalRecords"
              :columns="columns"
              :perPage="take"
              :rowsPerPageOptions="[10, 20, 50]"
              :selectionMode="true"
              :itemsSelection="selectedItems"
              :selectionType="selectionType"
              @update:itemsSelection="updateSelection"
              @page="handlePageChange"
              @sort="handleSortChange"
            >
              <!-- Image Column -->
              <template #imageTemplate="{ data }">
                <div class="image-container">
                  <div>
                    <imagePreview
                      :imageName="data.path"
                      :path="data.path"
                      :type="type"
                      :width="50"
                      :height="50"
                      :preview="false"
                    />
                  </div>
                </div>
              </template>

              <!-- Custom Footer/Paginator Buttons -->
              <template #paginator-buttons>
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
              </template>
            </BaseDataTable>
          </div>
        </div>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))
const imagePreview = defineAsyncComponent(() => import('@/components/prime-vue/ImagePreview.vue'))

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

import { stockProductImageApiStor } from '@/stores/modules/api/stock/image-api.js'

const interfaceSearch = {
  name: null
}

export default {
  components: {
    modal,
    BaseDataTable,
    imagePreview
  },

  setup() {
    const stockProductImageStore = stockProductImageApiStor()
    return { stockProductImageStore }
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
    }
  },

  computed: {},

  watch: {
    isShow: {
      async handler(val) {
        this.isShowModal = val
        await this.fetchLatestImage()
      },
      immediate: true
    },
    modelStock: {
      handler(val) {
        this.stock = val
        //console.log('modelStock', val)
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

      latestImage: [],
      latestImageTotalRecords: 0,
      selectedItems: [],
      selectionType: 'single',

      columns: [
        {
          field: 'image',
          header: '',
          width: '50px',
          sortable: false,
          align: 'center'
        },
        {
          field: 'name',
          header: 'ชื่อ',
          sortable: false,
          minWidth: '150px'
        },
        {
          field: 'createDate',
          header: 'วันที่สร้าง',
          sortable: false,
          format: 'datetime',
          minWidth: '150px'
        },
        {
          field: 'remark',
          header: 'รายละเอียด',
          sortable: false,
          minWidth: '150px'
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
      this.latestImage = []
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
      this.fetchLatestImage()
    },
    onSelect() {
      //console.log('selectedItems:', this.selectedItems[0])
      //console.log('stock:', this.stock)
      this.$emit('select', this.selectedItems[0], this.stock)
      this.onClear
    },

    updateSelection(newSelection) {
      this.selectedItems = newSelection
      //console.log('updateSelection:', this.selectedItems.length)
    },
    handlePageChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.fetchLatestImage()
    },
    handleSortChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.sort = e.multiSortMeta.map((item) => ({
        field: item.field,
        dir: item.order === 1 ? 'asc' : 'desc'
      }))
      this.fetchLatestImage()
    },
    async fetchLatestImage() {
      this.selectedItems = []
      const res = await this.stockProductImageStore.fetchListImage({
        take: this.take,
        skip: this.skip,
        sort: [{ field: 'createDate', dir: 'desc' }],
        search: {
          name: this.search.name,
          year: null
        },
        skipLoading: true
      })

      if (res) {
        this.latestImageTotalRecords = res.total
        this.latestImage = res.data.map((item) => {
          return {
            id: item.id,
            name: item.name,
            year: item.year,
            remark: item.remark,
            path: item.namePath,
            createDate: item.createDate
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
