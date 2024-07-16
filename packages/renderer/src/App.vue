<template>
  <v-app>
    <app-bar v-show="accountExists || enterAnonymously" />
    <v-main>
      <Home @enter="enterAnonymously = true" />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import Home from './views/homePage.vue';
import appBar from '/@/components/appBar.vue';
import {ref} from 'vue';
import { useOrbiter } from '/@/plugins/orbiter/utils';
import { suivre as follow } from '@constl/vue';

const { orbiter } = useOrbiter();

const accountExists = follow(orbiter.listenForAccountExists);
const enterAnonymously = ref(false);

</script>
