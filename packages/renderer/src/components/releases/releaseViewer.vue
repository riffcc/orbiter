<template>
  <v-dialog
    v-model="dialog"
    max-width="800"
  >
    <template #activator="{props: activatorProps}">
      <slot
        name="activator"
        v-bind="{props: activatorProps}"
      ></slot>
    </template>
    <v-card>
      <v-card-item>
        <v-card-title>
          {{ info.élément.données.contentName }}
        </v-card-title>
      </v-card-item>
      <audio-viewer 
        v-if="info.élément.données.type === 'audio'" 
        :file="info.élément.données.file"
      />
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import {ref} from 'vue';
import type {Release} from '/@/plugins/orbiter/types';

import type {élémentDeMembre} from '@constl/ipa/dist/src/reseau';
import AudioViewer from './audioViewer.vue';

export interface ReleaseProps {
  info: élémentDeMembre<Release>;
}


defineProps<ReleaseProps>();

// Potentially eventually useful: Reference for media file type conversions https://ffmpegwasm.netlify.app/

// Navigation
const dialog = ref(false);

</script>