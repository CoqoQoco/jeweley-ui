const Layout = () => import('@/layout/web/LayoutDashboard.vue')

const TicketCreate = () => import('@/views/ticket/create-view.vue')
const TicketMyList = () => import('@/views/ticket/my-ticket-view.vue')
const TicketManageList = () => import('@/views/ticket/manage/index-view.vue')
const TicketManageDetail = () => import('@/views/ticket/manage/detail-view.vue')

import { PERMISSIONS } from '@/services/permission/config.js'

const routes = [
  // User: แจ้งปัญหา/ขอฟีเจอร์ (visible to ALL roles — no permissions check)
  {
    path: '/ticket-create',
    component: Layout,
    redirect: '/ticket-create',
    name: 'ticket-create-group',
    meta: {
      Displayname: {
        th: 'แจ้งปัญหา/ขอฟีเจอร์',
        en: 'Report / Request'
      },
      classIcon: 'bi bi-megaphone',
      majorShow: false
    },
    children: [
      {
        path: '/ticket-create',
        name: 'ticket-create',
        component: TicketCreate,
        meta: {
          Displayname: {
            th: 'แจ้งปัญหา/ขอฟีเจอร์',
            en: 'Report / Request'
          },
          minorShow: false
        }
      }
    ]
  },

  // User: Ticket ของฉัน (hidden from sidebar — accessible via tab in ticket-create page)
  {
    path: '/ticket-my',
    component: Layout,
    redirect: '/ticket-my',
    name: 'ticket-my-group',
    meta: {
      Displayname: {
        th: 'Ticket ของฉัน',
        en: 'My Tickets'
      },
      classIcon: 'bi bi-ticket-detailed',
      majorShow: false
    },
    children: [
      {
        path: '/ticket-my',
        name: 'ticket-my',
        component: TicketMyList,
        meta: {
          Displayname: {
            th: 'Ticket ของฉัน',
            en: 'My Tickets'
          },
          minorShow: false
        }
      }
    ]
  },

  // Dev: จัดการ Ticket
  {
    path: '/ticket-manage',
    component: Layout,
    redirect: '/ticket-manage',
    name: 'ticket-manage-group',
    meta: {
      Displayname: {
        th: 'จัดการ Ticket',
        en: 'Manage Tickets'
      },
      classIcon: 'bi bi-card-checklist',
      majorShow: false,
      permissions: [PERMISSIONS.TICKET_MANAGE]
    },
    children: [
      {
        path: '/ticket-manage',
        name: 'ticket-manage',
        component: TicketManageList,
        meta: {
          Displayname: {
            th: 'จัดการ Ticket',
            en: 'Manage Tickets'
          },
          minorShow: false,
          permissions: [PERMISSIONS.TICKET_MANAGE]
        }
      },
      {
        path: '/ticket-manage/:id',
        name: 'ticket-manage-detail',
        component: TicketManageDetail,
        meta: {
          Displayname: {
            th: 'รายละเอียด Ticket',
            en: 'Ticket Detail'
          },
          minorShow: false,
          permissions: [PERMISSIONS.TICKET_MANAGE]
        }
      }
    ]
  }
]

export default routes
