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

import {onMounted, onUnmounted, ref} from 'vue';
import {useOrbiter} from '/@/plugins/orbiter/utils';

const {orbiter} = useOrbiter();

const orbiterReady = ref<boolean>(false);
const accountExists = ref<boolean>();
const enterAnonymously = ref(false);

onMounted(async () => {
  await orbiter.siteConfigured();
  orbiterReady.value = true;
});

let forgetAccountExists: (() => void) | undefined = undefined;

onMounted(async () => {
  forgetAccountExists = await orbiter.listenForAccountExists({f: a => (accountExists.value = a)});
});

onUnmounted(async () => {
  if (forgetAccountExists) await forgetAccountExists();
});

const emit = defineEmits<{
  (e: 'enter'): void;
}>();
</script>
