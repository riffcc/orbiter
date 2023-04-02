<template>
  <div>
    <h2>Riff.CC Connections</h2>
    <v-divider />
    <v-list>
      <v-list-item v-if="RiffConnections && !RiffConnections.length">
        <v-list-item-title>You seem to be alone...</v-list-item-title>
      </v-list-item>
      <v-list-item
        v-for="con in RiffConnections"
        :key="con.infoMembre.idBdCompte"
      >
        <v-list-item-title>
          {{ con.infoMembre.idBdCompte }}
        </v-list-item-title>
        <v-list-item-subtitle>
          {{ con.infoMembre.idBdCompte }}
        </v-list-item-subtitle>
      </v-list-item>
    </v-list>
    <v-divider class="my-2" />
    <h2>IPFS Connections</h2>
    <v-list>
      <v-list-item v-if="IPFSConnections && !IPFSConnections.length">
        <v-list-item-title>No IPFS connections either...</v-list-item-title>
      </v-list-item>
      <v-list-item
        v-for="con in IPFSConnections"
        :key="con.adresse"
      >
        <v-list-item-title>
          {{ con.pair }}
        </v-list-item-title>
        <v-list-item-subtitle>
          {{ con.adresse }}
        </v-list-item-subtitle>
      </v-list-item>
    </v-list>
  </div>
</template>
<script setup lang="ts">
import {inject, ref} from 'vue';
import {registerListener, RIFFCC_PROTOCOL} from '/@/utils';
import type Orbiter from '/@/plugins/orbiter/orbiter';
import type {statutMembre} from '@constl/ipa/dist/src/reseau';

const orbiter = inject<Orbiter>('orbiter');

const IPFSConnections = ref<
  {
    adresse: string;
    pair: string;
  }[]
>();
registerListener(
  orbiter?.constellation.réseau?.suivreConnexionsPostesSFIP({f: x => (IPFSConnections.value = x)}),
);

const RiffConnections = ref<statutMembre[]>();
registerListener(
  orbiter?.constellation.réseau?.suivreConnexionsMembres({
    f: x => (RiffConnections.value = x.filter(c => c.infoMembre.protocoles.includes(RIFFCC_PROTOCOL))),
  }),
);
</script>
