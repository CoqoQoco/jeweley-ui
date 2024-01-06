<template>
  <div class="form-container mt-2">
    <div class="title-container">
      <div class="txt-title">
        <span>พบข้อมูลลูกค้าทั้งหมด </span>
        <span> {{ total }}</span>
        <span> รายการ </span>
      </div>
    </div>
    <div class="content-container">
      <div v-if="checkNull(model)">
        <div v-for="(data, index) in model" :key="index">
          <panel toggleable class="mt-2">
            <template #header>
              <div class="flex align-items-center gap-2">
                <div class="txt-title-panel" style="margin: 0px">
                  {{ `${data.code} : ${data.nameTh}` }}
                </div>
              </div>
            </template>
            <template #icons>
              <button
                class="p-panel-header-icon p-link mr-2"
                @click="onGoTracking(data)"
                title="ดูประวัติการสั่งซื้อ"
              >
                <span><i class="bi bi-search text-main"></i></span>
              </button>
            </template>
            <div class="form-content-row-sale-columns-container mb-4">
              <div class="txt-title-panel">
                <span>ประวัติการสั่งซื้อสินค้า: </span>
              </div>
              <div class="txt-title-panel">
                <span>{{ data.orderCount }}</span>
              </div>
              <div class="txt-title-panel">
                <span> รายการ</span>
                <!-- <span class="ml-2">
                  <button class="btn btn-sm btn-main">
                    <span>
                      <i class="bi bi-search"></i>
                    </span>
                  </button>
                </span> -->
              </div>
            </div>
            <div class="form-content-row-two-custom-columns-container">
              <div>
                <span>ที่อยู่ติดต่อ: </span>
              </div>
              <div>
                <span class="font-weight-bold">{{ data.address }}</span>
              </div>
            </div>
            <div class="form-content-row-two-custom-columns-container">
              <div>
                <span>ชื่อผู้ติดต่อ: </span>
              </div>
              <div>
                <span class="font-weight-bold">{{ data.contactName }}</span>
              </div>
            </div>
            <div class="form-content-row-two-custom-columns-container">
              <div>
                <span>E-mail: </span>
              </div>
              <div>
                <span class="font-weight-bold">{{ data.email }}</span>
              </div>
            </div>
            <div class="form-content-row-two-custom-columns-container">
              <div>
                <span>โทรศัพท์ 1: </span>
              </div>
              <div>
                <span class="font-weight-bold">{{ data.telephone1 }}</span>
              </div>
            </div>
            <div class="form-content-row-two-custom-columns-container">
              <div>
                <span>โทรศัพท์ 2: </span>
              </div>
              <div>
                <span class="font-weight-bold">{{ data.telephone2 }}</span>
              </div>
            </div>
            <div class="form-content-row-two-custom-columns-container">
              <div>
                <span>อื่นๆ</span>
              </div>
              <div>
                <span class="font-weight-bold">{{ data.remark }}</span>
              </div>
            </div>
          </panel>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Panel from 'primevue/panel'

import _ from 'lodash'
export default {
  components: { Panel },
  props: {
    modelValue: {
      type: Array,
      required: true,
      default: () => []
    },
    total: {
      type: Number,
      required: true,
      default: () => 0
    }
  },
  computed: {
    model() {
      return this.modelValue
    }
  },
  watch: {
    modelValue(value) {
      console.log(value)
      this.form = [...value]
    }
  },
  data() {
    return {
      // --- form ---- //
      form: []
    }
  },
  methods: {
    // --- controller --- //
    checkNull(item) {
      return !_.isEmpty(item)
    },
    onGoTracking(data) {
      //console.log(data)
      const id = data.code
      window.open(`/plan-order-tracking-view/${id}`, '_blank')
    }
  }
}
</script>
<style lang="scss" scoped>
$custom-height: calc(100vh - 240px);
:deep(.p-panel .p-panel-header) {
  border: 1px solid var(--base-color);
  padding: 10px;
  background: var(--base-color);
  color: #343a40;
  border-top-right-radius: 6px;
  border-top-left-radius: 6px;
}
.form-container {
  border: 1px solid #dddddd;
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  background-color: #f7f7f7;
  //padding: 20px 20px;
  //overflow: auto;
  //height: $custom-height;
  //height: calc(100vh - 240px);
}
.title-container {
  height: 50px;
  background-color: var(--base-font-color);
  border-radius: 5px 5px 0px 0px;
  display: flex;
  justify-content: end;
  align-items: center;
  //margin: 0;
  padding: 0px 20px;
}
.content-container {
  margin: 10px 20px;
  //height: calc(100vh - 280px);
  //border: 1px solid #dddddd;
  overflow: auto;
}
.data-container {
  border: 0.1px solid var(--base-font-color);
  height: 100px;
  margin-bottom: 5px;
}
.txt-title {
  font-size: 20px;
  color: #dddddd;
}
.txt-title-panel {
  font-size: 20px;
  color: var(--base-font-color);
}
.txt-detail-panel {
  font-size: 15px;
  color: var(--base-font-color);
}
.form-content-row-sale-columns-container {
  display: grid;
  grid-template-columns: 3fr 2fr 2fr 2fr;
  gap: 10px;
  padding: 0px 10px;
}
.form-content-row-one-columns-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  padding: 0px 10px;
}
.form-content-row-two-custom-columns-container {
  display: grid;
  grid-template-columns: 1fr 10fr;
  gap: 10px;
  padding: 0px 10px;
}
</style>
