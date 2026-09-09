export default {
  feed: {
    title: 'Announcements',
    emptyTitle: 'No announcements yet',
    emptyHint: 'Company news will show up here first.',
    emptyHintManager: 'Create the first announcement so everyone sees it on the home page.',
    createFirst: 'Create first announcement',
    tipPin: 'Pin important news to the top',
    tipSchedule: 'Schedule start and expiry dates',
    tipImage: 'Attach one image',
    loadMore: 'Load more ({remaining} left)',
    manage: 'Manage Announcements',
    readMore: 'Read more',
    by: 'By {name}'
  },

  pinnedTag: 'Pinned',
  devOnlyTag: 'Dev only',

  list: {
    title: 'Manage Announcements',
    description: "Create, edit, hide, or delete announcements shown on everyone's home page",
    keyword: 'Keyword',
    keywordPlaceholder: 'Title/body',
    status: 'Status',
    pinned: 'Pinned',
    audience: 'Audience',
    create: 'Create Announcement',
    col: {
      id: '#',
      title: 'Title',
      pinned: 'Pinned',
      window: 'Publish Window',
      status: 'Status',
      createBy: 'Created By',
      action: ''
    },
    noEnd: 'Never expires'
  },

  field: {
    title: 'Title',
    body: 'Body',
    bodyHint: 'Line breaks are preserved as typed',
    publishStart: 'Publish Start',
    publishEnd: 'Publish End',
    publishEndHint: 'Leave empty = never expires',
    isPinned: 'Pin to top',
    isPublished: 'Show on home page immediately',
    isPublishedHint: 'Unchecked = keep as draft',
    image: 'Image (optional)',
    imageHint: 'jpg/png, max 5 MB, 1 image',
    audience: 'Who can see this',
    audienceHint: 'Choose "Dev only" to preview it on the real home page, then edit to "Everyone" when ready.'
  },

  audience: {
    all: 'Everyone',
    dev: 'Dev only (preview)',
    filterAll: 'All'
  },

  status: {
    all: 'All',
    visible: 'Visible',
    hidden: 'Hidden',
    scheduled: 'Scheduled',
    expired: 'Expired'
  },

  pinnedFilter: {
    all: 'All',
    yes: 'Pinned',
    no: 'Not pinned'
  },

  form: {
    createTitle: 'Create Announcement',
    editTitle: 'Edit Announcement',
    section: {
      detail: 'Details',
      display: 'Display',
      image: 'Image'
    }
  },

  action: {
    edit: 'Edit',
    hide: 'Hide',
    show: 'Show',
    delete: 'Delete',
    removeImage: 'Remove Image',
    chooseImage: 'Choose Image',
    save: 'Save Announcement',
    cancel: 'Cancel',
    close: 'Close'
  },

  confirm: {
    delete: 'Are you sure you want to delete this announcement?',
    save: 'Are you sure you want to save this announcement?',
    hide: 'Are you sure you want to hide this announcement?',
    show: 'Are you sure you want to show this announcement?'
  },

  alert: {
    saved: 'Announcement saved',
    deleted: 'Announcement deleted',
    endBeforeStart: 'End date must not be before the start date',
    required: 'Please fill in all required fields'
  }
}
