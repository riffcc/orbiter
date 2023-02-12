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
import mainPage from '/@/components/mainPage.vue';
import initScreen from '/@/components/initScreen.vue';

import {ref, inject, onMounted, onUnmounted} from 'vue';
import type Orbiter from '/@/plugins/orbiter/orbiter';

const orbiter: Orbiter = inject('orbiter')!;

const orbiterReady = ref<boolean>(false);
const accountExists = ref<boolean>();
const enterAnonymously = ref(false);

orbiter.orbiterReady().then(() => (orbiterReady.value = true));

let forgetAccountExists: (() => void) | undefined = undefined;

onMounted(async () => {
  forgetAccountExists = await orbiter.onAccountExists({f: a => (accountExists.value = a)});
});

onUnmounted(async () => {
  if (forgetAccountExists) await forgetAccountExists();
});

const emit = defineEmits<{
  (e: 'enter'): void;
}>();
</script>
