export default {
  searchTitle: 'Customer List',
  searchDesc: 'Search and manage customers',
  createTitle: 'Add Customer',
  editTitle: 'Edit Customer',
  createBtn: 'Add Customer',

  field: {
    customerCode: 'Customer Code',
    nameTh: 'Name (Thai)',
    nameEn: 'Name (English)',
    customerType: 'Customer Type',
    address: 'Address',
    tel1: 'Phone 1',
    tel2: 'Phone 2',
    email: 'E-mail',
    contact: 'Contact Person',
    productionPlanCount: 'Production Orders',
    saleCount: 'Sales',
    discount: 'Discount (%)'
  },

  placeholder: {
    search: 'EX: Customer name, customer code ...',
    customerType: 'Select customer type',
    customerTypeFilter: 'Select customer type',
    discountMin: 'Min discount',
    discountMax: 'Max discount'
  },

  confirm: {
    create: 'Confirm Add Customer',
    edit: 'Confirm Edit Customer'
  },

  success: {
    create: 'Customer created successfully',
    edit: 'Customer updated successfully'
  },

  section: {
    main: 'Main Info',
    contact: 'Contact',
    sale: 'Sales'
  },

  validation: {
    customerTypeRequired: 'Please select customer type',
    discountRange: 'Discount must be an integer 0–99'
  }
}
