const Layout = () => import('@/layout/web/LayoutDashboard.vue')

const AnnouncementList = () => import('@/views/announcement/index-view.vue')
const AnnouncementForm = () => import('@/views/announcement/form-view.vue')

import { PERMISSIONS } from '@/services/permission/config.js'

const routes = [
  // Dev/Admin: จัดการประกาศข่าว
  {
    path: '/announcement',
    component: Layout,
    redirect: '/announcement',
    name: 'announcement',
    meta: {
      Displayname: {
        th: 'ประกาศข่าว',
        en: 'Announcements'
      },
      classIcon: 'bi bi-megaphone',
      majorShow: true,
      menuSection: 'system',
      permissions: [PERMISSIONS.ANNOUNCEMENT_MANAGE]
    },
    children: [
      {
        path: '/announcement',
        name: 'announcement-list',
        component: AnnouncementList,
        meta: {
          Displayname: {
            th: 'ประกาศข่าว',
            en: 'Announcements'
          },
          minorShow: false,
          permissions: [PERMISSIONS.ANNOUNCEMENT_MANAGE]
        }
      },
      {
        path: '/announcement/create',
        name: 'announcement-create',
        component: AnnouncementForm,
        meta: {
          Displayname: {
            th: 'สร้างประกาศ',
            en: 'Create Announcement'
          },
          minorShow: false,
          permissions: [PERMISSIONS.ANNOUNCEMENT_MANAGE]
        }
      },
      {
        path: '/announcement/edit/:id',
        name: 'announcement-edit',
        component: AnnouncementForm,
        meta: {
          Displayname: {
            th: 'แก้ไขประกาศ',
            en: 'Edit Announcement'
          },
          minorShow: false,
          permissions: [PERMISSIONS.ANNOUNCEMENT_MANAGE]
        }
      }
    ]
  }
]

export default routes
