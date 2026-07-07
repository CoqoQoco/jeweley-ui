<template>
  <div class="app-container">
    <div class="page-header-bar">
      <h2 class="page-title">{{ $t('setting.userAccount.title') }}</h2>
      <div class="status-badge" :class="getStatusSeverity(user)">
        <i :class="getStatusIcon(user)"></i>
        {{ getStatusName(user) }}
      </div>
    </div>

    <SectionCardGeneric
      :title="$t('setting.userAccount.accountInfo')"
      icon="bi-person-lines-fill"
      accent="main"
      headerStyle="legend"
      class="mb-3"
    >
      <div class="account-grid">
        <div class="identity-panel">
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

              <div class="avatar-overlay" @click="triggerFileInput">
                <i class="bi bi-camera"></i>
                <span>{{ $t('setting.userAccount.changePhoto') }}</span>
              </div>
            </div>

            <div class="avatar-options" v-if="showAvatarOptions">
              <div class="option" @click="removeProfileImage" v-if="profileImage || user.image">
                <i class="bi bi-trash"></i>
                <span>{{ $t('setting.userAccount.removePhoto') }}</span>
              </div>
              <div class="option-cancel" @click="showAvatarOptions = false">
                <i class="bi bi-x"></i>
                <span>{{ $t('common.btn.cancel') }}</span>
              </div>
            </div>

            <input
              type="file"
              ref="fileInput"
              accept="image/*"
              class="file-input"
              @change="handleFileUpload"
            />
          </div>

          <div class="user-info">
            <h3 class="fullname">{{ user.firstName }} {{ user.lastName }}</h3>
            <span class="username">@{{ user.username }}</span>
          </div>
        </div>

        <div class="detail-panel">
          <div class="detail-row">
            <span class="title-text">{{ $t('setting.userAccount.firstName') }}</span>
            <div class="detail-value">{{ user.firstName }}</div>
          </div>
          <div class="detail-row">
            <span class="title-text">{{ $t('setting.userAccount.lastName') }}</span>
            <div class="detail-value">{{ user.lastName }}</div>
          </div>
        </div>
      </div>
    </SectionCardGeneric>

    <SectionCardGeneric
      :title="$t('setting.userAccount.loginInfo')"
      icon="bi-calendar-check"
      accent="main"
      headerStyle="legend"
      class="mb-3"
    >
      <div class="form-row two-col">
        <div class="form-field">
          <span class="title-text">{{ $t('setting.userAccount.registerDate') }}</span>
          <div class="detail-value">{{ formatDateTime(user.createdDate) }}</div>
        </div>
        <div class="form-field">
          <span class="title-text">{{ $t('setting.userAccount.lastLoginDate') }}</span>
          <div class="detail-value">{{ formatDateTime(user.lastLogin) }}</div>
        </div>
      </div>
    </SectionCardGeneric>

    <SectionCardGeneric
      :title="$t('setting.userAccount.rolePermission')"
      icon="bi-person-gear"
      accent="main"
      headerStyle="legend"
      class="mb-3"
    >
      <div class="responsive-table-wrapper">
        <BaseDataTable :items="roles" :totalRecords="roles.length" :columns="columns" :paginator="false" />
      </div>
    </SectionCardGeneric>

    <div class="footer-actions">
      <ButtonGeneric
        variant="main"
        icon="bi-save"
        :label="$t('common.btn.save')"
        :disabled="!isReadyUpdateProfile"
        @click="onUpdateProfile"
      />
      <ButtonGeneric
        variant="outline"
        :label="$t('common.btn.cancel')"
        class="ml-2"
        :disabled="!isReadyUpdateProfile"
        @click="onCancel"
      />
    </div>
  </div>
</template>

