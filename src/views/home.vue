<template>
  <v-container class="fill-height">
    <v-responsive class="d-flex align-center text-center fill-height">
      <main-page v-if="account || enterAnonymously" />
      <init-screen v-else @enter="enterAnonymously = true; emit('enter')"/>
    </v-responsive>
  </v-container>
</template>

<script setup lang="ts">
  import MainPage from '@/components/MainPage.vue'
  import InitScreen from '@/components/InitScreen.vue'
  import setupRiff from '@/plugins/riff.ts'

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

  const emit = defineEmits<{
    (e: 'enter'): void
  }>()
</script>
