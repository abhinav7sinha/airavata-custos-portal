import Vue from 'vue'
import App from './App.vue'
import router from "./router.js";
import store from './store/index.js'
import {BootstrapVue, IconsPlugin} from 'bootstrap-vue'
import Vuelidate from 'vuelidate'

import './styles.scss';

Vue.use(BootstrapVue)
Vue.use(Vuelidate)
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin)

Vue.config.productionTip = false

new Vue({
    router,
    store,
    render: h => h(App),
}).$mount('#app')


