<template>
  <div>
    <h2>Riff.CC Connections</h2>
    <v-divider
      v-if="RiffMembers"
      class="my-2"
    />
    <v-progress-linear
      v-else
      class="my-2"
      indeterminate
      :height="1"
    />
    <v-list>
      <v-list-item v-if="RiffMembers && !RiffMembers.length">
        <v-list-item-title>You seem to be alone...</v-list-item-title>
      </v-list-item>
      <v-list-item
        v-for="con in RiffMembers"
        :key="con.infoMembre.idCompte"
      >
        <v-list-item-title>
          {{ con.infoMembre.idCompte }}
        </v-list-item-title>
        <v-list-item-subtitle>
          {{ con.infoMembre.idCompte }}
        </v-list-item-subtitle>
      </v-list-item>
    </v-list>

    <h2>IPFS Connections</h2>
    <v-divider
      v-if="IPFSConnections"
      class="my-2"
    />
    <v-progress-linear
      v-else
      class="my-2"
      indeterminate
      :height="1"
    />
    <v-list>
      <v-list-item v-if="IPFSConnections && !IPFSConnections.length">
        <v-list-item-title>No IPFS connections either...</v-list-item-title>
      </v-list-item>
      <v-list-item
        v-for="con in IPFSConnections"
        :key="con.pair"
      >
        <v-list-item-title>
          {{ con.pair }}
        </v-list-item-title>
        <v-list-item-subtitle>
          {{ con.adresses }}
        </v-list-item-subtitle>
      </v-list-item>
    </v-list>
  </div>
</template>
<script setup lang="ts">
import {suivre as follow} from '@constl/vue';

import {computed} from 'vue';
import {RIFFCC_PROTOCOL} from '/@/utils';

import {useOrbiter} from '/@/plugins/orbiter/utils';

const {orbiter} = useOrbiter();

const IPFSConnections = follow(orbiter.constellation.réseau.suivreConnexionsPostesSFIP);

const ConstellationMembers = follow(orbiter.constellation.réseau.suivreConnexionsMembres);
const RiffMembers = computed(() => {
  return ConstellationMembers.value?.filter(c => c.infoMembre.protocoles.includes(RIFFCC_PROTOCOL));
});
</script>
