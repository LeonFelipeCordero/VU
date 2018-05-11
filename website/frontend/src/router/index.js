import Vue from 'vue'
import Router from 'vue-router'
import {Resource} from 'vue-resource'
import CrimesMap from '@/components/CrimesMap'
import BootstrapVue from 'bootstrap-vue'
// import * as VueGoogleMaps from 'vue2-google-maps'

Vue.use(Resource)
Vue.use(Router)
Vue.use(BootstrapVue)
// Vue.use(VueGoogleMaps, {
//   load: {
//     key: 'AIzaSyC4aZ2PeWN9UWbpZ4qNMZN2zawo0ePJ-XY',
//     libraries: 'places'
//   }
// })

export default new Router({
  routes: [
    {
      path: '/',
      name: 'CrimesMap',
      component: CrimesMap
    }
  ]
})
