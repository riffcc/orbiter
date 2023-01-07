<template>
    <v-dialog v-model="dialog" max-width=600>
        <template v-slot:activator="{ on, attrs }">
            <v-btn icon="mdi-cog" v-bind="{ on, attrs }" @click="dialog=true"></v-btn>
        </template>
        <v-card>
            <v-card-title>
                Settings

                <v-btn icon>
                    <v-icon @click="dialog=false">mdi-close</v-icon>
                </v-btn>
            </v-card-title>
            <v-divider/>
            <v-card-text>
                <div v-if="accountExists">
                    <v-tabs
                        v-model="tab"
                    >
                        <v-tab value="account">My account</v-tab>
                        <v-tab v-show="moderator" value="moderation">Moderation</v-tab>
                    </v-tabs>
                    <v-card-text>
                        <v-window v-model="tab">
                            <v-window-item value="account">
                                <p>
                                    My account ID: {{ account }}
                                    <v-icon small @click="copyId">{{ idCopied ? 'mdi-check' : 'mdi-content-copy'}}</v-icon>
                                </p>

                                <v-btn color="error" class="my-6" text outlined @click=deleteAccount>
                                    Delete my account
                                </v-btn>
                            </v-window-item>

                            <v-window-item v-show="moderator" value="moderation">
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
                            </v-window-item>
                        </v-window>
                    </v-card-text>
                    
                </div>
                <v-row v-else class="d-flex align-center justify-center my-6">
                    <initiate-account>
                        <template v-slot:activator="{ props }">
                        <v-list-item v-bind="props">
                            <v-btn
                                class="mx-auto"
                                color="primary"
                                min-width="228"
                                size="x-large"
                                target="_blank"
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
                </v-row>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted } from 'vue';

import initiateAccount from '@/components/initiateAccount.vue';

import Riff from '@/plugins/riff/riff';

const riff: Riff = inject('riff')!;

const dialog = ref(false);
const tab = ref("account");
const idCopied = ref(false);

const account = ref<string>();
const names = ref<{ [language: string]: string; }>();
const accountExists = ref<boolean>();
const moderator = ref<boolean>();

async function deleteAccount() {
    await riff.deleteAccount();
    dialog.value = false
}

async function copyId() {
    if (!account.value) return
    await navigator.clipboard.writeText(account.value);
    idCopied.value = true;
}

let forgetAccount: (()=>void) | undefined = undefined
let forgetAccountExists: (()=>void) | undefined = undefined
let forgetModerator: (()=>void) | undefined = undefined
let forgetNames: (()=>void) | undefined = undefined
let forgetBlockedCIDs: (()=>void) | undefined = undefined
let forgetTrustedSites: (()=>void) | undefined = undefined

onMounted(async () => {
    forgetAccount = await riff.onAccountChange(a=>account.value = a)
    forgetAccountExists = await riff.onAccountExists(a => accountExists.value = a);
    forgetModerator = await riff.onIsModChange(isMod => moderator.value = isMod);

    forgetNames = await riff.onNameChange(a=>names.value = a)
    forgetBlockedCIDs = await riff.onBlockedReleasesChange(x=>blockedCIDs.value = x)
    forgetTrustedSites = await riff.onTrustedSitesChange(x=>trustedSites.value = x)
})

onUnmounted(async () => {
    if (forgetAccount) await forgetAccount()
    if (forgetAccountExists) await forgetAccountExists()
    if (forgetModerator) await forgetModerator()
    if (forgetNames) await forgetNames()
    if (forgetBlockedCIDs) await forgetBlockedCIDs()
    if (forgetTrustedSites) await forgetTrustedSites()
})

</script>