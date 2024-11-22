// permissions/config.js
export const PERMISSIONS = {
  DASHBOARD: 'dashboard',

  // User Management
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_EDIT: 'user:edit',
  USER_DELETE: 'user:delete',

  //Admin
  PRODUCT_VIEW: 'product:view'
}

// Role Permission Mapping
export const ROLE_PERMISSIONS = {
  Admin: [
    PERMISSIONS.DASHBOARD,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_EDIT
  ],
  Operator: [PERMISSIONS.DASHBOARD, PERMISSIONS.PRODUCT_VIEW]
}
