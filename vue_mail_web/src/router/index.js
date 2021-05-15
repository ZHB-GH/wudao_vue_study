import Vue from 'vue'
import VueRouter from 'vue-router'

// import Login from '../components/Login.vue'
// import Home from '../components/Home.vue'
// import Welcome from '../components/Welcome.vue'
// import Users from '../components/user/Users.vue'
// import Rights from '../components/power/Rights.vue'
// import Roles from '../components/power/Roles.vue'
// import Cate from '../components/goods/Cate.vue'
// import Params from '../components/goods/Params.vue'
// import GoodsList from '../components/goods/GoodsList.vue'
// import GoodsAdd from '../components/goods/GoodsAdd.vue'
// import Order from '../components/order/Order.vue'
// import Report from '../components/report/Report.vue'
const Login = () => import('../components/Login.vue')
const Home = () => import('../components/Home.vue')
const Welcome = () => import('../components/Welcome.vue')
const Users = () => import('../components/user/Users.vue')
const Rights = () => import('../components/power/Rights.vue')
const Roles = () => import('../components/power/Roles.vue')
const Cate = () => import('../components/goods/Cate.vue')
const Params = () => import('../components/goods/Params.vue')
const GoodsList = () => import('../components/goods/GoodsList.vue')
const GoodsAdd = () => import('../components/goods/GoodsAdd.vue')
const Order = () => import('../components/order/Order.vue')
const Report = () => import('../components/report/Report.vue')

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    name: 'login',
    path: '/login',
    component: Login
  },
  {
    name: 'home',
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/users',
        component: Users
      },
      {
        path: '/roles',
        component: Roles
      },
      {
        path: '/rights',
        component: Rights
      },
      {
        path: '/categories',
        component: Cate
      },
      {
        path: '/params',
        component: Params
      },
      {
        path: '/goods',
        component: GoodsList
      },
      {
        path: '/goods/Add',
        component: GoodsAdd
      },
      {
        path: '/orders',
        component: Order
      },
      {
        path: '/reports',
        component: Report
      },
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 配置路由导航守卫
router.beforeEach((to, from, next) => {
  // 如果是去登陆页面，则直接放行
  if (to.path === '/login') return next();
  // 判断用户是否已经登录
  const tokenStr = window.sessionStorage.getItem('token');
  if (!tokenStr) return next('/login');
  next();
})

export default router
