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
                            <p>
                                My account ID: {{ account }}
                                <v-icon small @click="copyId">{{ idCopied ? 'mdi-check' : 'mdi-content-copy'}}</v-icon>
                            </p>
                            Profile name:<v-text-field v-model="name"></v-text-field>

                            <v-btn color="error" class="my-6" text outlined @click=deleteAccount>
                                Delete my account
                            </v-btn>
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

<script setup>
import { ref, inject, onMounted, onUnmounted } from 'vue'

const riff = inject('riff')

const settings = ref(false);
const account = ref(undefined);
const idCopied = ref(false);
const name = ref(undefined);

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

let forgetAccount = undefined
let forgetName = undefined
onMounted(async () => {
    forgetAccount = await riff.onAccountChange(a=>account.value = a)
    forgetName = await riff.onNameChange(a=>name.value = a)
})

onUnmounted(async () => {
    if (forgetAccount) await forgetAccount()
    if (forgetName) await forgetName()
})

</script>