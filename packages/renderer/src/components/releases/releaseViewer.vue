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
          {{ release.release.contentName }}
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
          v-if="release.release.type === 'audio'"
          :file="release.release.file"
        />
        <video-viewer
          v-else-if="release.release.type === 'movie'"
          :file="release.release.file"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import {ref} from 'vue';
import type {ReleaseWithId} from '/@/plugins/orbiter/types';

import AudioViewer from './audioViewer.vue';
import VideoViewer from './videoViewer.vue';

export interface ReleaseProps {
  release: ReleaseWithId;
}

defineProps<ReleaseProps>();

// Potentially eventually useful: Reference for media file type conversions https://ffmpegwasm.netlify.app/

// Navigation
const dialog = ref(false);
</script>
