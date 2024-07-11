<template>
  <h1 class="my-3">Browse releases</h1>
  <v-list
    v-if="accountInitialised"
    class="mb-4 text-start"
  >
    <NewReleaseDialog>
      <template #activator="{props}">
        <v-list-item v-bind="props">
          <template #prepend>
            <v-icon>mdi-plus</v-icon>
          </template>
          <v-list-item-title>Add new release</v-list-item-title>
        </v-list-item>
      </template>
    </NewReleaseDialog>
  </v-list>
  <v-list
    v-if="!!releases && releases.length"
    class="text-start"
  >
    <ReleaseItem
      v-for="r in releases"
      :key="r.release.release.file"
      :release="r.release"
      :contributor="r.contributor"
      :site="r.site"
    />
  </v-list>
  <h3
    v-if="!!releases && releases.length === 0"
    class="text-center mt-4"
  >
    No releases found
  </h3>
</template>

<script setup lang="ts">
import type {ReleaseWithId} from '/@/plugins/orbiter/types';

import ReleaseItem from '/@/components/releases/releaseItem.vue';
import NewReleaseDialog from '/@/components/releases/newReleaseDialog.vue';

import {ref, onMounted, onUnmounted} from 'vue';
import { useOrbiter } from '/@/plugins/orbiter/utils';

const { orbiter } = useOrbiter();

const accountInitialised = ref<boolean | undefined>(undefined);
const account = ref<string>();
const releases = ref<{ release: ReleaseWithId; contributor: string; site: string; }[]>();

let forgetAccountExists: (() => Promise<void>) | undefined = undefined;
let forgetAccount: (() => Promise<void>) | undefined = undefined;
let forgetReleases: (() => Promise<void>) | undefined = undefined;

onMounted(async () => {
  forgetAccountExists = await orbiter.listenForAccountExists({
    f: a => (accountInitialised.value = a),
  });
});
onMounted(async () => {
  forgetAccount = await orbiter.listenForAccountId({f: a => (account.value = a)});
});
onMounted(async () => {
  forgetReleases = await orbiter.listenForReleases({f: rs => (releases.value = rs)});
});

onUnmounted(async () => {
  if (forgetAccountExists) await forgetAccountExists();
  if (forgetAccount) await forgetAccount();
  if (forgetReleases) await forgetReleases();
});
</script>
