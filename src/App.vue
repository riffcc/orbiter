<template>
  <v-app>
    <app-bar v-show="account || enterAnonymously"/>
    <v-main>
      <Home @enter="enterAnonymously = true"/>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
  import Home from '@/views/Home.vue'
  import appBar from '@/components/appBar.vue'
  import { ref, inject, onMounted, onUnmounted } from 'vue'
  const riff = inject('riff')

  const account = ref(undefined);
  const enterAnonymously = ref(false);

  let forgetAccount = undefined
  onMounted(async () => {
    forgetAccount = await riff.onAccountChange(a=>account.value = a)
  })

  onUnmounted(async () => {
    if (forgetAccount) await forgetAccount()
  })
</script>
