import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/front/Home.vue')
  },
  {
    path: '/policies',
    name: 'Policies',
    component: () => import('../views/front/Policies.vue')
  },
  {
    path: '/policies/:id',
    name: 'PolicyDetail',
    component: () => import('../views/front/PolicyDetail.vue')
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('../views/front/Products.vue')
  },
  {
    path: '/products/:id',
    name: 'ProductDetail',
    component: () => import('../views/front/ProductDetail.vue')
  },
  {
    path: '/cases',
    name: 'Cases',
    component: () => import('../views/front/Cases.vue')
  },
  {
    path: '/cases/:id',
    name: 'CaseDetail',
    component: () => import('../views/front/CaseDetail.vue')
  },
  {
    path: '/contacts',
    name: 'Contacts',
    component: () => import('../views/front/Contacts.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/admin/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/admin/Layout.vue'),
    meta: { requiresAuth: true },
    redirect: '/admin/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/admin/Dashboard.vue')
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('../views/admin/Users.vue')
      },
      {
        path: 'roles',
        name: 'Roles',
        component: () => import('../views/admin/Roles.vue')
      },
      {
        path: 'banks',
        name: 'Banks',
        component: () => import('../views/admin/Banks.vue')
      },
      {
        path: 'bank-contacts/:bankId',
        name: 'BankContacts',
        component: () => import('../views/admin/BankContacts.vue')
      },
      {
        path: 'policies',
        name: 'AdminPolicies',
        component: () => import('../views/admin/Policies.vue')
      },
      {
        path: 'products',
        name: 'AdminProducts',
        component: () => import('../views/admin/Products.vue')
      },
      {
        path: 'cases',
        name: 'AdminCases',
        component: () => import('../views/admin/Cases.vue')
      },
      {
        path: 'audit',
        name: 'Audit',
        component: () => import('../views/admin/Audit.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth !== false && !token && to.path.startsWith('/admin')) {
    next({ path: '/login' })
  } else {
    next()
  }
})

export default router
