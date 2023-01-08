<template>
    <div>
        <p>
            My account ID: {{ account }}
            Username: {{ names }}
            <v-icon small @click="copyId">{{ idCopied ? 'mdi-check' : 'mdi-content-copy'}}</v-icon>
        </p>

        <v-btn color="error" class="my-6" text outlined @click="deleteAccount">
            Delete my account
        </v-btn>
    </div>
</template>

<script setup lang="ts">
import { inject, onMounted, onUnmounted, ref } from 'vue';

import Riff from '@/plugins/riff/riff';

const riff: Riff = inject('riff')!;

const account = ref<string>();
const names = ref<{[language: string]: string}>();

const idCopied = ref(false);

async function deleteAccount() {
    await riff.deleteAccount();
}

async function copyId() {
    if (!account.value) return
    await navigator.clipboard.writeText(account.value);
    idCopied.value = true;
}

let forgetAccount: (()=>void) | undefined = undefined;
let forgetNames: (()=>void) | undefined = undefined;

onMounted(async () => {
    forgetAccount = await riff.onAccountChange({ f: a=>account.value = a })
    forgetNames = await riff.onNameChange({ f: n => names.value = n});
});

onUnmounted(async () => {
    if (forgetAccount) await forgetAccount()
    if (forgetNames) await forgetNames();
});

</script>