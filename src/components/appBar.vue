<template>
    <v-app-bar>
        <template v-slot:prepend>
            <v-app-bar-nav-icon v-show="false"></v-app-bar-nav-icon>
        </template>

        <v-app-bar-title>Riff.cc</v-app-bar-title>

        <template v-slot:append>
            <v-dialog v-model="settings" max-width=600>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn icon="mdi-cog" v-bind="{ on, attrs }" @click="settings=true"></v-btn>
                </template>
                <v-card>
                    <v-card-title>
                        Settings
                        <v-btn icon>
                            <v-icon @click="settings=false">mdi-close</v-icon>
                        </v-btn>
                    </v-card-title>
                    <v-divider/>
                    <v-card-text>
                        <div v-if="account">
                            <v-tabs
                                v-model="tab"
                            >
                                <v-tab value="account">My account</v-tab>
                                <v-tab value="moderation">Moderation</v-tab>
                            </v-tabs>
                            <v-card-text>
                                <v-window v-model="tab">
                                    <v-window-item value="account">
                                        <p>
                                            My account ID: {{ account }}
                                            <v-icon small @click="copyId">{{ idCopied ? 'mdi-check' : 'mdi-content-copy'}}</v-icon>
                                        </p>
                                        Profile name: <v-text-field v-model="newName" @keyup.enter="()=>changeName(newName)" variant="outlined"></v-text-field>

                                        <v-btn color="error" class="my-6" text outlined @click=deleteAccount>
                                            Delete my account
                                        </v-btn>
                                    </v-window-item>

                                    <v-window-item value="moderation">
                                        <h2>Trusted sites</h2>
                                        <v-list>
                                            <v-list-item>
                                                <v-list-item-title>
                                                    <v-text-field 
                                                      v-model="newSite"
                                                      class="mt-2" label="Trust site" variant="outlined"
                                                      append-icon="mdi-check"
                                                      @click:append="()=>trustSite(newSite)" @keyup.enter="()=>trustSite(newSite)"
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
                                                      @click:append="()=>blockRelease(toBlock)" @keyup.enter="()=>blockRelease(toBlock)"
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
                            <v-btn
                                class="mx-auto"
                                color="primary"
                                min-width="228"
                                size="x-large"
                                target="_blank"
                                variant="flat"
                                @click="setupAccount"
                            >
                                <v-icon
                                icon="mdi-speedometer"
                                size="large"
                                start
                                />

                                Create account
                            </v-btn>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-dialog>
            <v-btn v-show="false" icon="mdi-dots-vertical"></v-btn>
        </template>
    </v-app-bar>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted, computed } from 'vue'

const riff = inject('riff')

const settings = ref(false);
const account = ref(undefined);
const idCopied = ref(false);
const name = ref(undefined);
const tab = ref("account");

const newSite = ref(null);
const toBlock = ref(null);
const newName = ref(undefined);

const trustedSites = ref(undefined);
const blockedCIDs = ref(undefined);

async function deleteAccount() {
    await riff.deleteAccount();
    settings.value = false
}

async function copyId() {
    await navigator.clipboard.writeText(account.value);
    idCopied.value = true;
}

async function setupAccount() {
    await riff.setupAccount()
}

async function blockRelease(cid: string) {
    if (!cid) return
    toBlock.value = null
    await riff.blockRelease(cid)
}

async function changeName(name?: string) {
    await riff.changeName(name || undefined)
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

let forgetAccount = undefined
let forgetName = undefined
let forgetBlockedCIDs = undefined
let forgetTrustedSites = undefined

onMounted(async () => {
    forgetAccount = await riff.onAccountChange(a=>account.value = a)
    forgetName = await riff.onNameChange(a=>name.value = a)
    forgetBlockedCIDs = await riff.onBlockedReleasesChange(x=>blockedCIDs.value = x)
    forgetTrustedSites = await riff.onTrustedSitesChange(x=>trustedSites.value = x)
})

onUnmounted(async () => {
    if (forgetAccount) await forgetAccount()
    if (forgetName) await forgetName()
    if (forgetBlockedCIDs) await forgetBlockedCIDs()
    if (forgetTrustedSites) await forgetTrustedSites()
})

</script>