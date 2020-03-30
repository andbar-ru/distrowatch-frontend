import Vue from 'vue'
import VueRouter from 'vue-router'
import TableView from '@/views/TableView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'TableView',
    component: TableView
  }
]

const router = new VueRouter({
  routes
})

export default router
