import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue';
import { useAuthStore } from '../stores/auth';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/home'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginPage.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterPage.vue')
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/home'
      },
      {
        path: 'home',
        name: 'Home',
        component: () => import('../views/HomePage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../views/ProfilePage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'menu',
        name: 'Menu',
        component: () => import('../views/MealPlannerPage.vue'),
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/recipes/new',
    name: 'NewRecipe',
    component: () => import('../views/NewRecipePage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/recipes/:id',
    name: 'RecipeDetail',
    component: () => import('../views/RecipeDetailPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/recipes/:id/edit',
    name: 'EditRecipe',
    component: () => import('../views/EditRecipePage.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router
