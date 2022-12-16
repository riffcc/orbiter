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

  import { ref, inject, onMounted, onUnmounted } from 'vue'
  import Riff from '@/plugins/riff/riff';
  
  const riff: Riff = inject('riff')!

  const accountExists = ref<boolean>();
  const enterAnonymously = ref(false);

  let forgetAccountExists: (()=>void) | undefined = undefined
  onMounted(async () => {
    forgetAccountExists = await riff.onAccountExists(a=>accountExists.value = a)
  })

  onUnmounted(async () => {
    if (forgetAccountExists) await forgetAccountExists()
  })

  const emit = defineEmits<{
    (e: 'enter'): void
  }>()
</script>
