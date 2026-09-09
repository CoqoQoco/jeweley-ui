export default {
  companyInfo: {
    pageTitle: 'Company Info Settings',
    pageDescription: 'Central company information used on the header of every PDF document (Material Sale · Invoice Standard 2 · Billing Note) and contact/social media channels',
    sectionCompany: 'Company Information',
    sectionContact: 'Contact Channels',
    sectionSocial: 'Social Media',
    sectionBank: 'Bank Account',
    companyName: 'Company Name (EN)',
    companyNameTh: 'Company Name (TH)',
    branchLabel: 'Branch / Head Office',
    taxId: 'Tax ID',
    address: 'Address (EN)',
    addressTh: 'Address (TH)',
    phone: 'Phone',
    fax: 'Fax',
    email: 'Email',
    website: 'Website',
    facebook: 'Facebook',
    instagram: 'Instagram',
    tiktok: 'TikTok',
    lineOa: 'LINE OA',
    socialHint: 'Enter the account handle only, no need for the full link — the system will generate the link and QR Code for you.',
    qrBtn: 'QR',
    qrDialogTitle: 'QR Code',
    qrDownloadBtn: 'Download PNG',
    qrCopyBtn: 'Copy Link',
    qrCopiedLabel: 'Copied',
    qrOpenBtn: 'Open Link',
    bankName: 'Bank',
    accountName: 'Account Name',
    accountNumber: 'Account Number',
    swift: 'SWIFT',
    branch: 'Branch',
    accountNumberHint: 'Leave "Account Number" blank to hide the Payment Options box on documents',
    validation: {
      companyNameRequired: 'Please enter company name',
      companyNameThRequired: 'Please enter company name (Thai)',
      taxIdRequired: 'Please enter tax ID',
      addressRequired: 'Please enter address',
      addressThRequired: 'Please enter address (Thai)',
      emailInvalid: 'Invalid email format'
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
    alloySectionTitle: 'Alloy Calculation Parameters',
    alloyFactor18K: 'Alloy Factor 18K',
    alloyFactor14K: 'Alloy Factor 14K',
    alloyFactor9K: 'Alloy Factor 9K',
    alloyRateYgWgUsd: 'Alloy Rate YG/WG (USD/g)',
    alloyRatePgUsd: 'Alloy Rate PG (USD/g)',
    validation: {
      invalidNumber: 'Please enter a non-negative number'
    },
    saveSuccess: 'Break Down settings saved successfully',
    termHistory: {
      sectionTitle: 'Break Down Term History',
      confirmDeleteTitle: 'Confirm delete this term from history?',
      deleteSuccess: 'Term removed from history successfully'
    }
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
