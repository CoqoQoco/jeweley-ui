<template>
  <div class="app-container">
    <div class="title-text mb-3">จัดการสิทธิ์การใช้งาน (Role - Permission)</div>

    <div class="row">
      <!-- Role Selector -->
      <div class="col-lg-3 col-md-4 mb-3">
        <roleSelector
          :roles="rolesWithPermissions"
          :selectedRoleId="selectedRoleId"
          @select="onSelectRole"
        />
      </div>

      <!-- Permission Matrix -->
      <div class="col-lg-9 col-md-8">
        <permissionMatrix
          v-if="selectedRole"
          :allPermissions="allPermissions"
          :selectedPermissionIds="selectedPermissionIds"
          :roleName="selectedRole.roleName"
          @save="onSave"
          @change="onPermissionChange"
        />
        <div v-else class="text-muted text-center py-5">
          กรุณาเลือก Role ด้านซ้ายเพื่อจัดการสิทธิ์
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import roleSelector from './components/role-selector.vue'
import permissionMatrix from './components/permission-matrix.vue'
import { usePermissionStore } from '@/stores/modules/api/permission/permission-store.js'
import { success } from '@/services/alert/sweetAlerts.js'

export default {
  name: 'RolePermission',

  components: {
    roleSelector,
    permissionMatrix
  },

  data() {
    return {
      allPermissions: [],
      rolesWithPermissions: [],
      selectedRoleId: null,
      selectedPermissionIds: []
    }
  },

  computed: {
    selectedRole() {
      return this.rolesWithPermissions.find((r) => r.roleId === this.selectedRoleId)
    }
  },

  methods: {
    onSelectRole(roleId) {
      this.selectedRoleId = roleId
      const role = this.rolesWithPermissions.find((r) => r.roleId === roleId)
      this.selectedPermissionIds = role ? role.permissions.map((p) => p.id) : []
    },

    onPermissionChange(permissionIds) {
      this.selectedPermissionIds = permissionIds
    },

    async onSave() {
      const store = usePermissionStore()
      await store.updateRolePermissions({
        roleId: this.selectedRoleId,
        permissionIds: this.selectedPermissionIds
      })

      success('บันทึกสิทธิ์สำเร็จ')

      // reload data
      await this.loadData()
      this.onSelectRole(this.selectedRoleId)
    },

    async loadData() {
      const store = usePermissionStore()
      const [permissions, roles] = await Promise.all([
        store.fetchAllPermissions(),
        store.fetchRolesWithPermissions()
      ])
      this.allPermissions = permissions || []
      this.rolesWithPermissions = roles || []
    }
  },

  async created() {
    await this.loadData()
  }
}
</script>

<style scoped>
.app-container {
  padding: 1rem;
}
</style>
