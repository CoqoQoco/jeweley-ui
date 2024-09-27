const Layout = () => import('@/layout/web/LayoutDashboard.vue')
//const Dashboard = () => import('@/views/dashboard/WelcomePage.vue')

const stockGem = () => import('@/views/stock/gem/IndexView.vue')
const stockGemTransection = () => import('@/views/receipt-stock/gem/transection/IndexView.vue')

const stockGemInbound = () => import('@/views/receipt-stock/gem/inbound/IndexView.vue')
const stockGemOutbound = () => import('@/views/receipt-stock/gem/outbound/IndexView.vue')

const stockGemPickOff = () => import('@/views/receipt-stock/gem/pick-off/IndexView.vue')
const stockGemPickReturnAndOutbound = () =>
  import('@/views/receipt-stock/gem/pick-return-and-outbound/IndexView.vue')
const stockGemPickReturnAndOutboundCreate = () =>
  import(
    '@/views/receipt-stock/gem/pick-return-and-outbound/components/create/PickReturnAndOutbound.vue'
  )

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
      classIcon: 'bi bi-gem',
      majorShow: true,
      btsubLineShow: true
    },
    children: [
      // stock Gem
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

      // transection gem
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

      // inbound
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

      // outbound
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
      },

      // pick-off
      {
        path: '/stock-gem-pick-off',
        name: 'stock-gem-pick-off',
        component: stockGemPickOff,
        menuId: 'STOCK-GEM-PICK-OFF',
        meta: {
          Displayname: {
            en: 'Pick Off',
            th: 'ยืมออกคลัง'
          },
          minorShow: true,
          menuId: `stock-gem-pick-off`
        }
      },
      // pick-return
      {
        path: '/stock-gem-pick-return-and-outbound',
        name: 'stock-gem-pick-return-and-outbound',
        component: stockGemPickReturnAndOutbound,
        menuId: 'STOCK-GEM-PICK-RETURN-AND-OUTBOUND',
        meta: {
          Displayname: {
            en: 'Pick Return And Outbound',
            th: 'คืนเข้าคลัง/เบิกออกคลัง'
          },
          minorShow: true,
          menuId: `stock-gem-pick-return-and-outbound`
        }
      },
      {
        path: '/stock-gem-pick-return-and-outbound-create/:id',
        name: 'stock-gem-pick-return-and-outbound-create',
        component: stockGemPickReturnAndOutboundCreate,
        menuId: 'STOCK-GEM-PICK-RETURN-AND-OUTBOUND-CREATE',
        meta: {
          Displayname: {
            en: 'Create Return And Outbound',
            th: 'คืนเข้าคลัง/เบิกออกคลัง'
          },
          minorShow: false,
          menuId: `stock-gem-pick-return-and-outbound-create`
        }
      }
      // pick-outbound
    ]
  }
]
export default routes
