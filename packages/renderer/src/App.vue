<template>
  <v-app>
    <app-bar v-show="accountExists || enterAnonymously" />
    <v-main>
      <Home @enter="enterAnonymously = true" />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import {suivre as follow} from '@constl/vue';
import {ref} from 'vue';
import Home from './views/homePage.vue';
import appBar from '/@/components/appBar.vue';
import {useOrbiter} from '/@/plugins/orbiter/utils';

const {orbiter} = useOrbiter();

const accountExists = follow(({f}) => orbiter.listenForAccountExists({f}));
const enterAnonymously = ref(false);
</script>
