<template>
  <v-container class="fill-height">
    <v-responsive class="d-flex align-center text-center fill-height">
      <main-page v-if="orbiterReady && (accountExists || enterAnonymously)" />
      <init-screen
        v-else
        @enter="
          enterAnonymously = true;
          emit('enter');
        "
      />
    </v-responsive>
  </v-container>
</template>

<script setup lang="ts">
import initScreen from '/@/components/initScreen.vue';
import mainPage from '/@/components/mainPage.vue';

import {suivre as follow} from '@constl/vue';
import {ref} from 'vue';
import {useOrbiter} from '/@/plugins/orbiter/utils';

const {orbiter} = useOrbiter();

const orbiterReady = follow(({f}) => orbiter.listenForSiteConfigured({f}));

const accountExists = follow(({f}) => orbiter.listenForAccountExists({f}));
const enterAnonymously = ref(false);

const emit = defineEmits<{
  (e: 'enter'): void;
}>();
</script>
