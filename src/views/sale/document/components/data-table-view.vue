<template>
  <div class="mt-2">
    <div class="d-flex justify-content-between align-items-center mb-2">
      <button class="btn btn-sm btn-main" @click="$emit('upload')">
        <i class="bi bi-upload mr-1"></i> Upload เอกสาร
      </button>
      <span class="title-text">{{ filteredList.length }} รายการ</span>
    </div>

    <BaseDataTable
      :value="filteredList"
      dataKey="id"
      :columns="columns"
      :paginator="true"
      :rows="10"
      :showGridlines="true"
      scrollable
      stripedRows
      :scrollHeight="'calc(100vh - 340px)'"
    >
      <template #actionTemplate="{ data }">
        <div class="btn-action-container">
          <button class="btn btn-sm btn-green mr-1" title="Preview" @click="onPreview(data)">
            <i class="bi bi-eye"></i>
          </button>
          <button class="btn btn-sm btn-main mr-1" title="Download" @click="onDownload(data)">
            <i class="bi bi-download"></i>
          </button>
          <button class="btn btn-sm btn-sub-main mr-1" title="แก้ไข Tag" @click="$emit('tag', data)">
            <i class="bi bi-tag"></i>
          </button>
          <button class="btn btn-sm btn-red" title="ลบ" @click="onDelete(data)">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </template>

      <template #monthYearTemplate="{ data }">
        <span>{{ getMonthName(data.documentMonth) }} {{ data.documentYear }}</span>
      </template>

      <template #tagsTemplate="{ data }">
        <div class="tags-container">
          <span
            v-for="(tag, i) in parseTags(data.tags)"
            :key="i"
            class="tag-badge"
          >{{ tag }}</span>
          <span v-if="!data.tags" class="text-muted">-</span>
        </div>
      </template>

      <template #createDateTemplate="{ data }">
        {{ formatDateTime(data.createDate) }}
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import { useSaleDocumentStore } from '@/stores/modules/api/sale/sale-document-store.js'
import { confirmSubmit, success } from '@/services/alert/sweetAlerts.js'
import { formatDateTime } from '@/services/utils/dayjs.js'

const MONTHS = ['', 'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']

export default {
  name: 'SaleDocumentDataTableView',

  components: { BaseDataTable },

  emits: ['upload', 'tag', 'refresh'],

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    }
  },

  setup() {
    const store = useSaleDocumentStore()
    return { store }
  },

  data() {
    return {
      columns: [
        { field: 'action', header: '', width: '160px', sortable: false },
        { field: 'fileName', header: 'ชื่อไฟล์', minWidth: '250px', sortable: true },
        { field: 'monthYear', header: 'เดือน/ปี', minWidth: '140px', sortable: false, template: 'monthYearTemplate' },
        { field: 'tags', header: 'Tags', minWidth: '180px', sortable: false, template: 'tagsTemplate' },
        { field: 'remark', header: 'หมายเหตุ', minWidth: '180px', sortable: false },
        { field: 'createBy', header: 'ผู้ upload', minWidth: '120px', sortable: true },
        { field: 'createDate', header: 'วันที่ upload', minWidth: '160px', sortable: true, template: 'createDateTemplate' }
      ]
    }
  },

  computed: {
    form() {
      return this.modelForm || {}
    },

    filteredList() {
      let list = this.store.dataList || []
      const keyword = this.form.keyword?.toLowerCase()
      if (keyword) {
        list = list.filter(
          (item) =>
            item.fileName?.toLowerCase().includes(keyword) ||
            item.tags?.toLowerCase().includes(keyword)
        )
      }
      return list
    }
  },

  watch: {
    async modelForm() {
      await this.fetchData()
    }
  },

  methods: {
    async fetchData() {
      await this.store.fetchList({
        month: this.form.month || null,
        year: this.form.year || null
      })
    },

    getMonthName(month) {
      return MONTHS[month] || '-'
    },

    parseTags(tags) {
      if (!tags) return []
      return tags.split(',').map((t) => t.trim()).filter(Boolean)
    },

    formatDateTime(date) {
      return date ? formatDateTime(date) : '-'
    },

    async onPreview(data) {
      const response = await this.store.downloadDocument(data.id)
      if (response?.data) {
        const blob = new Blob([response.data], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        window.open(url, '_blank')
      }
    },

    async onDownload(data) {
      const response = await this.store.downloadDocument(data.id)
      if (response?.data) {
        const blob = new Blob([response.data], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = data.fileName
        a.click()
        URL.revokeObjectURL(url)
      }
    },

    onDelete(data) {
      confirmSubmit(`คุณต้องการลบเอกสาร "${data.fileName}" หรือไม่?`, 'ยืนยันการลบ', async () => {
        await this.store.deleteDocument(data.id)
        success('ลบเอกสารสำเร็จ')
        await this.fetchData()
      })
    }
  },

  async mounted() {
    await this.fetchData()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
@import '@/assets/scss/custom-style/standard-form';

.btn-action-container {
  display: flex;
  align-items: center;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag-badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 0.75rem;
  border-radius: 12px;
  background-color: var(--base-font-color);
  color: #fff;
}
</style>
