<template>
    <v-dialog
        v-model="modDbMissing" persistent
         max-width="800"
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
                <v-textarea 
                class="mt-4"
                :value="envFileText" 
                readonly
                variant="outlined"
                />
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
import { VariableIds } from "@/plugins/riff/types";

const riff: Riff = inject('riff')!

const modDbAddress = ref<string>();
const modDbMissing = computed(() => !modDbAddress.value)

const generatingDb = ref<boolean>(false);
const generatedModDbAddress = ref<string>();
const generatedVariableIds = ref<VariableIds>();

const generatingEnvFile = ref<boolean>(false);

const generateDb = async () => {
    generatingDb.value = true;

    const { modDbId, variableIds } = await riff.generateModDb();

    generatedModDbAddress.value = modDbId;
    generatedVariableIds.value = variableIds;

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

const envFileText = computed(() => {
    const trustedSitesVar = "VITE_TRUSTED_SITES_VAR_ID=" + generatedVariableIds.value?.trustedSitesVariableId;
    const blockedCidsVar = "VITE_BLOCKED_CIDS_VAR_ID=" + generatedVariableIds.value?.blockedCidsVariableId;
    const memberIdVar = "VITE_MEMBER_ID_VAR_ID=" + generatedVariableIds.value?.memberIdVariableId;
    const memberStatusVar = "VITE_MEMBER_STATUS_VAR_ID=" + generatedVariableIds.value?.memberStatusVariableId;

    const riffSwarmId = "VITE_RIFF_SWARM_ID=" + generatedVariableIds.value?.riffSwarmId;
    const releasesCidVar = "VITE_RELEASES_CID_VAR_ID=" + generatedVariableIds.value?.releasesCidVar;

    const modDBAddress = "VITE_MOD_BD_ADDRESS=" + generatedModDbAddress.value;

    return  "# The address below should be regenerated for each Riff.CC site. If you are setting up an independent site, erase the value below and run the site in development mode (`pnpm dev`) to automatically regenerate. \n" +
        modDBAddress + "\n" + "\n" +
        "# These should ideally stay the same for all Riff.CC sites for optimal performance. Only change if you know what you are doing.\n" +
        trustedSitesVar + "\n" +
        blockedCidsVar + "\n" +
        memberIdVar + "\n" +
        memberStatusVar + "\n" +
        riffSwarmId + "\n" +
        releasesCidVar + "\n"
})

const downloadEnvFile = async () => {
    if (!generatedModDbAddress.value) return;
    generatingEnvFile.value = true;
    
    const contents = await envFileText.value;
    download(".env", contents);

    generatingEnvFile.value = false;
}

const acceptNewModDb = async () => {
    if (!generatedModDbAddress.value || !generatedVariableIds.value) {
        throw new Error("Mod DB and variables not generated.")
    }
    riff.setModDb({ modDbId: generatedModDbAddress.value, variableIds: generatedVariableIds.value });
}

let forgetModDbAddress: (()=>void) | undefined = undefined

onMounted(async () => {
    forgetModDbAddress = await riff.onModDbSet(id => {modDbAddress.value = id});
})

onUnmounted(async () => {
    if (forgetModDbAddress) await forgetModDbAddress();
})

</script>