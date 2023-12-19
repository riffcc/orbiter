import {createRouter, createWebHashHistory, type RouteRecordRaw} from 'vue-router';
import HomePage from '/@/views/homePage.vue';
import AccountPage from '/@/views/accountPage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: HomePage,
  },
  {
    path: '/account',
    name: 'Account',
    component: AccountPage,
  },
];

const routeur = createRouter({
  history: createWebHashHistory(),
  routes,
});


export default routeur;
