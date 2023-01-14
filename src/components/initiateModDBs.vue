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
                Moderation DB generated! Be sure to copy the code below into a <code>.env</code> file and place
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
import { downloadFile } from "@/utils";

const riff: Riff = inject('riff')!

const modDbAddress = ref<string>();
const modDbMissing = computed(() => !modDbAddress.value)

const generatingDb = ref<boolean>(false);
const generatedModDbAddress = ref<string>();
const generatedRiffSwarmId = ref<string>();
const generatedVariableIds = ref<VariableIds>();

const generatingEnvFile = ref<boolean>(false);

const generateDb = async () => {
    generatingDb.value = true;

    const { modDbId, riffSwarmId, variableIds } = await riff.generateModDb();

    generatedModDbAddress.value = modDbId;
    generatedVariableIds.value = variableIds;
    generatedRiffSwarmId.value = riffSwarmId;

    generatingDb.value = false;
}

const envFileText = computed(() => {
    const trustedSitesModDbVar = "VITE_TRUSTED_SITES_MOD_DB_VAR_ID=" + generatedVariableIds.value?.trustedSitesModDbVariableId;
    const trustedSitesSwarmVar = "VITE_TRUSTED_SITES_SWARM_VAR_ID=" + generatedVariableIds.value?.trustedSitesSwarmVariableId;
    const trustedSitesNameVar = "VITE_TRUSTED_SITES_NAME_VAR_ID=" + generatedVariableIds.value?.trustedSitesNameVariableId;
    const blockedCidsVar = "VITE_BLOCKED_CIDS_VAR_ID=" + generatedVariableIds.value?.blockedCidsVariableId;

    const riffSwarmId = "VITE_RIFF_SWARM_ID=" + generatedRiffSwarmId.value;
    const releasesFileVar = "VITE_RELEASES_FILE_VAR_ID=" + generatedVariableIds.value?.releasesFileVar;
    const releasesAuthorVar = "VITE_RELEASES_AUTHOR_VAR_ID=" + generatedVariableIds.value?.releasesAuthorVar;
    const releasesContentNameVar = "VITE_RELEASES_CONTENT_NAME_VAR_ID=" + generatedVariableIds.value?.releasesContentNameVar;
    const releasesMetadataVar = "VITE_RELEASES_METADATA_VAR_ID=" + generatedVariableIds.value?.releasesMetadataVar;
    const releasesThumbnailVar = "VITE_RELEASES_THUMBNAIL_VAR_ID=" + generatedVariableIds.value?.releasesThumbnailVar;

    const modDBAddress = "VITE_MOD_BD_ADDRESS=" + generatedModDbAddress.value;

    return  "# The address below should be regenerated for each Riff.CC site. If you are setting up an independent site, erase the value below and run the site in development mode (`pnpm dev`) to automatically regenerate. \n" +
        modDBAddress + "\n" + 
        riffSwarmId + "\n" + "\n" +
        
        "# These should ideally stay the same for all Riff.CC sites for optimal performance. Only change if you know what you are doing.\n" +
        trustedSitesModDbVar + "\n" +
        trustedSitesSwarmVar + "\n" +
        trustedSitesNameVar + "\n" +
        blockedCidsVar + "\n" +
        releasesFileVar + "\n" +
        releasesAuthorVar + "\n" +
        releasesContentNameVar + "\n" +
        releasesMetadataVar + "\n" +
        releasesThumbnailVar + "\n"
})

const downloadEnvFile = async () => {
    if (!generatedModDbAddress.value) return;
    generatingEnvFile.value = true;
    
    const contents = await envFileText.value;
    downloadFile(".env", contents);

    generatingEnvFile.value = false;
}

const acceptNewModDb = async () => {
    if (!generatedModDbAddress.value || !generatedVariableIds.value || !generatedRiffSwarmId.value) {
        throw new Error("Mod DB and variables not generated.")
    }
    riff.setModDb({ 
        modDbId: generatedModDbAddress.value, 
        riffSwarmId: generatedRiffSwarmId.value, 
        variableIds: generatedVariableIds.value
    });
}

let forgetModDbAddress: (()=>void) | undefined = undefined

onMounted(async () => {
    forgetModDbAddress = await riff.onModDbSet({f: id => {modDbAddress.value = id}});
})

onUnmounted(async () => {
    if (forgetModDbAddress) await forgetModDbAddress();
})

</script>