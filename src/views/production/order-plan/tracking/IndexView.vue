<template>
  <div class="app-container">
    <div class="search-container">
      <div class="search-box">
        <input type="text" placeholder="คำค้นหาใบจ่าย-รับคืนงาน..." v-model="search" />
        <span class="bi bi-gem"></span>
      </div>
      <!-- <div>
        <input
          type="text"
          class="form-control input-search-box"
          placeholder="คำค้นหา..."
          v-model="search"
        />
      </div> -->
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
    <div class="table-container">
      <table class="table table-striped">
        <thead>
          <tr>
            <th></th>
            <!-- <th>ตัวอย่าง</th> -->
            <th>เลขที่ W.O.</th>
            <th>ลำดับ W.O.</th>
            <th>เเม่พิมพ์</th>
            <th>วันสร้างใบงาน</th>
            <th>รหัสสินค้า</th>
            <th>รหัสลูกค้า</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in data" :key="index">
            <td class="td-action">
              <button class="btn btn-sm btn-warning mr-2" title="ดูรายละเอียด">
                <i class="bi bi-gem"></i>
              </button>
              <button class="btn btn-sm btn-main" title="ลบใบจ่าย">
                <i class="bi bi-trash-fill"></i>
              </button>
            </td>
            <!-- <td></td> -->
            <td>{{ item.wo }}</td>
            <td>{{ item.woNumber }}</td>
            <td>{{ item.mold }}</td>
            <td>{{ formatDate(item.requestDate) }}</td>
            <td>{{ item.productNumber }}</td>
            <td>{{ item.customerNumber }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="!data.length" class="nodata-container">
        <label>ไม่มีส่วนประกอบ</label>
      </div>
    </div>
  </div>
</template>

<script>
import { formatDate, formatDateTime } from '@/utils/moment'
export default {
  data() {
    return {
      data: [
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
    }
  }
}
</script>

<style lang="scss" scoped>
input {
  font-size: 10px;
}
label {
  font-size: 10px;
}
table {
  font-size: 12px;
  margin-bottom: 5px;
}
table thead {
  background-color: var(--base-font-color);
  color: var(--base-color);
  font-size: 12px;
  height: 42px;
  border-collapse: collapse; /* รวมเส้นกรอบของตาราง */
}
/* สร้างรูปแบบสำหรับ th และ td */
table th,
table td {
  padding: 5px;
  vertical-align: middle;
  border: 1px solid var(--base-color); /* สร้างเส้นกรอบ 1 พิกเซล */
}
table th {
  padding-left: 5px;
}
table td {
  padding: 5px;
  vertical-align: middle;
  //height: 5px;
}
button i {
  font-size: 12px;
}

.table-container {
}
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
  width: 300px;
}
.search-box input {
  border: none;
  outline: none;
  padding: 5px;
  font-size: 12px;
  width: 270px;
}
.search-box .bi-search {
  font-size: 15px;
  //margin-left: 5px;
  cursor: pointer;
}
.td-action {
  width: 100px;
  text-align: center;
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
