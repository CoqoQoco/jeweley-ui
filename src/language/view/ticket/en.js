export default {
  createTitle: 'Report Issue / Request Feature',
  myTicketTitle: 'My Tickets',

  tab: {
    report: 'Report',
    my: 'My Tickets'
  },
  manageTitle: 'Manage Tickets',
  manageDesc: 'Track and manage all issue/feature tickets',
  myTicketDesc: 'Issue/feature tickets you created',
  detailTitle: 'Ticket Detail',

  field: {
    ticketNo: 'Ticket No.',
    type: 'Type',
    topic: 'Menu Topic',
    title: 'Issue Title',
    description: 'Description',
    screenshot: 'Screenshot / Image',
    status: 'Status',
    devAnalysis: 'Dev Analysis',
    devResponse: 'Dev Response',
    createBy: 'Reported By',
    createDate: 'Date Reported',
    updateDate: 'Last Updated',
    changeStatus: 'Change Status',
    latestAnalysis: 'Latest Analysis',
    keyword: 'Search'
  },

  type: {
    bug: 'Bug Report',
    feature: 'Feature Request'
  },

  status: {
    open: 'Open',
    inProgress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed',
    cancelled: 'Cancelled'
  },

  placeholder: {
    type: 'Select type',
    topic: 'Select related menu',
    title: 'Brief title e.g.: Save button not working',
    description: 'Describe the issue or what feature you need...',
    status: 'All statuses',
    keyword: 'Search by title, description...'
  },

  btn: {
    submit: 'Submit Ticket',
    updateStatus: 'Update Status',
    saveDev: 'Save Dev Info'
  },

  confirm: {
    submit: 'Confirm Submit Ticket',
    updateStatus: 'Confirm Status Update',
    saveDev: 'Confirm Save Dev Info'
  },

  success: {
    submit: 'Ticket submitted successfully',
    updateStatus: 'Status updated successfully',
    saveDev: 'Dev info saved successfully'
  },

  warning: {
    typeRequired: 'Please select a type',
    topicRequired: 'Please select a related menu',
    titleRequired: 'Please enter an issue title',
    descriptionRequired: 'Please enter a description',
    requiredFields: 'Please fill in all required fields',
    imageTypeInvalid: 'Invalid file type. Please select an image file.',
    imageSizeExceeded: 'Image is too large (max {max} MB)'
  },

  section: {
    detail: 'Issue Details',
    images: 'Screenshot / Images'
  },

  label: {
    userManualPlaceholder: 'User manual button (user-manual skill)',
    addImage: 'Add Image',
    maxImages: 'Max {max} images',
    noImage: 'No images'
  },

  log: {
    title: 'Edit Log',
    addBtn: 'Add Note',
    placeholder: 'Type what was fixed / how it was fixed...',
    actionStatus: 'Status changed',
    actionDev: 'Dev info updated',
    actionNote: 'Note',
    empty: 'No log entries yet',
    success: {
      add: 'Note added successfully'
    }
  },

  thread: {
    analysisTitle: 'Dev Analysis',
    responseTitle: 'Response to Reporter',
    replyTitle: 'Response from Dev Team',
    changeTitle: 'Changes Made',
    progressTitle: 'Progress',
    addBtn: 'Add',
    sendBtn: 'Send',
    placeholder: 'Type a message...',
    empty: 'No entries yet',
    roleDev: 'Dev Team',
    roleUser: 'Reporter',
    systemBadge: 'System',
    deleteBtn: 'Delete',
    confirmDelete: 'Confirm delete this comment?',
    success: {
      add: 'Saved successfully',
      delete: 'Deleted successfully'
    }
  },

  statusModal: {
    title: 'Change Ticket Status',
    required: 'Please select a status'
  },

  dashboard: {
    title: 'Ticket Overview',
    subtitle: 'Overview of all ticket statuses and trends',
    refresh: 'Refresh',
    period: {
      label: 'Period',
      days7: 'Last 7 days',
      days30: 'Last 30 days',
      days90: 'Last 90 days',
      all: 'All time'
    },
    kpi: {
      total: 'Total',
      pending: 'Pending',
      resolved: 'Resolved',
      resolvedRate: 'Resolution Rate',
      unanalyzed: 'Unanalyzed'
    },
    chart: {
      byStatus: 'By Status',
      byTopic: 'By Module',
      trend: 'Daily Trend',
      aging: 'Ticket Age'
    },
    legend: {
      created: 'New',
      resolved: 'Resolved'
    },
    type: {
      bug: 'Bug',
      feature: 'Feature'
    },
    aging: {
      today: 'Today',
      days1to3: '1-3 days',
      days4to7: '4-7 days',
      over7: 'Over 7 days'
    },
    unit: {
      items: 'items'
    }
  },

  manual: {
    title: 'How to Report an Issue / Request a Feature',
    btnLabel: 'Guide',
    step1Title: 'Select Type',
    step1Desc: 'Choose whether you are reporting a Bug or requesting a new Feature using the "Type" dropdown.',
    step2Title: 'Select Menu Topic',
    step2Desc: 'Select the menu in the system related to the issue or feature request, e.g. "Stock Management", "Production Order".',
    step3Title: 'Fill in Title and Description',
    step3Desc: 'Enter a brief "Issue Title" such as "Save button not working", then fill in the "Description" with detailed steps to reproduce the issue, or describe the feature you need.',
    step4Title: 'Attach Screenshot (optional)',
    step4Desc: 'Click "Select Image" to attach a screenshot or image. Maximum size is 5 MB. This step is optional but helps the development team understand the issue faster.',
    step5Title: 'Submit Ticket and Track Status',
    step5Desc: 'Click "Submit Ticket" to save. You can track progress under "My Tickets" in the left navigation menu.'
  }
}
