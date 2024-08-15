const Layout = () => import('@/layout/web/LayoutDashboard.vue')

const stockGem = () => import('@/views/stock/gem/IndexView.vue')
const stockGemCreate = () => import('@/views/receipt-stock/gem/create/IndexView.vue')

const routes = [
  {
    path: '/stock-raw-material',
    component: Layout,
    redirect: '/stock-gem',
    name: 'stock',
    meta: {
      Displayname: {
        en: 'Stock Raw Material',
        th: 'คลังเพชรเเละพลอย'
      },
      classIcon: 'bi bi-database',
      majorShow: true,
      btsubLineShow: true
    },
    children: [
      {
        path: '/stock-gem',
        name: 'stock-gem',
        component: stockGem,
        meta: {
          Displayname: {
            en: 'Stock Gem',
            th: 'ตรวจคลัง'
          },
          minorShow: true,
          menuId: `stock-gem`
        }
      },
      {
        path: '/stock-gem-create',
        name: 'stock-gem-create',
        component: stockGemCreate,
        meta: {
          Displayname: {
            en: 'Stock Gem',
            th: 'สร้างรหัสใหม่'
          },
          minorShow: true,
          menuId: `stock-gem-create`
        }
      }
    ]
  }
]
export default routes
