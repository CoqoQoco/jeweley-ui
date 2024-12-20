// permissions/config.js
export const PERMISSIONS = {
  DASHBOARD: 'dashboard',

  // User Management
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_EDIT: 'user:edit',
  USER_DELETE: 'user:delete',

  //production
  PRODUCTION_VIEW: 'production:view',
  PRODUCTION_CREATE: 'production:create',
  PRODUCTION_EDIT: 'production:edit',

  // Mold Design
  MOLD_VIEW: 'mold:view',
  MOLD_CREATE: 'mold:create',
  MOLD_EDIT: 'mold:edit',

  //stock gem
  STOCK_GEM_VIEW: 'stock-gem:view',
  STOCK_GEM_CREATE: 'stock-gem:create',
  STOCK_GEM_EDIT: 'stock-gem:edit',

  //customer
  CUSTOMER_VIEW: 'customer:view',
  CUSTOMER_CREATE: 'customer:create',
  CUSTOMER_EDIT: 'customer:edit',

  //worker
  WORKER_VIEW: 'worker:view',
  WORKER_CREATE: 'worker:create',
  WORKER_EDIT: 'worker:edit',

  //report 
  REPORT_VIEW: 'report:view',

  //master 
  MASTER_VIEW: 'master:view',
  

}

// Role Permission Mapping
export const ROLE_PERMISSIONS = {
  Admin: [
    PERMISSIONS.DASHBOARD,

    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_EDIT,

    PERMISSIONS.PRODUCTION_VIEW,
    PERMISSIONS.PRODUCTION_CREATE,
    PERMISSIONS.PRODUCTION_EDIT,

    PERMISSIONS.MOLD_VIEW,
    PERMISSIONS.MOLD_CREATE,
    PERMISSIONS.MOLD_EDIT,

    PERMISSIONS.STOCK_GEM_VIEW,
    PERMISSIONS.STOCK_GEM_CREATE,
    PERMISSIONS.STOCK_GEM_EDIT,

    PERMISSIONS.CUSTOMER_VIEW,
    PERMISSIONS.CUSTOMER_CREATE,
    PERMISSIONS.CUSTOMER_EDIT,

    PERMISSIONS.WORKER_VIEW,
    PERMISSIONS.WORKER_CREATE,
    PERMISSIONS.WORKER_EDIT,

    PERMISSIONS.REPORT_VIEW,

    PERMISSIONS.MASTER_VIEW,
  ],
  Operator: [
    PERMISSIONS.DASHBOARD,

    PERMISSIONS.PRODUCTION_VIEW,
    PERMISSIONS.PRODUCTION_CREATE,
    PERMISSIONS.PRODUCTION_EDIT,

    PERMISSIONS.MOLD_VIEW,
    PERMISSIONS.MOLD_CREATE,
    PERMISSIONS.MOLD_EDIT,

    PERMISSIONS.STOCK_GEM_VIEW,
    PERMISSIONS.STOCK_GEM_CREATE,
    PERMISSIONS.STOCK_GEM_EDIT,

    PERMISSIONS.MOLD_VIEW,
    
    PERMISSIONS.CUSTOMER_VIEW,
    PERMISSIONS.CUSTOMER_CREATE,
    PERMISSIONS.CUSTOMER_EDIT,

    PERMISSIONS.REPORT_VIEW
  ]
}
