<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- header -->
      <div class="d-flex justify-content-between">
        <div class="title-text-lg">
          <span class="mr-2 bi bi-person-lines-fill"></span>
          <span>แก้ไขข้อมูลบัญชี</span>
        </div>
        <div class="status-container" :class="getStatusSeverity(data)">
          {{ getStatusName(data) }}
        </div>
      </div>

      <!-- detail -->
      <div class="label-container mt-2">
        <!-- username -->
        <div class="title-label">
          <span>บัญชี:</span>
        </div>
        <div class="text-left">
          <input class="form-control w-25" type="text" v-model.trim="data.username" disabled />
        </div>

        <!-- name -->
        <div class="title-label">
          <span>ชื่อ:</span>
        </div>
        <div class="text-left">
          <input class="form-control w-25" type="text" v-model.trim="data.firstName" disabled />
        </div>

        <div class="title-label">
          <span>นามสกุล:</span>
        </div>
        <div class="text-left">
          <input class="form-control w-25" type="text" v-model.trim="data.lastName" disabled />
        </div>

        <div class="title-label">
          <span>วันที่ลงทะเบียน:</span>
        </div>
        <div class="text-left">
          <div class="form-control w-25" type="text">
            {{ formatDateTime(data.createdDate) }}
          </div>
        </div>
      </div>

      <!-- action -->
      <div class="submit-container">
        <button
          style="width: 100px"
          :class="['btn btn-sm  mr-2', !data.isNew ? 'btn-secondary' : 'btn-green']"
          :disabled="!data.isNew"
        >
          <span>ลงทะเบียน</span>
        </button>
        <button
          style="width: 100px"
          :class="['btn btn-sm', !data.isActive ? 'btn-secondary' : 'btn-red']"
          :disabled="!data.isActive"
        >
          <span>ยกเลิกใช้งาน</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useUserApiStore } from '@/stores/modules/api/user/user-store.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'
export default {
  setup() {
    const userStore = useUserApiStore()
    return { userStore }
  },

  data() {
    return {
      data: {}
    }
  },
  methods: {
    // ---- APIs
    async fetchData(id) {
      const res = await this.userStore.fetchGetAccount({
        id: id
      })

      if (res) {
        this.data = { ...res }
      }
    },

    // ---handle Page---
    getStatusSeverity(item) {
      if (item.isActive) {
        return 'box-status-success'
      }
      if (item.isActive) {
        return 'box-status-process'
      }
      return 'box-status-disable'
    },
    getStatusName(item) {
      if (item.isActive) {
        return 'ใช้งาน'
      }
      if (item.isNew) {
        return 'รออนุมัติ'
      }
      return 'ไม่ใช้งาน'
    },
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return formatDate(date)
    }
  },
  created() {
    this.$nextTick(() => {
      this.fetchData(this.$route.params.id)
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.label-container {
  display: grid;
  grid-template-columns: 2fr 12fr;
  gap: 10px;
  padding: 10px 0;
  padding-left: 30px;
}
.title-label {
  display: flex;
  align-items: center;
  margin-right: 5px;
  margin-left: 5px;

  color: var(--base-font-color);
  font-size: 17px;
  //font-weight: 700;
}
</style>
