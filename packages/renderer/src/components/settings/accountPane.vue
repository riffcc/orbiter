<template>
  <div>
    <h2>Account info</h2>
    <p>
      <v-chip
        label
        class="my-2 me-2"
      >
        Username: {{ displayName }}
      </v-chip>
      <v-chip
        label
        class="my-2 me-2"
      >
        Account ID: {{ account ? account.slice(9, 25) + '...' : '' }}
        <v-icon
          small
          @click="() => copyAccountId()"
        >
          {{ accountIdCopied ? 'mdi-check' : 'mdi-content-copy' }}
        </v-icon>
      </v-chip>
    </p>
    <v-divider class="my-4" />
    <h2>Advanced</h2>
    <p>
      You are on the site <code>{{ siteDomainName }}</code
      >. If you are the moderator of another Orbiter.CC site and wish to add this site to your list
      of trusted sites, copy the information below:
      <v-text-field
        class="my-2"
        variant="outlined"
        readonly
        :append-inner-icon="modDbAddressCopied ? 'mdi-check' : 'mdi-content-copy'"
        @click:appendInner="() => copyModDbAddress()"
      >
        Moderation DB: {{ modDbAddress ? modDbAddress.slice(0, 35) + '...' : '' }}
      </v-text-field>
      <v-text-field
        class="my-2"
        variant="outlined"
        readonly
        :append-inner-icon="orbiterSwarmIdCopied ? 'mdi-check' : 'mdi-content-copy'"
        @click:appendInner="() => copySwarmId()"
      >
        Swarm ID: {{ orbiterSwarmId ? orbiterSwarmId.slice(0, 40) + '...' : '' }}
      </v-text-field>
    </p>

    <v-divider />

    <v-btn
      color="error"
      class="my-6"
      text
      outlined
      @click="deleteAccount"
    >
      Delete my account
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import {computed, inject, onMounted, onUnmounted, ref} from 'vue';

import type Orbiter from '/@/plugins/orbiter/orbiter';
import {selectTranslation, copyText} from '/@/utils';

const orbiter: Orbiter = inject('orbiter')!;

const names = ref<{[language: string]: string}>();

const account = ref<string>();
const accountIdCopied = ref(false);
const copyAccountId = async () => {
  await copyText(account.value);
  accountIdCopied.value = true;
};

const displayName = computed(() => {
  return selectTranslation(names.value) || 'Anonymous';
});

const siteDomainName = computed(() => {
  return document.location.hostname;
});

const modDbAddressCopied = ref(false);
const modDbAddress = ref<string>();
const copyModDbAddress = async () => {
  await copyText(modDbAddress.value);
  modDbAddressCopied.value = true;
};

const orbiterSwarmIdCopied = ref(false);
const orbiterSwarmId = ref<string>();
const copySwarmId = async () => {
  await copyText(orbiterSwarmId.value);
  orbiterSwarmIdCopied.value = true;
};

async function deleteAccount() {
  await orbiter.deleteAccount();
}

let forgetAccount: (() => void) | undefined = undefined;
let forgetNames: (() => void) | undefined = undefined;

onMounted(async () => {
  forgetAccount = await orbiter.onAccountChange({f: a => (account.value = a)});
  forgetNames = await orbiter.onNameChange({f: n => (names.value = n)});

  // These don't need to be dynamically followed, just noted once ready
  await orbiter.orbiterReady();
  modDbAddress.value = orbiter.modDbAddress;
  orbiterSwarmId.value = orbiter.orbiterSwarmId;
});

onUnmounted(async () => {
  if (forgetAccount) await forgetAccount();
  if (forgetNames) await forgetNames();
});
</script>
