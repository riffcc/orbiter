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

    <initiateModDBs/>

    <v-row v-if="riffReady" class="d-flex align-center justify-center">
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
            <initiate-account>
                <template v-slot:activator="{ props }">
                  <v-list-item v-bind="props">
                    <v-btn
                        color="primary"
                        min-width="228"
                        rel="noopener noreferrer"
                        size="x-large"
                        variant="flat"
                    >
                        <v-icon
                            icon="mdi-speedometer"
                            size="large"
                            start
                        />
                        Create account
                    </v-btn>
                  </v-list-item>
                </template>
            </initiate-account>
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
    <v-row v-else class="d-flex align-center justify-center">
        <v-col cols="auto">
            <v-progress-circular 
            indeterminate
            :size="100"
            :width="15"
            />
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import Riff from '@/plugins/riff/riff';
import { ref, inject, onMounted, onUnmounted } from 'vue';

import initiateModDBs from "@/components/initiateModDBs.vue"
import initiateAccount from '@/components/initiateAccount.vue';

const riff: Riff = inject('riff')!

const riffReady = ref<boolean>(false);
riff.riffReady().then(()=>riffReady.value = true)

const accountExists = ref<boolean>();

let forgetAccountExists: (()=>void)|undefined = undefined
onMounted(async () => {
  forgetAccountExists = await riff.onAccountExists({f: a=>accountExists.value = a})
})

onUnmounted(async () => {
  if (forgetAccountExists) await forgetAccountExists()
})

const emit = defineEmits<{
  (e: 'enter'): void
}>()

</script>
