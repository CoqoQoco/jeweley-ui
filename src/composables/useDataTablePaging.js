/**
 * useDataTablePaging — mixin สำหรับ data-table ที่ต้องการ paging + sort
 *
 * วิธีใช้:
 *   import dataTablePaging from '@/composables/useDataTablePaging.js'
 *
 *   export default {
 *     mixins: [dataTablePaging],
 *     methods: {
 *       async fetchData() {
 *         // component ต้องมี fetchData() เองเสมอ
 *         const res = await this.myStore.fetchList({
 *           take: this.take,
 *           skip: this.skip,
 *           sort: this.sort,
 *         })
 *         if (res) this.data = res
 *       }
 *     }
 *   }
 *
 * หมายเหตุ: component ที่ใช้ mixin นี้ต้องประกาศ method fetchData() เอง
 * mixin จะเรียก this.fetchData() หลัง handlePageChange / handleSortChange / resetPaging
 */
const dataTablePaging = {
  data() {
    return {
      skip: 0,
      take: 10,
      sort: []
    }
  },

  methods: {
    handlePageChange(e) {
      this.skip = e.first
      this.take = e.rows
      this._callFetchData()
    },

    handleSortChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.sort = e.multiSortMeta.map((item) => ({
        field: item.field,
        dir: item.order === 1 ? 'asc' : 'desc'
      }))
      this._callFetchData()
    },

    resetPaging() {
      this.skip = 0
      this._callFetchData()
    },

    _callFetchData() {
      if (typeof this.fetchData === 'function') {
        this.fetchData()
      } else if (import.meta.env.DEV) {
        console.warn(
          '[useDataTablePaging] component ต้องมี method fetchData() — mixin จะไม่ทำงานจนกว่าจะมี fetchData()'
        )
      }
    }
  }
}

export default dataTablePaging
