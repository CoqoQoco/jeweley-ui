<template>
  <div class="app-container">
    <div class="filter-container view-container">
      <div>
        <!-- header -->
        <div class="d-flex justify-content-between">
          <div class="title-text-lg ml-2">
            <span class="mr-2 bi bi-person-lines-fill"></span>
            <span>แก้ไขข้อมูลบัญชี</span>
          </div>
          <div class="status-container" :class="getStatusSeverity(data)">
            {{ getStatusName(data) }}
          </div>
        </div>

        <div class="line"></div>

        <!-- detail -->
        <div class="label-container mt-2">
          <!-- username -->
          <div class="title-label">
            <span>บัญชี</span>
          </div>
          <div class="text-left">
            <div class="form-control custom-input w-50">
              {{ data.username }}
            </div>
          </div>

          <!-- name -->
          <div class="title-label">
            <span>ชื่อ</span>
          </div>
          <div class="text-left">
            <div class="form-control custom-input w-50">
              {{ data.firstName }}
            </div>
          </div>

          <!-- lastname -->
          <div class="title-label">
            <span>นามสกุล</span>
          </div>
          <div class="text-left">
            <div class="form-control custom-input w-50">
              {{ data.lastName }}
            </div>
          </div>
        </div>

        <div class="line"></div>

        <div class="form-col-sm-container date-container">
          <div>
            <span class="title-label">วันที่ลงทะเบียน</span>
            <div class="form-control" type="text">
              <span class="bi bi-calendar mr-2"></span>
              <span> {{ formatDateTime(data.createdDate) }}</span>
            </div>
          </div>
          <div>
            <span class="title-label">วันที่เข้าสู่ระบบล่าสุด</span>
            <div class="form-control" type="text">
              <span class="bi bi-calendar mr-2"></span>
              <span> {{ formatDateTime(data.lastLogin) }}</span>
            </div>
          </div>
          <div></div>
        </div>

        <div class="line"></div>

        <div class="role-conteiner">
          <BaseDataTable
            :items="roles"
            :totalRecords="roles.length"
            :columns="columns"
            :paginator="false"
          >
          </BaseDataTable>
        </div>

        <!-- action -->
        <!-- <div class="submit-container-custom">
          <button style="width: 120px" :class="['btn btn-sm  mr-2 btn-green']" type="submit">
            <span class="bi bi-check mr-2"></span>
            <span>{{ shouldShowRegister ? `ลงทะเบียน` : `เเก้ไขบัญชี` }}</span>
          </button>
          <button
            style="width: 120px"
            :class="['btn btn-sm btn-red']"
            type="button"
            @click="onCancel"
          >
            <span class="bi bi-x mr-2"></span>
            <span>ยกเลิกใช้งาน</span>
          </button>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script>
//import Dropdown from 'primevue/dropdown'

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

import { useUserApiStore } from '@/stores/modules/api/user/user-store.js'
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'
//import swAlert from '@/services/alert/sweetAlerts.js'

export default {
  components: {
    BaseDataTable
    //Dropdown
  },

  setup() {
    const userStore = useUserApiStore()
    const userAuth = useAuthStore()
    return { userStore, userAuth }
  },

  watch: {
    roles: {
      deep: true,
      handler(newRoles) {
        newRoles.forEach((role) => {
          const selectedRole = this.masterRoles.find((master) => master.id === role.id)
          if (selectedRole) {
            role.description = selectedRole.description
          }
        })
      }
    }
  },

  computed: {
    shouldShowRegister() {
      return !this.data.isNew || !this.data.isActive
    }
  },

  data() {
    return {
      data: {},
      roles: [],
      masterRoles: [],
      columns: [
        {
          field: 'name',
          header: 'ตำเเหน่ง',
          sortable: false,
          width: '200px'
        },
        {
          field: 'description',
          header: 'รายละเอียด',
          sortable: false
          //width: '50px',
          //minWidth: '50px'
        }
      ]
    }
  },
  methods: {
    // ---- APIs
    async fetchData() {
      const res = await this.userStore.fetchGetAccount({
        id: this.userAuth.user.id
      })

      if (res) {
        this.data = { ...res }

        // init roles
        if (res.roles && res.roles.length > 0) {
          this.roles = res.roles.map((item) => {
            return {
              id: item.id,
              name: item.name,
              description: item.description
            }
          })
          //this.roles = [...res.roles]
        }

        //init masterRoles by remove old rolse
        if (res.masterRoles && res.masterRoles.length > 0) {
          // this.masterRoles = res.masterRoles
          //   .filter((master) => !(res.roles || []).some((role) => role.rols === master.rols))
          //   .map(({ rols, description }) => ({ rols, description }))

          this.masterRoles = [...res.masterRoles]
        }
      }
    },

    // ---handle Page---
    getStatusSeverity(item) {
      if (item.isActive) {
        return 'box-status-success'
      }
      if (item.isNew) {
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
    },

    addRole() {
      this.roles.push({
        id: null,
        name: null,
        description: null
      })
    },
    removeRole(role) {
      const index = this.roles.findIndex((r) => r === role)
      if (index > -1) {
        this.roles.splice(index, 1)
      }
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
.view-container {
  padding: 20px;
}
.label-container {
  display: grid;
  grid-template-columns: 2fr 12fr;
  gap: 10px;
  padding: 10px 0;
  padding-left: 30px;

  .custom-input {
    background-color: white;
  }
}
.date-container {
  padding: 10px 0;
  padding-left: 30px;
}
.submit-container-custom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  //padding-top: 5px;
  padding-left: 20px;
  padding-right: 20px;
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
.role-conteiner {
  padding: 20px;
}
.dropdown-custom {
  width: 200px !important; // ปรับขนาดตามต้องการ

  :deep(.p-dropdown) {
    width: 200% !important;
  }
}
</style>
