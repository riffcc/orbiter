<template>
    <div>
        <h2>Trusted sites</h2>
        <v-list>
            <v-list-item>
                <v-list-item-title>
                    <v-text-field 
                        v-model="newSite"
                        class="mt-2" label="Trust site" variant="outlined"
                        append-icon="mdi-check"
                        @click:append="()=>newSite && trustSite(newSite)" @keyup.enter="()=>newSite && trustSite(newSite)"
                    />
                </v-list-item-title>
            </v-list-item>
            <v-list-item v-for="site in trustedSites">
                <v-list-item-title>{{ site }}</v-list-item-title>
                <template v-slot:append>
                    <v-btn text @click="()=>untrustSite(site)">Untrust</v-btn>
                </template>
            </v-list-item>
        </v-list>

        <h2>Blocked CIDs</h2>
        <v-list>
            <v-list-item>
                <v-list-item-title>
                    <v-text-field 
                        v-model="toBlock"
                        class="mt-2" label="Block CID" variant="outlined"
                        append-icon="mdi-check"
                        @click:append="()=>toBlock && blockRelease(toBlock)" @keyup.enter="()=>toBlock && blockRelease(toBlock)"
                    />
                </v-list-item-title>
            </v-list-item>
            <v-list-item v-for="b in blockedCIDs">
                <v-list-item-title>{{ b.cid }}</v-list-item-title>
                <template v-slot:append>
                    <v-btn text @click="()=>unblockRelease(b.hash)">Unblock</v-btn>
                </template>
            </v-list-item>
        </v-list>
    </div>
</template>

<script setup lang="ts">
import { inject, ref, onMounted, onUnmounted } from 'vue'

import Riff from '@/plugins/riff/riff';
import { TrustedSite } from '@/plugins/riff/types';

const riff: Riff = inject('riff')!;

const blockedCIDs = ref<string[]>();
const trustedSites = ref<TrustedSite[]>();

const blockRelease = async (cid: string) => {
    await riff.blockRelease(cid);
};
const unblockRelease = async (cid: string) => {
    await riff.unblockRelease(cid);
}

const trustSite = async ({ siteModDb, siteSwarm, siteName }: {siteModDb: string, siteSwarm: string, siteName: string}) => {
    await riff.trustSite({ siteModDb, siteSwarm, siteName })
}
const untrustSite = async (siteHash: string) => {
    await riff.untrustSite(siteHash)
}

let forgetBlockedCIDs: (()=>void) | undefined = undefined
let forgetTrustedSites: (()=>void) | undefined = undefined

onMounted(async () => {
    forgetBlockedCIDs = await riff.onBlockedReleasesChange({f: x=>blockedCIDs.value = x})
    forgetTrustedSites = await riff.onTrustedSitesChange({f: x=>trustedSites.value = x})
})

onUnmounted(async () => {
    if (forgetBlockedCIDs) await forgetBlockedCIDs()
    if (forgetTrustedSites) await forgetTrustedSites()
});

</script>