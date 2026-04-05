<template>
  <div class="role-selector">
    <div class="title-text mb-2">Roles</div>
    <div class="list-group">
      <button
        v-for="role in roles"
        :key="role.roleId"
        class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
        :class="{ active: selectedRoleId === role.roleId }"
        @click="$emit('select', role.roleId)"
      >
        <div>
          <strong>{{ role.roleName }}</strong>
          <small v-if="role.description" class="d-block text-muted">{{ role.description }}</small>
        </div>
        <span class="badge bg-secondary">{{ role.permissions.length }}</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RoleSelector',

  props: {
    roles: {
      type: Array,
      default: () => []
    },
    selectedRoleId: {
      type: Number,
      default: null
    }
  },

  emits: ['select']
}
</script>

<style lang="scss" scoped>
.list-group-item {
  cursor: pointer;
  font-size: 0.9rem;

  &.active {
    background-color: var(--base-font-color);
    border-color: var(--base-font-color);
  }

  .badge {
    font-size: 0.75rem;
  }
}
</style>
