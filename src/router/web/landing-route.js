//const Layout = () => import('@/layout/web/LayoutLogin.vue')
const login = () => import('@/views/login/IndexView.vue')

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: `routes-login`,
    component: login
  }
]

export default routes
