<template>
  <div>
    <h2>Trusted sites</h2>
    <div class="my-2 text-center">
      <TrustSiteDialog>
        <template #activator="{props}">
          <v-btn
            v-bind="props"
            color="primary"
          >
            Add trusted site
          </v-btn>
        </template>
      </TrustSiteDialog>
    </div>

    <v-list>
      <TrustedSiteListItem
        v-for="site in trustedSites"
        :key="site.empreinte"
        :site="site"
      />
    </v-list>

    <v-divider class="my-2" />

    <h2>Blocked CIDs</h2>
    <v-list>
      <v-list-item>
        <v-list-item-title>
          <v-text-field
            v-model="toBlock"
            class="mt-2"
            label="Block CID"
            variant="outlined"
            append-icon="mdi-check"
            @click:append="() => toBlock && blockRelease(toBlock)"
            @keyup.enter="() => toBlock && blockRelease(toBlock)"
          />
        </v-list-item-title>
      </v-list-item>
      <v-list-item
        v-for="b in blockedCIDs"
        :key="b.hash"
      >
        <v-list-item-title>{{ b.cid }}</v-list-item-title>
        <template #append>
          <v-btn
            text
            @click="() => unblockRelease(b.hash)"
          >
            Unblock
          </v-btn>
        </template>
      </v-list-item>
    </v-list>
  </div>
</template>

<script setup lang="ts">
import {inject, ref, onMounted, onUnmounted} from 'vue';

import type Orbiter from '/@/plugins/orbiter/orbiter';
import type {TrustedSite} from '/@/plugins/orbiter/types';
import type {élémentDonnées} from '@constl/ipa/dist/src/valid';

import TrustSiteDialog from './trustedSites/trustSiteDialog.vue';
import TrustedSiteListItem from './trustedSites/trustedSite.vue';

const orbiter: Orbiter = inject('orbiter')!;

const blockedCIDs = ref<{cid: string; hash: string}[]>();
const toBlock = ref<string>();

const trustedSites = ref<élémentDonnées<TrustedSite>[]>();

const blockRelease = async (cid: string) => {
  await orbiter.blockRelease(cid);
  toBlock.value = undefined;
};
const unblockRelease = async (cid: string) => {
  await orbiter.unblockRelease(cid);
};

let forgetBlockedCIDs: (() => void) | undefined = undefined;
let forgetTrustedSites: (() => void) | undefined = undefined;

onMounted(async () => {
  forgetBlockedCIDs = await orbiter.onBlockedReleasesChange({f: x => (blockedCIDs.value = x)});
  forgetTrustedSites = await orbiter.onTrustedSitesChange({f: x => (trustedSites.value = x)});
});

onUnmounted(async () => {
  if (forgetBlockedCIDs) await forgetBlockedCIDs();
  if (forgetTrustedSites) await forgetTrustedSites();
});
</script>
