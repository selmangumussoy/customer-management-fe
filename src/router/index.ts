import { createRouter, createWebHistory } from 'vue-router'
import CustomerList from '../views/CustomerList.vue'
import CustomerDetails from '../views/CustomerDetails.vue'
import CustomerForm from '../views/CustomerForm.vue'
import NotFound from '../views/NotFound.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: CustomerList
    },
    {
      path: '/customers/:id',
      name: 'customer-details',
      component: CustomerDetails,
      props: true
    },
    {
      path: '/customers/new',
      name: 'customer-create',
      component: CustomerForm
    },
    {
      path: '/customers/:id/edit',
      name: 'customer-edit',
      component: CustomerForm,
      props: true
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound
    }
  ]
})

export default router