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
              <!-- แสดงรูปภาพโปรไฟล์ถ้ามี หรือไอคอนถ้าไม่มี -->
              <img
                v-if="profileImage || data.profileImage"
                :src="profileImage || data.profileImage"
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
              <div class="option" @click="triggerFileInput">
                <i class="bi bi-upload"></i>
                <span>อัปโหลดรูป</span>
              </div>
              <div
                class="option"
                @click="removeProfileImage"
                v-if="profileImage || data.profileImage"
              >
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
      <div class="action-buttons" v-if="profileImageChanged">
        <button class="btn btn-sm btn-main" @click="saveProfileImage">
          <span class="bi bi-check-circle mr-2"></span>
          <span>บันทึก</span>
        </button>
      </div>
    </div>

    <!-- Modal สำหรับการตัดรูปภาพ (ถ้าต้องการเพิ่มในอนาคต) -->
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
      profileImage: null,
      originalProfileImage: null,
      profileImageChanged: false,
      showAvatarOptions: false,
      isUploading: false
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
        this.originalProfileImage = res.profileImage || null

        // init roles
        if (res.roles && res.roles.length > 0) {
          this.roles = res.roles.map((item) => {
            return {
              id: item.id,
              name: item.name,
              description: item.description
            }
          })
        }

        // init masterRoles
        if (res.masterRoles && res.masterRoles.length > 0) {
          this.masterRoles = [...res.masterRoles]
        }
      }
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

    // จัดการเมื่อมีการอัปโหลดไฟล์
    async handleFileUpload(event) {
      const file = event.target.files[0]
      if (!file) return

      const compressedFile = await compressOptimalImage(file)

      // สร้าง URL สำหรับแสดงรูปภาพ
      const reader = new FileReader()
      reader.onload = () => {
        this.profileImage = compressedFile
        this.profileImageChanged = true
      }
      reader.readAsDataURL(file)

      // รีเซ็ต input เพื่อให้สามารถอัปโหลดไฟล์เดิมซ้ำได้
      this.$refs.fileInput.value = ''
    },

    // จัดการเมื่อรูปภาพโหลดไม่สำเร็จ
    handleImageError() {
      this.profileImage = null
      this.data.profileImage = null
    },

    // ลบรูปภาพโปรไฟล์
    removeProfileImage() {
      this.profileImage = null
      this.profileImageChanged = true
      this.showAvatarOptions = false
    },

    // บันทึกการเปลี่ยนแปลงรูปภาพ
    async saveProfileImage() {
      try {
        this.isUploading = true

        // ส่งข้อมูลไปยัง API (ปรับใช้ตามโครงสร้าง API ของคุณ)
        await this.userStore.updateProfileImage({
          id: this.userAuth.user.id,
          profileImage: this.profileImage
        })

        // อัปเดตข้อมูลผู้ใช้
        this.data.profileImage = this.profileImage
        this.originalProfileImage = this.profileImage
        this.profileImageChanged = false
        this.isUploading = false

        // แสดงข้อความสำเร็จ (ใช้ library ที่คุณใช้งาน)
        // เช่น this.$message.success('อัปเดตรูปภาพเรียบร้อยแล้ว')
        alert('บันทึกรูปภาพเรียบร้อยแล้ว')
      } catch (error) {
        console.error('Error updating profile image:', error)
        // แสดงข้อความผิดพลาด
        alert('เกิดข้อผิดพลาดในการบันทึกรูปภาพ')
        this.isUploading = false
      }
    },

    // ยกเลิกการเปลี่ยนแปลงรูปภาพ
    cancelProfileImageChange() {
      this.profileImage = this.originalProfileImage
      this.profileImageChanged = false
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

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px 24px;
  background-color: #f8f9fa;

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

    &.btn-save {
      background-color: var(--base-font-color);
      color: white;

      &:hover {
        background-color: darken(#28a745, 5%);
      }
    }

    &.btn-cancel {
      background-color: #f8f9fa;
      color: #dc3545;
      border: 1px solid #dc3545;

      &:hover {
        background-color: #dc3545;
        color: white;
      }
    }
  }
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
