<template>
    <v-dialog
        v-model="modDbAddress" persistent
    >
        <v-card>
            <v-card-title>Missing moderation database addresses</v-card-title>
            <v-card-text>
                Each instance of Riff.CC must be compiled with a moderation database addresse.
                Click below to generate the moderation DB.
                {{modDbAddress}}
            </v-card-text>
            <v-card-actions>
                <v-btn 
                color="primary" 
                block 
                :loading="generatingDb"
                @click="generateDb"
                >
                    Generate moderation DB
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted } from "vue"
import Riff from '@/plugins/riff/riff';

const riff: Riff = inject('riff')!

const modDbAddress = ref<string>();
const generatedModDbAddress = ref<string>();
const generatingDb = ref<boolean>(false);

const generateDb = async () => {
    generatingDb.value = true;

    generatedModDbAddress.value = await riff.generateModDb();

    generatingDb.value = false;
}

const acceptNewModDb = async (id: string) => {
    await riff.setModDb(id);
}

let forgetModDbAddress: (()=>void) | undefined = undefined


onMounted(async () => {
    forgetModDbAddress = await riff.onModDbChange(id => {modDbAddress.value = id});
})

onUnmounted(async () => {
    if (forgetModDbAddress) await forgetModDbAddress();
})

const dialog = ref<boolean>(true);
</script>