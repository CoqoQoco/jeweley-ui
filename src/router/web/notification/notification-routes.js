const Layout = () => import('@/layout/web/LayoutDashboard.vue')

const NotificationList = () => import('@/views/notification/index-view.vue')

const routes = [
  // User: ศูนย์การแจ้งเตือนของฉัน (เข้าถึงผ่านกระดิ่งบน main-bar — visible to ALL roles)
  {
    path: '/notifications',
    component: Layout,
    redirect: '/notifications',
    name: 'notification-list-group',
    meta: {
      Displayname: {
        th: 'การแจ้งเตือน',
        en: 'Notifications'
      },
      classIcon: 'bi bi-bell',
      majorShow: false
    },
    children: [
      {
        path: '/notifications',
        name: 'notification-list',
        component: NotificationList,
        meta: {
          Displayname: {
            th: 'การแจ้งเตือน',
            en: 'Notifications'
          },
          minorShow: false
        }
      }
    ]
  }
]

export default routes
