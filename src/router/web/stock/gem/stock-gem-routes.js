const Layout = () => import('@/layout/web/LayoutDashboard.vue')
const Dashboard = () => import('@/views/dashboard/WelcomePage.vue')

const stockGem = () => import('@/views/stock/gem/IndexView.vue')
const stockGemTransection = () => import('@/views/receipt-stock/gem/transection/IndexView.vue')
const stockGemInbound = () => import('@/views/receipt-stock/gem/inbound/IndexView.vue')
const stockGemOutbound = () => import('@/views/receipt-stock/gem/outbound/IndexView.vue')
//const stockGemCreate = () => import('@/views/receipt-stock/gem/create/IndexView.vue')

const routes = [
  {
    path: '/stock-raw-material',
    component: Layout,
    redirect: '/stock-gem',
    name: 'stock',
    sectionid: 'STOCK-GEM',
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
        path: '/stock-gem-list',
        name: 'stock-gem-list',
        component: stockGem,
        menuId: 'List',
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
        path: '/stock-gem-transection',
        name: 'stock-gem-transection',
        component: stockGemTransection,
        menuId: 'STOCK-GEM-TRANSECTION',
        meta: {
          Displayname: {
            en: 'Transection',
            th: 'รายการเคลื่อนไหว'
          },
          minorShow: true,
          menuId: `stock-gem-transection`
        }
      },
      {
        path: '/stock-gem-inbound',
        name: 'stock-gem-inbound',
        component: stockGemInbound,
        menuId: 'STOCK-GEM-INBOUND',
        meta: {
          Displayname: {
            en: 'Inbound',
            th: 'รับเข้าคลัง'
          },
          minorShow: true,
          menuId: `stock-gem-inbound`
        }
      },
      {
        path: '/stock-gem-outbound',
        name: 'stock-gem-outbound',
        component: stockGemOutbound,
        menuId: 'STOCK-GEM-OUTBOUND',
        meta: {
          Displayname: {
            en: 'Outbound',
            th: 'จ่ายออกคลัง'
          },
          minorShow: true,
          menuId: `stock-gem-outbound`
        }
      }
    ]
  }
]
export default routes
