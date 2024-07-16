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
import {suivre as follow} from '@constl/vue';
import NewReleaseDialog from '/@/components/releases/newReleaseDialog.vue';
import ReleaseItem from '/@/components/releases/releaseItem.vue';
import {useOrbiter} from '/@/plugins/orbiter/utils';

const {orbiter} = useOrbiter();

const accountInitialised = follow(orbiter.listenForAccountExists);
const releases = follow(orbiter.listenForReleases);
</script>
