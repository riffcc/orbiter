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
            <v-list-item v-for="cid in blockedCIDs">
                <v-list-item-title>{{ cid }}</v-list-item-title>
                <template v-slot:append>
                    <v-btn text @click="()=>unblockRelease(cid)">Unblock</v-btn>
                </template>
            </v-list-item>
        </v-list>
    </div>
</template>

<script setup lang="ts">

</script>