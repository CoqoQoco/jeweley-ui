// permissions/service.js
import { PERMISSIONS, ROLE_PERMISSIONS } from './config.js'

export class PermissionService {
  constructor(user) {
    this.user = user
    this.userPermissions = this.getUserPermissions()
  }

  getUserPermissions() {
    if (!this.user?.role) return []
    
    // รวม permissions จากทุก role ของ user
    return this.user.role.reduce((permissions, role) => {
      const rolePermissions = ROLE_PERMISSIONS[role.name] || []
      return [...permissions, ...rolePermissions]
    }, [])
  }

  hasPermission(requiredPermission) {
    if (!requiredPermission) return true
    return this.userPermissions.includes(requiredPermission)
  }

  hasAnyPermission(requiredPermissions) {
    if (!requiredPermissions?.length) return true
    return requiredPermissions.some(permission => 
      this.userPermissions.includes(permission)
    )
  }

  hasAllPermissions(requiredPermissions) {
    if (!requiredPermissions?.length) return true
    return requiredPermissions.every(permission => 
      this.userPermissions.includes(permission)
    )
  }
}