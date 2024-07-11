<template>
  <ReleaseViewer :release="release">
    <template #activator="{props: activatorProps}">
      <v-list-item
        v-bind="activatorProps"
        :prepend-avatar="thumbnailURL"
      >
        <v-list-item-title>
          {{ release.release.contentName }}
        </v-list-item-title>
        <v-list-item-subtitle>
          {{ release.release.metadata }}
        </v-list-item-subtitle>
        <div class="my-2">
          <UserChip :account-id="contributor" />
          <v-chip
            class="mx-2"
            label
            @click.stop
          >
            CID: {{ release.release.file }}
          </v-chip>
          <v-chip
            class="mx-2"
            label
            @click.stop
          >
            Author: {{ release.release.author || 'Anonymous' }}
          </v-chip>
        </div>

        <template #append>
          <v-btn
            icon="mdi-download"
            class="mx-2"
            @click.stop
            @click="downloadRelease"
          ></v-btn>
          <v-btn
            v-if="myRelease"
            class="mx-2"
            icon
            @click.stop
            @click="removeRelease"
          >
            <v-icon color="error">mdi-delete</v-icon>
          </v-btn>
          <v-btn
            icon
            class="mx-2"
            @click.stop
            @click="blockRelease"
          >
            <v-icon color="error">mdi-flag</v-icon>
          </v-btn>
        </template>
      </v-list-item>
    </template>
  </ReleaseViewer>
</template>

<script setup lang="ts">
import type {ReleaseWithId} from '/@/plugins/orbiter/types';

import {computed, onMounted, onUnmounted, ref, watchEffect} from 'vue';

import UserChip from '/@/components/userChip.vue';
import ReleaseViewer from './releaseViewer.vue';
import {downloadFile} from '/@/utils';
import { useOrbiter } from '/@/plugins/orbiter/utils';


const { orbiter } = useOrbiter();

const props = defineProps<{ release: ReleaseWithId; contributor: string; site: string; }>();

const myAccountId = ref<string>();

const myRelease = computed(() => {
  return props.contributor === myAccountId.value;
});

const thumbnailURL = ref<string>();
watchEffect(async () => {
  const {thumbnail} = props.release.release;

  if (thumbnail) {
    const image = await orbiter.constellation.obtFichierSFIP({
      id: thumbnail,
      max: 1500 * 1000, // 1.5 MB,
    });
    if (image) {
      thumbnailURL.value = URL.createObjectURL(
        new Blob([image.buffer], {type: `image/${thumbnail.split('.')[1]}`}),
      );
    } else {
      thumbnailURL.value = undefined;
    }
  } else {
    thumbnailURL.value = undefined;
  }
});

async function removeRelease() {
  await orbiter.removeRelease(props.release.id);
}

async function downloadRelease() {
  const {file, contentName} = props.release.release;

  const releaseFile = await orbiter.constellation.obtFichierSFIP({
    id: file,
  });

  if (releaseFile) {
    downloadFile(contentName, releaseFile);
  }
}

async function blockRelease() {
  await orbiter.blockRelease({cid: props.release.release.file});
}

let forgetAccountId: (() => Promise<void>) | undefined = undefined;

onMounted(async () => {
  forgetAccountId = await orbiter.listenForAccountId({f: a => (myAccountId.value = a)});
});

onUnmounted(async () => {
  if (forgetAccountId) await forgetAccountId();
});
</script>
