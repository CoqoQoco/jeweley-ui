export default {
  companyInfo: {
    pageTitle: 'Company Info Settings',
    pageDescription: 'This information appears on the header of every PDF document (Material Sale · Invoice Standard 2 · Billing Note)',
    sectionCompany: 'Company Information',
    sectionBank: 'Bank Account',
    companyName: 'Company Name',
    taxId: 'Tax ID',
    address: 'Address',
    phone: 'Phone',
    fax: 'Fax',
    email: 'Email',
    bankName: 'Bank',
    accountName: 'Account Name',
    accountNumber: 'Account Number',
    swift: 'SWIFT',
    branch: 'Branch',
    accountNumberHint: 'Leave "Account Number" blank to hide the Payment Options box on documents',
    validation: {
      companyNameRequired: 'Please enter company name',
      taxIdRequired: 'Please enter tax ID',
      addressRequired: 'Please enter address'
    },
    saveSuccess: 'Company information saved successfully',
    confirmSaveTitle: 'Confirm save company information'
  },
  breakdown: {
    pageTitle: 'Break Down Setting',
    pageDescription: 'Configure the Gold Loss (%) and diamond/stone setting rates used to calculate the Breakdown document',
    sectionTitle: 'Break Down Parameters',
    goldLossPercent: 'Gold Loss (%)',
    settingDiamondRate: 'Diamond Setting Rate (THB/pcs)',
    settingStoneRate: 'Stone Setting Rate (THB/pcs)',
    validation: {
      invalidNumber: 'Please enter a non-negative number'
    },
    saveSuccess: 'Break Down settings saved successfully'
  },
  account: {
    cancelAccount: 'Cancel Account',
    register: 'Register Account',
    editAccount: 'Edit Account'
  },
  rolePermission: {
    title: 'Manage Permissions (Role - Permission)',
    selectRolePrompt: 'Please select a Role on the left to manage permissions',
    saveSuccess: 'Permissions saved successfully'
  },
  userAccount: {
    title: 'Account Information',
    accountInfo: 'Account Information',
    loginInfo: 'Login Information',
    rolePermission: 'Role Permission',
    changePhoto: 'Change Photo',
    removePhoto: 'Remove Photo',
    firstName: 'First Name',
    lastName: 'Last Name',
    registerDate: 'Register Date',
    lastLoginDate: 'Last Login Date',
    roleName: 'Role',
    roleDesc: 'Description',
    confirmSaveTitle: 'Confirm save profile picture',
    saveSuccess: 'Profile picture saved successfully',
    imageError: 'An error occurred while processing the image',
    status: {
      active: 'Active',
      pending: 'Pending',
      inactive: 'Inactive'
    }
  }
}
