<template>
    <v-img
        contain
        height="300"
        src="src/assets/logo.svg"
    />

    <div class="text-body-2 font-weight-light mb-n1">Welcome to</div>

    <h1 class="text-h2 font-weight-bold">Riff.CC</h1>

    <div class="text-body-2 italic">E cinere surgemus</div>

    <div class="py-14" />

    <v-row class="d-flex align-center justify-center">
        <v-col cols="auto">
        <v-btn
            min-width="164"
            rel="noopener noreferrer"
            target="_blank"
            variant="text"
            v-on:click="emit('enter')"
        >
            <v-icon
            icon="mdi-view-dashboard"
            size="large"
            start
            />

            Just browse
        </v-btn>
        </v-col>

        <v-col cols="auto">
        <v-btn
            color="primary"
            min-width="228"
            rel="noopener noreferrer"
            size="x-large"
            variant="flat"
            @click="setupAccount"
        >
            <v-icon
            icon="mdi-speedometer"
            size="large"
            start
            />

            Create account
        </v-btn>
        </v-col>

        <v-col cols="auto">
        <v-btn
            href="https://community.vuetifyjs.com/"
            min-width="164"
            rel="noopener noreferrer"
            target="_blank"
            variant="text"
        >
            <v-icon
            icon="mdi-account-group"
            size="large"
            start
            />

            View docs
        </v-btn>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import Riff from '@/plugins/riff/riff';
import { ref, inject, onMounted, onUnmounted } from 'vue'

const riff: Riff = inject('riff')!

const accountExists = ref<boolean>();

async function setupAccount() {
    await riff.ready()
}

let forgetAccountExists: (()=>void)|undefined = undefined
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
