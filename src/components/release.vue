<template>
    <ReleaseDialog :releaseHash="info">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props">
            <template v-slot:prepend>
                <v-icon>mdi-file</v-icon>
            </template>
            <template v-slot:subtitle>
                Uploaded by: <UserChip :accountId="info.idBdCompte" />
            </template>
            <template v-slot:title>
                CID: {{info.élément.données.CID}}
            </template>
            <template v-slot:append>
              <v-btn
                icon="mdi-download"
              ></v-btn>
              <v-btn
                icon
                @click="removeRelease"
              >
                <v-icon color="error">mdi-delete</v-icon>
              </v-btn>
              <v-btn
                icon
                @click="blockRelease"
              >
                <v-icon color="error">mdi-flag</v-icon>
              </v-btn>
            </template>
          </v-list-item>
        </template>
    </ReleaseDialog>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import Riff, { Release } from "@/plugins/riff/riff";
import { élémentDeMembre } from '@constl/ipa/dist/reseau';
import UserChip from '@/components/userChip.vue';
import ReleaseDialog from './releaseDialog.vue';

interface Props {
  info: élémentDeMembre<Release>
}
const props = defineProps<Props>()

const riff: Riff = inject('riff')!

  async function removeRelease() {
    riff.removeRelease(props.info.élément.empreinte)
  }

  async function blockRelease() {
    riff.blockRelease(props.info.élément.données.CID)
  }
</script>
