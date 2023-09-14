<template>
  <div class="app-container">
    <pageTitle
      title="ค้นหาใบจ่าย-รับคืนงาน"
      description="หน้าติดตามข้อมูลการผลิต เเละรายละเอียดต่างๆ"
      :isShowBtnClose="false"
    ></pageTitle>
    <div class="search-container">
      <div class="search-box">
        <input type="text" placeholder="คำค้นหา ... (เลขที่ W.O., เเม่พิมพ์, รหัสสินค้า เป็นต้น)" v-model="search" />
        <span class="bi bi-gem" style="color: var(--base-font-color)"></span>
      </div>
      <div class="btn-search-box">
        <button class="btn btn-sm btn-main mr-2">
          <span class="mr-2"><i class="bi bi-search"></i></span>
          <span>ค้นหา</span>
        </button>
        <button class="btn btn-sm btn-dark">
          <span class="mr-2"><i class="bi bi-x-circle"></i></span>
          <span>ล้างคำค้นหา</span>
        </button>
      </div>
    </div>
    <tableMainData v-model:modelValue="data"></tableMainData>
  </div>
</template>

<script>
import { formatDate, formatDateTime } from '@/utils/moment'
//import tableMain from '@/components/table/HtmlTable.vue'
import tableMainData from './components/TableMain.vue'
import pageTitle from '@/components/custom/PageTitle.vue'
export default {
  components: { tableMainData, pageTitle },
  data() {
    return {
      data: [
        {
          id: 1,
          wo: 6606015,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI0aefjpjkjkdjfsakjjjjdsfjsjdfkjjsdjf;kjskdfjsdjfslkdjf01'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        },
        {
          id: 1,
          wo: 6606003,
          woNumber: 30,
          mold: 'R/9640',
          requestDate: new Date(),
          productNumber: 'R09640DI3',
          customerNumber: 'THI001'
        }
      ],
      search: ''
    }
  },
  methods: {
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return formatDate(date)
    },

    // ----- push ----- ///
    onView(item) {
      console.log(item)
      this.$router.push(`pickinglist-tag/${item.wo}-${item.woNumber}`)
    }
  }
}
</script>

<style lang="scss" scoped>
.nodata-container {
  text-align: center;
  color: var(--base-sub-color);
}
.search-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;

  border: 1px solid white;
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  background-color: #f7f7f7;

  //background-color: var(--base--color);
  border: 1px solid var(--base-color);
  //padding: 20px;
  padding: 20px;
}
.search-box {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 5px;
  padding: 2px 5px;
  margin-right: 10px;
  border: 1px solid var(--base-font-color);
  width: 80%;
}
.search-box input {
  border: none;
  outline: none;
  padding: 5px;
  font-size: 12px;
  width: 98%;
}
.input-search-box {
  width: 200px;
}
.btn-search-box {
  display: flex;
  align-items: flex-end;
}
.btn {
  height: min-content;
}
.lb-search {
  font-size: 15px;
}
</style>
