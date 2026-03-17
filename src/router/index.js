import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ScadenzeView from '../views/ScadenzeView.vue'
import NotificheView from '../views/NotificheView.vue'
import AddVehicleView from '../views/AddVehicleView.vue'
import VehicleDetailView from '../views/VehicleDetailView.vue'
import SettingsView from '../views/SettingsView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { transition: 'fade' }
  },
  {
    path: '/scadenze',
    name: 'scadenze',
    component: ScadenzeView,
    meta: { transition: 'fade' }
  },
  {
    path: '/notifiche',
    name: 'notifiche',
    component: NotificheView,
    meta: { transition: 'fade' }
  },
  {
    path: '/veicolo/nuovo',
    name: 'add-vehicle',
    component: AddVehicleView,
    meta: { transition: 'slide-up' }
  },
  {
    path: '/veicolo/:id/modifica',
    name: 'edit-vehicle',
    component: AddVehicleView,
    meta: { transition: 'slide-up' }
  },
  {
    path: '/veicolo/:id',
    name: 'vehicle-detail',
    component: VehicleDetailView,
    meta: { transition: 'slide' }
  },
  {
    path: '/impostazioni',
    name: 'settings',
    component: SettingsView,
    meta: { transition: 'fade' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
