<template>
  <v-app>
    <app-bar v-show="accountExists || enterAnonymously"/>
    <v-main>
      <Home @enter="enterAnonymously = true"/>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
  import Home from '@/views/home.vue'
  import appBar from '@/components/appBar.vue'
  import { ref, inject, onMounted, onUnmounted } from 'vue'
import Riff from './plugins/riff/riff';

  const riff: Riff = inject('riff')!

  const accountExists = ref<boolean>();
  const enterAnonymously = ref(false);

  let forgetAccountExists: (() => void) | undefined = undefined
  onMounted(async () => {
    forgetAccountExists = await riff.onAccountExists({f: a=>accountExists.value = a})
  })

  onUnmounted(async () => {
    if (forgetAccountExists) await forgetAccountExists()
  })
</script>
