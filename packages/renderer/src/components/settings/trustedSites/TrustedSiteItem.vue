<template>
  <v-list-item>
    <v-list-item-title>
      {{ site.données.siteName }}
    </v-list-item-title>
    <template #append>
      <TrustSiteDialog :site="site">
        <template #activator="{props}">
          <v-btn
            v-bind="props"
            icon
            @click.stop
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
        </template>
      </TrustSiteDialog>

      <v-btn
        icon
        @click.stop
        @click="untrustSite"
      >
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </template>
  </v-list-item>
</template>

<script setup lang="ts">

import TrustSiteDialog from './AddTrustedSite.vue';

import type {TrustedSite} from '/@/plugins/orbiter/types';
import type {tableaux} from '@constl/ipa';
import { useOrbiter } from '/@/plugins/orbiter/utils';

const props = defineProps<{site: tableaux.élémentDonnées<TrustedSite>}>();

const { orbiter } = useOrbiter();

const untrustSite = async () => {
  await orbiter.untrustSite({elementId: props.site.id});
};
</script>
