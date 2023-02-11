<template>
    <v-dialog
        v-model="dialog"
        max-width="800"
    >
        <template v-slot:activator="{props}">
            <slot name="activator" v-bind="{ props }"></slot>
        </template>
        <v-card>
            <v-card-title>{{ newSite ? "New release" : "Edit release" }}</v-card-title>
            <v-card-text>
                <v-text-field v-model="siteName" variant="outlined" label="Site name" ></v-text-field>
                <v-text-field v-model="modDbAddress" variant="outlined" label="Site moderation DB address"></v-text-field>
                <v-text-field v-model="swarmId" variant="outlined" label="Site swarm ID"></v-text-field>
            </v-card-text>
            <v-card-actions>
                <v-btn color="primary" :loading="saving" :disabled="!readyToSave" @click="save">
                    {{ newSite ? "Trust site" : "Save changes" }}
                </v-btn>
                <v-btn @click="clearDialog">Cancel</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed, inject, ref, watchEffect } from 'vue';

import { TrustedSite } from '@/plugins/orbiter/types';
import Orbiter from '@/plugins/orbiter/orbiter';
import { 
    TRUSTED_SITES_MOD_DB_COL, 
    TRUSTED_SITES_NAME_COL, 
    TRUSTED_SITES_SWARM_COL 
} from '@/plugins/orbiter/consts';
import { élémentDonnées } from '@constl/ipa/dist/valid';

const orbiter = inject<Orbiter>("orbiter")!;

const props = defineProps<{site?: élémentDonnées<TrustedSite>}>();

const dialog = ref(false);
const saving = ref(false);

// Allow same component to be used for both creating and editing trusted sites
const newSite = computed(()=>!props.site);

const readyToSave = computed(()=>{
    return !!((siteName.value) && modDbAddress.value && swarmId.value)
})

const siteName = ref<string>();
const modDbAddress = ref<string>();
const swarmId = ref<string>();

const save = async () => {
    if (!readyToSave.value) return;

    saving.value = true;

    const siteInfo: TrustedSite = {
        [TRUSTED_SITES_MOD_DB_COL]: modDbAddress.value!,
        [TRUSTED_SITES_NAME_COL]: siteName.value!,
        [TRUSTED_SITES_SWARM_COL]: swarmId.value!,
    }

    if (newSite.value) {
        await orbiter.trustSite(siteInfo);
    } else {
        await orbiter.editTrustedSite({
            siteHash: props.site!.empreinte, 
            site: siteInfo
        })
    }
    
    saving.value = false;
    clearDialog();
}

const clearDialog = () => {
    dialog.value = false;

    siteName.value = undefined;
    modDbAddress.value = undefined;
    swarmId.value = undefined;

    saving.value = false;
};

watchEffect(()=>siteName.value = props.site?.données.siteName);
watchEffect(()=>modDbAddress.value = props.site?.données.siteModDbAddress);
watchEffect(()=>swarmId.value = props.site?.données.siteSwarmId);

</script>