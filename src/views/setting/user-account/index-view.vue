<template>
  <div class="app-container">
    <div class="account-card view-container">
      <!-- Header with Status -->
      <div class="card-header">
        <div class="page-title">
          <span class="icon-container">
            <i class="bi bi-person-lines-fill"></i>
          </span>
          <h2>ข้อมูลบัญชี</h2>
        </div>
        <div class="status-badge" :class="getStatusSeverity(user)">
          <i :class="getStatusIcon(user)"></i>
          {{ getStatusName(user) }}
        </div>
      </div>

      <!-- Account Information -->
      <div class="account-info-section">
        <div class="profile-header">
          <div class="avatar-container">
            <div class="avatar">
              <img
                v-if="profileImage"
                :src="profileImage"
                alt="Profile"
                class="avatar-image"
                @error="handleImageError"
              />
              <i v-else class="bi bi-person-circle"></i>

              <!-- Overlay สำหรับการแก้ไขรูปภาพ -->
              <div class="avatar-overlay" @click="triggerFileInput">
                <i class="bi bi-camera"></i>
                <span>แก้ไขรูป</span>
              </div>
            </div>

            <!-- ตัวเลือกถ่ายภาพหรืออัปโหลด (แสดงเมื่อคลิกที่รูป) -->
            <div class="avatar-options" v-if="showAvatarOptions">
              <div class="option" @click="removeProfileImage" v-if="profileImage || user.image">
                <i class="bi bi-trash"></i>
                <span>ลบรูปภาพ</span>
              </div>
              <div class="option-cancel" @click="showAvatarOptions = false">
                <i class="bi bi-x"></i>
                <span>ยกเลิก</span>
              </div>
            </div>

            <!-- Input สำหรับอัปโหลดไฟล์ (ซ่อนไว้) -->
            <input
              type="file"
              ref="fileInput"
              accept="image/*"
              class="file-input"
              @change="handleFileUpload"
            />
          </div>

          <!-- info -->
          <div class="user-info">
            <h3 class="fullname">{{ user.firstName }} {{ user.lastName }}</h3>
            <span class="username">@{{ user.username }}</span>
          </div>
        </div>

        <!-- name -->
        <div class="details-grid mt-2">
          <div class="detail-item">
            <div class="detail-label"><i class="bi bi-person"></i> ชื่อ</div>
            <div class="detail-value">{{ user.firstName }}</div>
          </div>

          <div class="detail-item">
            <div class="detail-label"><i class="bi bi-person-vcard"></i> นามสกุล</div>
            <div class="detail-value">{{ user.lastName }}</div>
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
            {{ formatDateTime(user.createdDate) }}
          </div>
        </div>

        <div class="date-card">
          <div class="date-label">
            <i class="bi bi-calendar-check"></i>
            วันที่เข้าสู่ระบบล่าสุด
          </div>
          <div class="date-value">
            {{ formatDateTime(user.lastLogin) }}
          </div>
        </div>
      </div>

      <!-- Roles Section -->
      <div class="roles-section">
        <h3 class="section-title">
          <i class="bi bi-person-gear"></i>
          สิทธิ์การใช้งาน
        </h3>
        <BaseDataTable
          :items="roles"
          :totalRecords="roles.length"
          :columns="columns"
          :paginator="false"
          class="custom-data-table"
        >
        </BaseDataTable>
      </div>

      <!-- Action Buttons สำหรับบันทึกรูปภาพ -->
      <div class="custom-submit-container mt-2">
        <button
          :class="[`btn btn-sm`, !isReadyUpdateProfile ? 'btn-secondary' : 'btn-green']"
          @click="onUpdateProfile"
          :disabled="!isReadyUpdateProfile"
        >
          <span class="bi bi-check-circle mr-2"></span>
          <span>บันทึก</span>
        </button>
        <button
          :class="[`btn btn-sm`, !isReadyUpdateProfile ? 'btn-secondary' : 'btn-green']"
          @click="onCancel"
          :disabled="!isReadyUpdateProfile"
        >
          <span class="bi bi-x-circle mr-2"></span>
          <span>ยกเลิก</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import { useUserApiStore } from '@/stores/modules/api/user/user-store.js'
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'

import { compressOptimalImage } from '@/services/helper/file/compress-image.js'