<script>
import { useUserApiStore } from '@/stores/modules/api/user/user-store.js'
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { formatDateTime } from '@/services/utils/dayjs.js'
import { storage } from '@/services/storage.js'
import { compressOptimalImage } from '@/services/helper/file/compress-image.js'
import { error, success } from '@/services/alert/sweetAlerts.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  components: {
    BaseDataTable,
    SectionCardGeneric,
    ButtonGeneric
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
    user() {
      return storage.getJSON('user-dk')
    },

    columns() {
      return [
        {
          field: 'name',
          header: this.$t('setting.userAccount.roleName'),
          sortable: false,
          width: '200px'
        },
        {
          field: 'description',
          header: this.$t('setting.userAccount.roleDesc'),
          sortable: false
        }
      ]
    }
  },

  data() {
    return {
      roles: [],
      masterRoles: [],

      compressedImageFile: null,
      profileImage: null,
      originalProfileImage: null,
      showAvatarOptions: false,

      isReadyUpdateProfile: false
    }
  },

  methods: {
    async fetchData() {
      await this.userStore.fetchGetUser()
    },

    mapUser() {
      if (this.user.role && this.user.role.length > 0) {
        this.roles = [...this.user.role]
      }

      if (this.user.masterRoles && this.user.masterRoles.length > 0) {
        this.masterRoles = [...this.user.masterRoles]
      }

      if (this.user.image) {
        this.originalProfileImage = this.user.image
        this.profileImage = this.originalProfileImage
      }
    },

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
        return this.$t('setting.userAccount.status.active')
      }
      if (item.isNew) {
        return this.$t('setting.userAccount.status.pending')
      }
      return this.$t('setting.userAccount.status.inactive')
    },

    formatDateTime(date) {
      return date ? formatDateTime(date) : '-'
    },

    triggerFileInput() {
      this.showAvatarOptions = false
      this.$refs.fileInput.click()
    },

    async handleFileUpload(event) {
      const file = event.target.files[0]
      if (!file) return

      try {
        const compressedFile = await compressOptimalImage(file)
        this.compressedImageFile = compressedFile

        const reader = new FileReader()
        reader.onload = (e) => {
          this.profileImage = e.target.result
          this.profileImageChanged = true
          this.isReadyUpdateProfile = true
        }
        reader.readAsDataURL(compressedFile)

        this.$refs.fileInput.value = ''
      } catch {
        error(this.$t('setting.userAccount.imageError'))
      }
    },

    onUpdateProfile() {
      confirmThenSubmit(
        `${this.user.firstName} ${this.user.lastName}`,
        this.$t('setting.userAccount.confirmSaveTitle'),
        async () => {
          let params = new FormData()
          params.append('Id', this.userAuth.user.id)

          if (this.compressedImageFile) {
            params.append('imageAction', 'update')
            params.append('Image', this.compressedImageFile)
          }

          const res = await this.userStore.fetchUpdateAccount({
            formValue: params
          })

          if (res) {
            await this.fetchData()
            this.mapUser()
            this.onCancel()
            success(this.$t('setting.userAccount.saveSuccess'))
          }
        }
      )
    },

    handleImageError() {
      this.profileImage = null
      this.user.profileImage = null
    },

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
      const userData = storage.getJSON('user-dk')
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
@import '@/assets/scss/mixin.scss';
@import '@/assets/scss/responsive-style/web';

.app-container {
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  padding: var(--sp-xl);
}

.page-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-sm);
  padding: var(--sp-md) var(--sp-lg);
  background: var(--surface-inverse);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--sp-lg);

  .page-title {
    margin: 0;
    font-size: var(--fs-xl);
    font-weight: 600;
    color: var(--on-inverse);
  }
}

.status-badge {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  padding: var(--sp-sm) var(--sp-lg);
  border-radius: var(--radius-lg);
  font-size: var(--fs-base);
  font-weight: 500;
  color: var(--on-inverse);
  background: var(--overlay-white-solid);

  &.status-success {
    background-color: var(--base-green);
  }

  &.status-process {
    color: rgba(2, 2, 2, 0.753);
    background-color: var(--base-warning);
  }

  &.status-disable {
    background-color: var(--base-red);
  }
}

.account-grid {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: var(--sp-lg);
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.identity-panel {
  background: var(--color-highlight-bg);
  border-radius: var(--radius-md);
  padding: var(--sp-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-md);

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
      color: #ffffff;
      position: relative;
      overflow: hidden;
      cursor: pointer;
      box-shadow: var(--shadow-sm);
      border: 3px solid var(--color-card-bg);

      i {
        font-size: 2.6rem;
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
        color: #ffffff;

        i {
          font-size: var(--fs-xl);
          margin-bottom: var(--sp-xs);
        }

        span {
          font-size: var(--fs-sm);
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
      background-color: var(--color-card-bg);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-md);
      padding: var(--sp-sm) 0;
      z-index: 10;
      width: 150px;

      .option,
      .option-cancel {
        display: flex;
        align-items: center;
        padding: var(--sp-sm) var(--sp-lg);
        cursor: pointer;

        i {
          margin-right: var(--sp-sm);
          font-size: var(--fs-sm);
        }

        span {
          font-size: var(--fs-sm);
        }

        &:hover {
          background-color: var(--color-highlight-bg);
        }
      }

      .option-cancel {
        border-top: 1px solid var(--color-border);
        margin-top: var(--sp-sm);
        padding-top: var(--sp-sm);
        color: var(--base-sub-color);
      }
    }

    .file-input {
      display: none;
    }
  }

  .user-info {
    text-align: center;

    h3 {
      margin: 0 0 var(--sp-xs) 0;
      font-size: var(--fs-xl);
      font-weight: 500;
    }

    .fullname {
      color: var(--base-font-color);
    }

    .username {
      color: var(--base-sub-color);
      font-size: var(--fs-base);
    }
  }
}

.detail-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.detail-row {
  padding: var(--sp-sm) 0;
  border-bottom: 1px solid var(--color-border);

  &:last-child {
    border-bottom: none;
  }

  .detail-value {
    font-size: var(--fs-base);
    font-weight: 500;
    color: var(--base-sub-color);
  }
}

.form-row {
  @include form-row-grid(2);
}

.form-field {
  width: 100%;

  .detail-value {
    font-size: var(--fs-base);
    font-weight: 500;
    color: var(--base-sub-color);
  }
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: var(--sp-lg);

  @media (max-width: 768px) {
    flex-direction: column;

    :deep(button) {
      width: 100%;
    }

    :deep(.ml-2) {
      margin-left: 0;
      margin-top: var(--sp-sm);
    }
  }
}
</style>
