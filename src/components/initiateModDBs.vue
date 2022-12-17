<template>
    <v-dialog
        v-model="modDbMissing" persistent
    >
        <v-card>
            <v-card-title>Missing moderation database addresses</v-card-title>
            <v-card-text v-if="!generatedModDbAddress">
                Each instance of Riff.CC must be compiled with a moderation database address.
                Click below to generate the moderation DB.
            </v-card-text>
            <v-card-text v-else>
                Moderation DB generated! Be sure to copy the code below into a .env file and place
                it at the root of your Riff.CC project.
                <v-textarea>
                    VITE_MOD_BD_ADDRESS={{ modDbAddress }}
                </v-textarea>
            </v-card-text>
            <v-card-actions v-if="!generatedModDbAddress">
                <v-btn
                color="primary" 
                block 
                :loading="generatingDb"
                @click="generateDb"
                >
                    Generate moderation DB
                </v-btn>
            </v-card-actions>
            <v-card-actions v-else>
                <v-btn
                color="primary" 
                :loading="generatingEnvFile"
                @click="downloadEnvFile"
                >
                    Download .env file
                </v-btn>
                <v-btn
                color="primary" 
                @click="acceptNewModDb"
                >
                    Close and enter site
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted, computed } from "vue"
import Riff from '@/plugins/riff/riff';

const riff: Riff = inject('riff')!

const modDbAddress = ref<string>();
const modDbMissing = computed(() => !modDbAddress.value)

const generatingDb = ref<boolean>(false);
const generatedModDbAddress = ref<string>();

const generatingEnvFile = ref<boolean>(false);

const generateDb = async () => {
    generatingDb.value = true;

    generatedModDbAddress.value = await riff.generateModDb();

    generatingDb.value = false;
}

function download(filename: string, text: string) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

const downloadEnvFile = async () => {
    if (!generatedModDbAddress.value) return;
    generatingEnvFile.value = true;
    
    const contents = "VITE_MOD_BD_ADDRESS=" + generatedModDbAddress.value;
    download(".env", contents);

    generatingEnvFile.value = false;
}

const acceptNewModDb = async (id: string) => {
    riff.setModDb(id);
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