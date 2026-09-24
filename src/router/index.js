import { defineRouter } from '#q-app'
import { ref, onMounted } from 'vue'
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory
} from 'vue-router'

import routes from './routes.js'
import { getUserRole } from '../utils/auth'
const userRole = ref('')
onMounted(() => {
  userRole.value = getUserRole()
})

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter((/* { store, ssrContext } */) => {
  const createHistory = import.meta.env.QUASAR_SERVER
    ? createMemoryHistory
    : import.meta.env.QUASAR_VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE)
  })

  Router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    const userRole = localStorage.getItem('role') // Read directly from storage

    // 1. Allow public routes (e.g., login page at '/')
    if (to.path === '/') {
      // If user is ALREADY logged in and tries to visit login, send them to dashboard
      if (token) {
        return next('/dashboard')
      }
      // Otherwise allow them to visit root
      return next()
    }

    // 2. Protect all non-root routes if no token exists
    if (!token) {
      return next('/')
    }

    // 3. Check role authorization if the route specifies required roles
    const requiredRoles = to.matched.find(record => record.meta?.roles)?.meta
      .roles
    console.log('Required roles for this route:', requiredRoles) // Debugging line
    if (requiredRoles && !requiredRoles.includes(userRole)) {
      // Authenticated, but unauthorized role -> redirect to root
      return next('/')
    }

    // 4. All checks passed -> proceed
    next()
  })

  return Router
})
