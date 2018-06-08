import Vue from 'vue'
import Router from 'vue-router'
import {Resource} from 'vue-resource'
import CrimesMap from '@/components/CrimesMap'
import BootstrapVue from 'bootstrap-vue'

Vue.use(Resource)
Vue.use(Router)
Vue.use(BootstrapVue)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'CrimesMap',
      component: CrimesMap
    }
  ]
})
