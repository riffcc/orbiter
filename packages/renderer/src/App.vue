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
import {ref, inject, onMounted, onUnmounted} from 'vue';
import type Orbiter from './plugins/orbiter/orbiter';

const orbiter = inject<Orbiter>('orbiter');

const accountExists = ref<boolean>();
const enterAnonymously = ref(false);

let forgetAccountExists: (() => void) | undefined = undefined;
onMounted(async () => {
  forgetAccountExists = await orbiter?.listenForAccountExists({f: a => (accountExists.value = a)});
});

onUnmounted(async () => {
  if (forgetAccountExists) await forgetAccountExists();
});
</script>
