import {createRouter, createWebHashHistory, type RouteRecordRaw} from 'vue-router';

import AboutPage from '/@/views/aboutPage.vue';
import AccountPage from '/@/views/accountPage.vue';
import BuildingPage from '/@/views/buildingPage.vue';
import HomePage from '/@/views/homePage.vue';
import InitPage from '/@/views/initPage.vue';
import UploadPage from '/@/views/uploadPage.vue';
import PrivacyPolicyPage from '/@/views/privacyPolicyPage.vue';
import ReleasePage from '/@/views/releasePage.vue';
import TermsPage from '/@/views/termsPage.vue';

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
  {
    path: '/upload',
    name: 'Upload',
    component: UploadPage,
  },
  {
    path: '/init',
    name: 'Create Website',
    component: InitPage,
  },
  {
    path: '/admin',
    name: 'Admin Website',
    component: BuildingPage,
  },
  {
    path: '/music',
    component: BuildingPage,
  },
  {
    path: '/movies',
    component: BuildingPage,
  },
  {
    path: '/tv-shows',
    component: BuildingPage,
  },
  {
    path: '/about',
    component: AboutPage,
  },
  {
    path: '/privacy-policy',
    component: PrivacyPolicyPage,
  },
  {
    path: '/terms',
    component: TermsPage,
  },
  {
    path: '/release/:category/:contentCID',
    name: 'Release',
    component: ReleasePage,
    props: true,
  },
];

const routeur = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
});

export default routeur;
