<template>
    <v-app-bar>
        <template v-slot:prepend>
            <v-app-bar-nav-icon v-show="false"></v-app-bar-nav-icon>
        </template>

        <v-app-bar-title>Riff.CC</v-app-bar-title>

        <template v-slot:append>
            <SettingsDialog/>
        </template>
    </v-app-bar>
</template>

<script setup lang="ts">

import { ref } from 'vue'
import SettingsDialog from '@/components/settings/settingsDialog.vue';



const newSite = ref<string|null>(null);
const toBlock = ref<string|null>(null);

const trustedSites = ref<string[]>();
const blockedCIDs = ref<string[]>();





async function blockRelease(cid: string) {
    if (!cid) return
    toBlock.value = null
    await riff.blockRelease(cid)
}

async function unblockRelease(cid: string) {
    await riff.unblockRelease(cid)
}

async function trustSite(site: string) {
    if (!site) return
    newSite.value = null
    await riff.trustSite(site)
}

async function untrustSite(site: string) {
    await riff.untrustSite(site)
}


</script>
