<template>
  <div>
    <tableMain :isData="isData" :total="total">
      <template v-slot:table>
        <table class="table-main">
          <thead>
            <tr>
              <th class="td-action"></th>
              <th>เลขที่ W.O.</th>
              <th>ลำดับ W.O.</th>
              <th>เเม่พิมพ์</th>
              <th>วันสร้างใบงาน</th>
              <th>รหัสสินค้า</th>
              <th>รหัสลูกค้า</th>
            </tr>
          </thead>
          <tbody style="max-height: calc(100vh - 330px)">
            <tr v-for="(item, index) in modelValue" :key="index">
              <td class="td-action">
                <button
                  class="btn btn-sm btn-warning mr-2"
                  title="ดูรายละเอียด"
                  @click="onView(item)"
                >
                  <i class="bi bi-gem"></i>
                </button>
                <button class="btn btn-sm btn-main" title="ลบใบจ่าย">
                  <i class="bi bi-trash-fill"></i>
                </button>
              </td>
              <td>{{ item.wo }}</td>
              <td>{{ item.woNumber }}</td>
              <td>{{ item.mold }}</td>
              <td>{{ formatDate(item.requestDate) }}</td>
              <td>{{ item.productNumber }}</td>
              <!-- <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                {{ item.customerNumber }}
              </td> -->
              <td>
                {{ item.customerNumber }}
              </td>
            </tr>
          </tbody>
        </table>
      </template>
    </tableMain>
  </div>
</template>

<script>
import tableMain from '@/components/table/HtmlTable.vue'
import { formatDate, formatDateTime } from '@/utils/moment'
export default {
  components: { tableMain },
  props: {
    modelValue: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return { total: 0 }
  },
  computed: {
    isData() {
      return this.modelValue.length ? false : true
    }
  },
  methods: {
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return formatDate(date)
    }
  },
  created() {
    //console.log(this.modelValue.length)
  }
}
</script>

<style lang="scss" scoped>
.td-action {
  width: 90px;
  text-align: center;
}
</style>
