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
        <v-card-title class="d-flex">
          {{ release.élément.données.contentName }}
          <v-spacer />
          <v-btn
            icon="mdi-close"
            @click="dialog = false"
          />
        </v-card-title>
        <v-divider />
      </v-card-item>
      <v-card-text>
        <audio-viewer
          v-if="release.élément.données.type === 'audio'"
          :file="release.élément.données.file"
        />
        <video-viewer
          v-else-if="release.élément.données.type === 'movie'"
          :file="release.élément.données.file"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import {ref} from 'vue';
import type {Release} from '/@/plugins/orbiter/types';

import type {élémentDeMembre} from '@constl/ipa/dist/src/reseau';
import AudioViewer from './audioViewer.vue';
import VideoViewer from './videoViewer.vue';

export interface ReleaseProps {
  release: élémentDeMembre<Release>;
}

defineProps<ReleaseProps>();

// Potentially eventually useful: Reference for media file type conversions https://ffmpegwasm.netlify.app/

// Navigation
const dialog = ref(false);
</script>
