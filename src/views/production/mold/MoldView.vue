<template>
  <div class="app-container">
    <form @submit.prevent="onSearch">
      <div class="filter-container mb-3">
        <pageTitle
          title="ออกเเบบ สร้างเเม่พิมพ์"
          description="ข้อมูลออกเเบบ สร้างเเม่พิมพ์ เเละรายละเอียดต่างๆ"
          :isShowBtnClose="false"
          isShowRightSlot
        />
        <div class="row form-group">
          <div class="col-md-8">
            <label>คำค้นหา</label>
            <input
              type="text"
              style="width: 30rem"
              class="form-control"
              placeholder="คำค้นหา ... รหัส ประเภท รายละเอียด"
              v-model="form.text"
            />
          </div>
          <div class="col-md-4 btn-container">
            <button class="btn btn-sm btn-main mr-2" type="submit">
              <span class="mr-2"><i class="bi bi-search"></i></span>
              <span>ค้นหา</span>
            </button>
            <button class="btn btn-sm btn-dark mr-2" type="button" @click="onClear">
              <span class="mr-2"><i class="bi bi-x-circle"></i></span>
              <span>ล้างค้นหา</span>
            </button>
            <button class="btn btn-sm btn-main" type="button" @click="showModalAddMold">
              <span class="mr-2"><i class="bi bi-gem"></i></span>
              <span>สร้างเเม่พิมพ์</span>
            </button>
          </div>
        </div>
      </div>
    </form>

    <BaseDataTable
      :items="data"
      :totalRecords="totalRecords"
      :columns="columns"
      :perPage="take"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <template #actionTemplate="{ data: row }">
        <div class="col-btn-container">
          <button class="btn btn-sm btn-main" @click="updateMold(row)">
            <i class="bi bi-brush"></i>
          </button>
        </div>
      </template>

      <template #imageTemplate="{ data: row }">
        <div class="image-container">
          <imagePreview :imageName="row.code" type="MOLD" />
        </div>
      </template>
    </BaseDataTable>

    <modalCreate
      :isShowModal="isShowModalAddMold"
      @closeModal="closeModalCreate"
      @fetch="fetchDataByCreate"
    />
    <modalUpdate
      :isShowModal="isShowModalUpdateMold"
      :modelValue="dataUpdate"
      @closeModal="closeModalUpdate"
      @fetch="fetchDataByCreate"
    />
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import dataTablePaging from '@/composables/useDataTablePaging.js'
import api from '@/axios/axios-helper.js'

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/page-title.vue'))
const imagePreview = defineAsyncComponent(() => import('@/components/image/PreviewImage.vue'))

import modalCreate from './components/ModalCreate.vue'
import modalUpdate from './components/ModalUpdate.vue'

export default {
  components: {
    pageTitle,
    modalCreate,
    modalUpdate,
    imagePreview,
    BaseDataTable
  },

  mixins: [dataTablePaging],

  data() {
    return {
      isShowModalAddMold: false,
      isShowModalUpdateMold: false,
      countFetchImage: 0,
      form: {
        text: null
      },

      totalRecords: 0,
      data: [],
      dataUpdate: {},

      columns: [
        {
          field: 'action',
          header: '',
          minWidth: '80px',
          sortable: false,
          align: 'center'
        },
        {
          field: 'code',
          header: 'รหัส',
          minWidth: '120px',
          sortable: true
        },
        {
          field: 'category',
          header: 'ประเภท',
          minWidth: '120px',
          sortable: true
        },
        {
          field: 'image',
          header: 'รูปเเม่พิมพ์',
          minWidth: '100px',
          sortable: false
        },
        {
          field: 'moldBy',
          header: 'ช่างขึ้นพิมพ์',
          minWidth: '120px',
          sortable: true
        },
        {
          field: 'description',
          header: 'รายละเอียด',
          minWidth: '200px',
          sortable: true
        }
      ]
    }
  },

  methods: {
    onClear() {
      this.form = {
        text: null
      }
    },

    showModalAddMold() {
      this.isShowModalAddMold = true
    },
    closeModalCreate() {
      this.isShowModalAddMold = false
    },
    closeModalUpdate() {
      this.isShowModalUpdateMold = false
    },
    fetchDataByCreate() {
      this.isShowModalAddMold = false
      this.isShowModalUpdateMold = false
      this.countFetchImage = ++this.countFetchImage
      this.fetchData()
    },
    updateMold(data) {
      this.dataUpdate = { ...data }
      this.isShowModalUpdateMold = true
    },

    onSearch() {
      this.countFetchImage = ++this.countFetchImage
      this.resetPaging()
    },

    async fetchData() {
      this.data = []
      const param = {
        take: this.take,
        skip: this.skip,
        search: {
          text: this.form.text ?? null
        }
      }
      const res = await api.jewelry.post('Mold/SearchMold', param)
      if (res) {
        this.data = [...res.data]
        this.totalRecords = res.total
      }
    }
  },

  created() {
    this.fetchData()
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  background-color: #f7f7f7;
  padding: 10px;
}
.flex-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.btn-container {
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  margin-top: 10px;
}
label {
  margin-bottom: 0px;
  font-size: 12px;
  font-weight: 700;
  color: var(--base-font-color);
}
.col-btn-container {
  display: flex;
  justify-content: center;
}
</style>
