<template>
  <div class="page-container">
    <div class="table-contianer">
      <slot name="table"></slot>
      <div v-if="isData" class="no-data">---- ไม่มีข้อมูล ----</div>
    </div>
    <div class="paginate-contianer">
      <div class="item-view">
        <label class="mr-2">ดูข้อมูลต่อหน้า</label>
        <select class="select-item-view" v-model="itemPerPageSelect" @change="onSelectItenPerPage">
          <option v-for="option in itemPerPage" :key="option.value" :value="option.value">
            {{ option.text }}
          </option>
        </select>
      </div>
      <vue-awesome-paginate
        :total-items="50"
        :items-per-page="itemPerPageSelect"
        :max-pages-shown="3"
        v-model="currentPage"
        :on-click="onClickHandler"
      >
        <template #prev-button>
          <span>ก่อนหน้า</span>
        </template>
        <template #next-button>
          <span>ต่อไป</span>
        </template></vue-awesome-paginate
      >
      <div class="total-view">
        <label class="mr-2">ทั้งหมด</label>
        <label class="mr-2">{{ total }}</label>
        <label>ข้อมูล</label>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isData: {
      type: Boolean,
      required: true,
      default: () => false
    },
    //  pagination ///
    total: {
      type: Number,
      required: true,
      default: () => 0
    }
  },
  data() {
    return {
      currentPage: 1,
      itemPerPage: [
        { text: '10', value: 10 },
        { text: '30', value: 30 },
        { text: '50', value: 50 },
        { text: '100', value: 100 }
      ],
      itemPerPageSelect: 10
    }
  },
  methods: {
    onClickHandler(page) {
      console.log(page)
    },
    onSelectItenPerPage() {
      console.log(this.itemPerPageSelect)
    }
  }
}
</script>

<style lang="scss">
.page-container {
  margin-top: 10px;
}
.table-contianer {
  table {
    border: 1px solid var(--base-color);
    thead {
      display: table;
      table-layout: fixed;
      background-color: var(--base-font-color);
      color: var(--base-color);
      //font-size: 12px;
      height: 42px;
      border-collapse: collapse; /* รวมเส้นกรอบของตาราง */
      width: calc(100% - 15px);
    }
    tbody {
      display: block;
      overflow: auto;
    }
    tbody tr {
      display: table;
      width: 100%;
      table-layout: fixed; /* even columns width , fix width of table too*/
    }
    th,
    td {
      padding: 2px 10px 2px 10px !important;
      vertical-align: middle !important;
      border: 1px solid var(--base-color); /* สร้างเส้นกรอบ 1 พิกเซล */
      word-wrap: break-word;
      //white-space: nowrap;
      //text-overflow: ellipsis;
    }
    button {
      height: 30px !important;
      i {
        font-size: 10px;
      }
    }
  }
}
.no-data {
  padding: 10px;
  font-size: 12px;
  font-weight: 900;
  color: var(--base-sub-color);
  text-align: center;
}

.paginate-contianer {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
}
.page-container .pagination-container {
  column-gap: 10px;
  font-size: 12px;
}
.page-container .paginate-buttons {
  width: 30px;
  height: 25px;
  cursor: pointer;
  background-color: var(--base-color);
  border: none;
  color: var(--base-font-color);
  border-radius: 2px;
}
.page-container .back-button,
.page-container .next-button {
  background-color: var(--base-font-color);
  color: #ffff;
  width: 60px;
  height: 25px;
}
.page-container .paginate-buttons:hover,
.page-container .active-page:hover {
  background-color: var(--base-sub-color);
  color: #ffff;
}
.page-container .active-page {
  background-color: var(--base-font-color);
  color: #ffff;
}
.page-container .back-button:active,
.page-container .next-button:active {
  background-color: var(--base-font-color);
}

.page-container .item-view {
  margin-right: 10px;
  font-size: 13px;
  color: var(--base-font-color);
}
.page-container .select-item-view {
  height: 25px;
  width: 45px;
  color: var(--base-font-color);
  border: 1px solid var(--base-font-color);
}
.page-container .select-item-view:active,
.page-container .select-item-view:focus {
  border: 1px solid var(--base-font-color);
  outline: 1px solid var(--base-font-color);
}
.page-container .total-view {
  margin-left: 10px;
  font-size: 13px;
  color: var(--base-font-color);
  padding-top: 5px;
}
</style>
