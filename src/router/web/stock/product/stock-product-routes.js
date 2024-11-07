const Layout = () => import('@/layout/web/LayoutDashboard.vue')

//const Dashboard = () => import('@/views/dashboard/WelcomePage.vue')
const List = () => import('@/views/stock/product/list/IndexView.vue')

const productCost = () => import('@/views/stock/product/cost/IndexView.vue')

const routes = [
  {
    path: '/stock-product',
    component: Layout,
    redirect: '/stock-product-list',
    name: 'stock-product',
    sectionid: 'STOCK-PRODUCT',
    meta: {
      Displayname: {
        en: 'Stock Product',
        th: 'คลังสินค้า'
      },
      classIcon: 'bi bi-gem',
      majorShow: true,
      btsubLineShow: true
    },
    children: [
      // stock product
      {
        path: '/stock-product-list',
        name: 'stock-product-list',
        component: List,
        menuId: 'List',
        meta: {
          Displayname: {
            en: 'Stock Product',
            th: 'ตรวจคลัง'
          },
          minorShow: true,
          menuId: `stock-product`
        }
      },
      // cost
      {
        path: '/product-cost/:id',
        name: 'product-cost',
        component: productCost,
        menuId: 'Product-Cost',
        meta: {
          Displayname: {
            en: 'Product Cost',
            th: 'ประเมินราคาสินค้า'
          },
          minorShow: false,
          menuId: `product-cost`
        }
      }
    ]
  }
]
export default routes
