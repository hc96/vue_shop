import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// import global style sheet
import './assets/css/global.css'
// import iconfont.css
import './assets/fonts/iconfont.css'

import axios from 'axios'
// config the url
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
