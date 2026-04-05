<template>
  <div class="permission-matrix">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <span class="title-text">สิทธิ์ของ Role: {{ roleName }}</span>
      <button class="btn btn-sm btn-main" @click="onSave">
        <i class="bi bi-save"></i> บันทึก
      </button>
    </div>

    <div v-for="group in groupedPermissions" :key="group.name" class="permission-group mb-3">
      <div class="group-header d-flex justify-content-between align-items-center mb-2">
        <strong>{{ group.name }}</strong>
        <div>
          <button class="btn btn-sm btn-outline-main me-1" @click="selectAllInGroup(group)">
            เลือกทั้งหมด
          </button>
          <button class="btn btn-sm btn-outline-main" @click="deselectAllInGroup(group)">
            ยกเลิกทั้งหมด
          </button>
        </div>
      </div>
      <div class="row">
        <div
          v-for="perm in group.permissions"
          :key="perm.id"
          class="col-lg-4 col-md-6 mb-2"
        >
          <div class="form-check">
            <input
              class="form-check-input"
              type="checkbox"
              :id="'perm-' + perm.id"
              :checked="localSelected.includes(perm.id)"
              @change="togglePermission(perm.id)"
            />
            <label class="form-check-label" :for="'perm-' + perm.id">
              <span>{{ perm.name }}</span>
              <small class="text-muted d-block">{{ perm.code }}</small>
            </label>
          </div>
        </div>
      </div>
    </div>

    <div v-if="groupedPermissions.length === 0" class="text-center text-muted py-3">
      ไม่พบข้อมูลสิทธิ์
    </div>
  </div>
</template>

<script>
import { confirmSubmit } from '@/services/alert/sweetAlerts.js'

export default {
  name: 'PermissionMatrix',

  props: {
    allPermissions: {
      type: Array,
      default: () => []
    },
    selectedPermissionIds: {
      type: Array,
      default: () => []
    },
    roleName: {
      type: String,
      default: ''
    }
  },

  emits: ['save', 'change'],

  data() {
    return {
      localSelected: []
    }
  },

  computed: {
    groupedPermissions() {
      const groups = {}
      this.allPermissions.forEach((perm) => {
        const groupName = perm.groupName || 'Other'
        if (!groups[groupName]) {
          groups[groupName] = { name: groupName, permissions: [] }
        }
        groups[groupName].permissions.push(perm)
      })
      return Object.values(groups)
    }
  },

  watch: {
    selectedPermissionIds: {
      handler(val) {
        this.localSelected = [...(val || [])]
      },
      immediate: true
    }
  },

  methods: {
    togglePermission(permId) {
      const idx = this.localSelected.indexOf(permId)
      if (idx > -1) {
        this.localSelected.splice(idx, 1)
      } else {
        this.localSelected.push(permId)
      }
      this.$emit('change', this.localSelected)
    },

    selectAllInGroup(group) {
      group.permissions.forEach((perm) => {
        if (!this.localSelected.includes(perm.id)) {
          this.localSelected.push(perm.id)
        }
      })
      this.$emit('change', this.localSelected)
    },

    deselectAllInGroup(group) {
      const ids = group.permissions.map((p) => p.id)
      this.localSelected = this.localSelected.filter((id) => !ids.includes(id))
      this.$emit('change', this.localSelected)
    },

    onSave() {
      confirmSubmit(
        `ต้องการบันทึกสิทธิ์ของ ${this.roleName} หรือไม่?`,
        'ยืนยันการบันทึก',
        () => {
          this.$emit('save')
        }
      )
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.permission-group {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px 16px;
  background: #fafafa;
}

.group-header {
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 8px;
  margin-bottom: 8px;
}

.form-check-label {
  font-size: 0.85rem;
  cursor: pointer;

  small {
    font-size: 0.75rem;
  }
}
</style>
