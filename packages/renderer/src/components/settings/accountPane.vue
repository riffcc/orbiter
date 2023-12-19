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
      You are on the site <code>{{ siteDomainName }}</code>. If you are the moderator of another Orbiter.CC site and wish to add this site to your list
      of trusted sites, copy the information below:
      <v-text-field
        class="my-2"
        variant="outlined"
        readonly
        :append-inner-icon="siteInfoCopied ? 'mdi-check' : 'mdi-content-copy'"
        @click:append-inner="() => copySiteInfo()"
      >
        Site info: {{ siteInfo ? hashedSiteInfo.slice(0, 35) + '...' : '' }}
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

const orbiter = inject<Orbiter>('orbiter');

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

const siteInfoCopied = ref(false);
const siteInfo = ref<{
    siteId: string,
    siteName: string,
}>();
const hashedSiteInfo = computed(()=>{
  return btoa(JSON.stringify(siteInfo.value));
});
const copySiteInfo = async () => {
  await copyText(hashedSiteInfo.value);
  siteInfoCopied.value = true;
};

async function deleteAccount() {
  await orbiter?.deleteAccount();
}

let forgetAccount: (() => Promise<void>) | undefined = undefined;
let forgetNames: (() => Promise<void>) | undefined = undefined;

onMounted(async () => {
  if (!orbiter) throw new Error('Orbiter not found.');

  forgetAccount = await orbiter.listenForAccountId({f: a => (account.value = a)});
  forgetNames = await orbiter.listenForNameChange({f: n => (names.value = n)});

  // These don't need to be dynamically followed, just noted once ready
  const {siteId} = await orbiter.siteConfigured();
  siteInfo.value = {
    siteId,
    siteName: siteDomainName.value,
  };
});

onUnmounted(async () => {
  if (forgetAccount) await forgetAccount();
  if (forgetNames) await forgetNames();
});
</script>
