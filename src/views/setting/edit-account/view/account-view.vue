<template>
  <div class="app-container">
    <div class="account-card view-container">
      <form @submit.prevent="onSubmit">
        <!-- Header with Status -->
        <div class="card-header">
          <div class="page-title">
            <span class="icon-container">
              <i class="bi bi-person-lines-fill"></i>
            </span>
            <h2>{{ `เเก้ไขข้อมูลบัญชี : ${data.username}` }}</h2>
          </div>
          <div class="status-badge" :class="getStatusSeverity(data)">
            <i :class="getStatusIcon(data)"></i>
            {{ getStatusName(data) }}
          </div>
        </div>

        <!-- Account Information -->
        <div class="account-info-section">
          <div class="profile-header">
            <div class="avatar-container">
              <div class="avatar">
                <img
                  v-if="originalProfileImage"
                  :src="originalProfileImage"
                  alt="Profile"
                  class="avatar-image"
                />
                <i v-else class="bi bi-person-circle"></i>
              </div>
            </div>

            <!-- info -->
            <div class="user-info">
              <h3 class="fullname">{{ data.firstName }} {{ data.lastName }}</h3>
              <span class="username">@{{ data.username }}</span>
            </div>
          </div>

          <!-- name -->
          <div class="details-grid mt-2">
            <div class="detail-item">
              <div class="detail-label"><i class="bi bi-person"></i> ชื่อ</div>
              <div class="detail-value">{{ data.firstName }}</div>
            </div>

            <div class="detail-item">
              <div class="detail-label"><i class="bi bi-person-vcard"></i> นามสกุล</div>
              <div class="detail-value">{{ data.lastName }}</div>
            </div>
          </div>
        </div>

        <!-- Dates Section -->
        <div class="dates-section">
          <div class="date-card">
            <div class="date-label">
              <i class="bi bi-calendar-plus"></i>
              วันที่ลงทะเบียน
            </div>
            <div class="date-value">
              {{ formatDateTime(data.createdDate) }}
            </div>
          </div>

          <div class="date-card">
            <div class="date-label">
              <i class="bi bi-calendar-check"></i>
              วันที่เข้าสู่ระบบล่าสุด
            </div>
            <div class="date-value">
              {{ formatDateTime(data.lastLogin) }}
            </div>
          </div>
        </div>

        <div class="p-4">
          <BaseDataTable
            :items="roles"
            :totalRecords="roles.length"
            :columns="columns"
            :paginator="false"
          >
            <template #nameTemplate="{ data }">
              <div class="custom-col-role">
                <button class="btn btn-sm btn-red mr-2" type="button" @click="removeRole(data)">
                  <span class="bi bi-trash"></span>
                </button>
                <Dropdown
                  v-model="data.id"
                  :options="masterRoles"
                  optionLabel="name"
                  optionValue="id"
                  class="w-full md:w-14rem"
                />
              </div>
            </template>
            <template #descriptionTemplate="{ data }">
              <div>
                <span>{{ data.description }}</span>
              </div>
            </template>

            <template #footer>
              <div class="d-flex justify-content-start">
                <button class="btn btn-sm btn-main" type="button" @click="addRole">
                  <span class="bi bi-plus"></span>
                </button>
              </div>
            </template>
          </BaseDataTable>
        </div>

        <!-- action -->
        <div class="submit-container mr-4">
          <button
            style="width: 120px"
            :class="['btn btn-sm', shouldShowRegister ? 'btn-secondary' : 'btn-red']"
            type="button"
            @click="onCancel"
            :disabled="shouldShowRegister"
          >
            <span class="bi bi-x mr-2"></span>
            <span>ยกเลิกใช้งาน</span>
          </button>
          <button style="width: 120px" :class="['btn btn-sm  ml-2 btn-green']" type="submit">
            <span class="bi bi-check mr-2"></span>
            <span>{{ shouldShowRegister ? `ลงทะเบียน` : `เเก้ไขบัญชี` }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import Dropdown from 'primevue/dropdown'

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

import { useUserApiStore } from '@/stores/modules/api/user/user-store.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'
import swAlert from '@/services/alert/sweetAlerts.js'

export default {
  components: {
    BaseDataTable,
    Dropdown
  },

  setup() {
    const userStore = useUserApiStore()
    return { userStore }
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
      return this.data.isNew || !this.data.isActive
    }
  },

  data() {
    return {
      data: {},
      roles: [],
      masterRoles: [],

      originalProfileImage: null,

      columns: [
        {
          field: 'name',
          header: 'ตำเเหน่ง',
          sortable: false,
          width: '310px'
        },
        {
          field: 'description',
          header: 'รายละเอียด',
          sortable: false,
          minWidth: '50px'
        }
      ]
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

        if (res.image) {
          this.originalProfileImage = `data:image/png;base64,${res.image}`
          console.log('originalProfileImage', this.originalProfileImage)
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
    getStatusIcon(item) {
      if (!item) return 'bi bi-question-circle'
      if (item.isActive) {
        return 'bi bi-check-circle'
      }
      if (item.isNew) {
        return 'bi bi-hourglass-split'
      }
      return 'bi bi-dash-circle'
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
    },
    async onSubmit() {
      console.log('submit')
      swAlert.confirmSubmit(
        `${this.data.username}`,
        `${this.data.isNew ? `ลงทะเบียน` : `เเก้ไขบัญชี`}`,
        async () => {
          const validRoles = this.roles
            .filter((role) => role.id !== null) // ลบ role ที่ไม่มี id
            .reduce((unique, role) => {
              // กำจัดค่าซ้ำ
              if (!unique.some((r) => r.id === role.id)) {
                unique.push(role)
              }
              return unique
            }, [])

          const form = {
            ...this.data,
            roles: validRoles
          }
          const res = await this.userStore.fetchActiveAccount({
            form: form
          })

          if (res) {
            swAlert.success('', '')

            //back router
            this.$router.go(-1)
            //this.$router.push({ name: 'edit-account' })
          }
        }
      )
    },
    async onCancel() {
      console.log('submit')
      swAlert.confirmSubmit(`${this.data.username}`, `ยกเลิกใช้งาน`, async () => {
        const form = {
          ...this.data,
          roles: []
        }
        const res = await this.userStore.fetchInactiveAccount({
          form: form
        })

        if (res) {
          swAlert.success('', '')

          //back router
          this.$router.go(-1)
          //this.$router.push({ name: 'edit-account' })
        }
      })
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

.app-container {
  padding: 20px;
  display: flex;
  justify-content: center;
}

.account-card {
  width: 100%;
  max-width: 900px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(to right, var(--base-font-color), var(--base-font-sub-color));
  color: white;

  .page-title {
    display: flex;
    align-items: center;
    gap: 12px;

    .icon-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);

      i {
        font-size: 20px;
      }
    }

    h2 {
      margin: 0;
      font-size: 22px;
      font-weight: 600;
    }
  }
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;

  i {
    font-size: 16px;
  }

  &.status-success {
    background-color: var(--base-green);
  }

  &.status-process {
    color: rgba(2, 2, 2, 0.753);
    background-color: var(--base-warning);
  }

  &.status-disable {
    color: var(--base-red);
  }
}

.account-info-section {
  padding: 24px;

  .profile-header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 24px;

    .avatar-container {
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;

      .avatar {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        background-color: var(--base-sub-color);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        position: relative;
        overflow: hidden;
        //cursor: pointer;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        border: 3px solid #fff;

        i {
          font-size: 42px;
        }

        .avatar-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s;
          color: white;

          i {
            font-size: 24px;
            margin-bottom: 4px;
          }

          span {
            font-size: 12px;
            font-weight: 500;
          }
        }

        &:hover .avatar-overlay {
          opacity: 1;
        }
      }

      .avatar-options {
        position: absolute;
        top: 110%;
        left: 50%;
        transform: translateX(-50%);
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        padding: 8px 0;
        z-index: 10;
        width: 150px;

        .option,
        .option-cancel {
          display: flex;
          align-items: center;
          padding: 8px 16px;
          cursor: pointer;

          i {
            margin-right: 8px;
            font-size: 14px;
          }

          span {
            font-size: 14px;
          }

          &:hover {
            background-color: #f5f5f5;
          }
        }

        .option-cancel {
          border-top: 1px solid #eee;
          margin-top: 6px;
          padding-top: 8px;
          color: #777;
        }
      }

      .file-input {
        display: none;
      }
    }

    .user-info {
      h3 {
        margin: 0 0 5px 0;
        font-size: 22px;
        font-weight: 500;
        color: #333;
      }
      .fullname {
        color: var(--base-font-color);
      }

      .username {
        color: #6c757d;
        font-size: 15px;
      }
    }
  }
}
.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 10px;

  .detail-item {
    background-color: var(--base-color);
    border-radius: 8px;
    padding: 16px;
    transition:
      transform 0.2s,
      box-shadow 0.2s;

    &:hover {
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    }

    .detail-label {
      color: #6c757d;
      font-size: 14px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;

      i {
        color: var(--base-font-color);
      }
    }

    .detail-value {
      font-size: 16px;
      font-weight: 500;
      color: #212529;
    }
  }
}

