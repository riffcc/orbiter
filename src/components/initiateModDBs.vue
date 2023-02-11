<template>
    <v-dialog
        v-model="siteNotConfigured" persistent
        max-width="800"
    >
        <v-card>
            <v-card-title>Missing moderation database addresses</v-card-title>
            <v-card-text v-if="!generatedModDbAddress">
                Each instance of Orbiter.CC must be compiled with a moderation database address.
                Click below to generate the moderation DB.
            </v-card-text>
            <v-card-text v-else>
                Moderation DB generated! Be sure to copy the code below into a <code>.env</code> file and place
                it at the root of your Orbiter.CC project.
                <v-textarea 
                class="mt-4"
                :value="envFileText" 
                :append-inner-icon="textCopied ? 'mdi-check' : 'mdi-content-copy'"
                readonly
                variant="outlined"
                @click:appendInner="copyGeneratedEnvFile"
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
import Orbiter from '@/plugins/orbiter/orbiter';
import { VariableIds } from "@/plugins/orbiter/types";
import { downloadFile } from "@/utils";

const orbiter: Orbiter = inject('orbiter')!

const siteConfigured = ref<boolean>();
const siteNotConfigured = computed(() => siteConfigured.value === false);

const generatingDb = ref<boolean>(false);
const generatedModDbAddress = ref<string>();
const generatedOrbiterSwarmId = ref<string>();
const generatedVariableIds = ref<VariableIds>();

const generatingEnvFile = ref<boolean>(false);

const generateDb = async () => {
    generatingDb.value = true;

    const { modDbId, orbiterSwarmId, variableIds } = await orbiter.generateModDb();

    generatedModDbAddress.value = modDbId;
    generatedVariableIds.value = variableIds;
    generatedOrbiterSwarmId.value = orbiterSwarmId;

    generatingDb.value = false;
}

const envFileText = computed(() => {
    const trustedSitesModDbVar = "VITE_TRUSTED_SITES_MOD_DB_VAR_ID=" + generatedVariableIds.value?.trustedSitesModDbVariableId;
    const trustedSitesSwarmVar = "VITE_TRUSTED_SITES_SWARM_VAR_ID=" + generatedVariableIds.value?.trustedSitesSwarmVariableId;
    const trustedSitesNameVar = "VITE_TRUSTED_SITES_NAME_VAR_ID=" + generatedVariableIds.value?.trustedSitesNameVariableId;
    const blockedCidsVar = "VITE_BLOCKED_CIDS_VAR_ID=" + generatedVariableIds.value?.blockedCidsVariableId;

    const orbiterSwarmId = "VITE_ORBITER_SWARM_ID=" + generatedOrbiterSwarmId.value;
    const releasesFileVar = "VITE_RELEASES_FILE_VAR_ID=" + generatedVariableIds.value?.releasesFileVar;
    const releasesTypeVar = "VITE_RELEASES_TYPE_VAR_ID=" + generatedVariableIds.value?.releasesTypeVar;
    const releasesAuthorVar = "VITE_RELEASES_AUTHOR_VAR_ID=" + generatedVariableIds.value?.releasesAuthorVar;
    const releasesContentNameVar = "VITE_RELEASES_CONTENT_NAME_VAR_ID=" + generatedVariableIds.value?.releasesContentNameVar;
    const releasesMetadataVar = "VITE_RELEASES_METADATA_VAR_ID=" + generatedVariableIds.value?.releasesMetadataVar;
    const releasesThumbnailVar = "VITE_RELEASES_THUMBNAIL_VAR_ID=" + generatedVariableIds.value?.releasesThumbnailVar;

    const modDBAddress = "VITE_MOD_BD_ADDRESS=" + generatedModDbAddress.value;

    return  "# The address below should be regenerated for each Orbiter.CC site. If you are setting up an independent site, erase the value below and run the site in development mode (`pnpm dev`) to automatically regenerate. \n" +
        modDBAddress + "\n" + 
        orbiterSwarmId + "\n" + "\n" +
        
        "# These should ideally stay the same for all Orbiter.CC sites for optimal performance. Only change if you know what you are doing.\n" +
        trustedSitesModDbVar + "\n" +
        trustedSitesSwarmVar + "\n" +
        trustedSitesNameVar + "\n" +
        blockedCidsVar + "\n" +
        releasesFileVar + "\n" +
        releasesTypeVar + "\n" +
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

const textCopied = ref(false);
const copyGeneratedEnvFile = async () => {
    if (navigator.clipboard) {
        await navigator.clipboard.writeText(envFileText.value);
    }
    textCopied.value = true;
}

const acceptNewModDb = async () => {
    if (!generatedModDbAddress.value || !generatedVariableIds.value || !generatedOrbiterSwarmId.value) {
        throw new Error("Mod DB and variables not generated.")
    }
    orbiter.setModDb({ 
        modDbId: generatedModDbAddress.value, 
        orbiterSwarmId: generatedOrbiterSwarmId.value, 
        variableIds: generatedVariableIds.value
    });
}

let forgetSiteConfigured: (()=>void) | undefined = undefined

onMounted(async () => {
    forgetSiteConfigured = await orbiter.isSiteConfigured({f: configured => {siteConfigured.value = configured}});
})

onUnmounted(async () => {
    if (forgetSiteConfigured) await forgetSiteConfigured();
})

</script>