export default {
  components: {
    BaseDataTable
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
      return !this.user.isNew || !this.user.isActive
    },
    user() {
      const data = JSON.parse(localStorage.getItem('user-dk'))
      return data
    }
  },

  data() {
    return {
      roles: [],
      masterRoles: [],

      columns: [
        {
          field: 'name',
          header: 'ตำแหน่ง',
          sortable: false,
          width: '200px'
        },
        {
          field: 'description',
          header: 'รายละเอียด',
          sortable: false
        }
      ],

      // ข้อมูลเพิ่มเติมสำหรับการจัดการรูปภาพโปรไฟล์
      compressedImageFile: null,
      profileImage: null,
      originalProfileImage: null,
      showAvatarOptions: false,

      isReadyUpdateProfile: false,
      isUploading: false
    }
  },

  methods: {
    async fetchData() {
      await this.userStore.fetchGetUser()
    },
    mapUser() {
      console.log('User:', this.user)
      // init roles
      if (this.user.role && this.user.role.length > 0) {
        // this.roles = this.user.roles.map((item) => {
        //   return {
        //     id: item.id,
        //     name: item.name,
        //     description: item.description
        //   }
        // })
        this.roles = [...this.user.role]
      }
      console.log('Roles:', this.role)

      // init masterRoles
      if (this.user.masterRoles && this.user.masterRoles.length > 0) {
        this.masterRoles = [...this.user.masterRoles]
      }

      if (this.user.image) {
        //this.originalProfileImage = `data:image/png;base64,${this.user.image}`
        this.originalProfileImage = this.user.image
        this.profileImage = this.originalProfileImage
      }

      //console.log('User:', this.originalProfileImage)
    },

    // ---handle Page---
    getStatusSeverity(item) {
      if (!item) return ''
      if (item.isActive) {
        return 'status-success'
      }
      if (item.isNew) {
        return 'status-process'
      }
      return 'status-disable'
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

    getStatusName(item) {
      if (!item) return ''
      if (item.isActive) {
        return 'ใช้งาน'
      }
      if (item.isNew) {
        return 'รออนุมัติ'
      }
      return 'ไม่ใช้งาน'
    },

    formatDateTime(date) {
      return date ? formatDateTime(date) : '-'
    },

    formatDate(date) {
      return formatDate(date)
    },

    // --- Avatar Management Methods ---

    // เปิด file input เมื่อคลิกที่ avatar
    triggerFileInput() {
      this.showAvatarOptions = false
      this.$refs.fileInput.click()
    },

    async handleFileUpload(event) {
      const file = event.target.files[0]
      if (!file) return

      try {
        // บีบอัดรูปภาพ
        const compressedFile = await compressOptimalImage(file)
        console.log('Compressed file:', compressedFile)
        console.log('File size:', file.size, '=>', compressedFile.size)

        // เก็บไฟล์ที่บีบอัดแล้วไว้ใช้ในตอนส่ง
        this.compressedImageFile = compressedFile

        // อ่านเป็น Data URL เพื่อแสดงผลบนหน้าเว็บ
        const reader = new FileReader()
        reader.onload = (e) => {
          this.profileImage = e.target.result
          this.profileImageChanged = true
          this.isReadyUpdateProfile = true
        }
        reader.readAsDataURL(compressedFile)

        // รีเซ็ต input
        this.$refs.fileInput.value = ''
      } catch (error) {
        console.error('Error processing image:', error)
        alert('เกิดข้อผิดพลาดในการประมวลผลรูปภาพ')
      }
    },

    async onUpdateProfile() {
      let params = new FormData()
      params.append('Id', this.userAuth.user.id)

      if (this.compressedImageFile) {
        params.append('imageAction', 'update')
        params.append('Image', this.compressedImageFile)
      }

      // //else if (!this.profileImage) {
      //   // กรณีลบรูปภาพ
      //   params.append('image', null)
      //   params.append('imageAction', 'update')
      // }

      const res = await this.userStore.fetchUpdateAccount({
        formValue: params
      })

      if (res) {
        await this.fetchData()
        this.mapUser()
        this.onCancel()
      }
    },

    // จัดการเมื่อรูปภาพโหลดไม่สำเร็จ
    handleImageError() {
      this.profileImage = null
      this.user.profileImage = null
    },

    // ลบรูปภาพโปรไฟล์
    removeProfileImage() {
      this.profileImage = null
      this.showAvatarOptions = false
    },

    onCancel() {
      this.profileImage = this.originalProfileImage
      this.isReadyUpdateProfile = false
    }
  },

  async created() {
    this.$nextTick(async () => {
      const userData = JSON.parse(localStorage.getItem('user-dk'))
      if (userData) {
        this.mapUser()
      } else {
        await this.fetchData().then(() => {
          this.mapUser()
        })
      }
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
        cursor: pointer;
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
</style>