.dates-section {
  padding: 0 24px 24px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;

  .date-card {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 16px;
    border-left: 4px solid var(--base-font-color);

    .date-label {
      color: #6c757d;
      font-size: 14px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;

      i {
        color: var(--base-font-color);
      }
    }

    .date-value {
      font-size: 16px;
      font-weight: 500;
      color: #212529;
    }
  }
}

.roles-section {
  padding: 24px;

  border: 1px solid #dddddd;
  border-radius: 10px;

  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  background-color: #f7f7f7;
  overflow: auto;

  .section-title {
    font-size: 18px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--base-font-color);

    i {
      font-size: 20px;
    }
  }
}

.custom-submit-container {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px 24px;
  background-color: #f8f9fa;
}

.btn-action {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.custom-data-table {
  :deep(.p-datatable-wrapper) {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  :deep(.p-datatable-header) {
    background-color: #f8f9fa;
    border: none;
  }

  :deep(.p-datatable-thead > tr > th) {
    background-color: #f8f9fa;
    color: var(--base-font-color);
    font-weight: 600;
    padding: 14px 16px;
  }

  :deep(.p-datatable-tbody > tr > td) {
    padding: 14px 16px;
    border-bottom: 1px solid #f0f0f0;
  }

  :deep(.p-datatable-tbody > tr:last-child > td) {
    border-bottom: none;
  }
}

.custom-col-role {
  width: 250px;
}
</style>
