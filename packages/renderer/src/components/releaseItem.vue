<template>
  <ReleaseDialog
    :release="info"
    :active="myRelease"
  >
    <template #activator="{props}">
      <v-list-item
        v-bind="props"
        :prepend-avatar="thumbnailURL"
      >
        <v-list-item-title>
          {{ info.élément.données.contentName }}
        </v-list-item-title>
        <v-list-item-subtitle>
          {{ info.élément.données.metadata }}
        </v-list-item-subtitle>
        <div class="my-2">
          <UserChip :account-id="info.idBdCompte" />
          <v-chip
            class="mx-2"
            label
            @click.stop
          >
            CID: {{ info.élément.données.file.cid }}
          </v-chip>
          <v-chip
            class="mx-2"
            label
            @click.stop
          >
            Author: {{ info.élément.données.author || 'Anonymous' }}
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
  </ReleaseDialog>
</template>

<script setup lang="ts">
import {computed, inject, onMounted, onUnmounted, ref, watchEffect} from 'vue';
import type Orbiter from '/@/plugins/orbiter/orbiter';
import type {Release} from '/@/plugins/orbiter/types';

import type {élémentDeMembre} from '@constl/ipa/dist/src/reseau';
import UserChip from '/@/components/userChip.vue';
import ReleaseDialog from '/@/components/releaseDialog.vue';
import {downloadFile} from '/@/utils';

export interface ReleaseProps {
  info: élémentDeMembre<Release>;
}

const orbiter: Orbiter = inject('orbiter')!;

const props = defineProps<ReleaseProps>();

const myAccountId = ref<string>();

const myRelease = computed(() => {
  return props.info.idBdCompte === myAccountId.value;
});

const thumbnailURL = ref<string>();
watchEffect(async () => {
  const {thumbnail} = props.info.élément.données;

  if (thumbnail) {
    const image = await orbiter.constellation!.obtFichierSFIP({
      id: thumbnail.cid,
      max: 1500 * 1000, // 1.5 MB,
    });
    if (image) {
      thumbnailURL.value = URL.createObjectURL(
        new Blob([image.buffer], {type: `image/${thumbnail.ext}`}),
      );
    } else {
      thumbnailURL.value = undefined;
    }
  } else {
    thumbnailURL.value = undefined;
  }
});

async function removeRelease() {
  await orbiter.removeRelease(props.info.élément.empreinte);
}

async function downloadRelease() {
  const {file, contentName} = props.info.élément.données;

  const releaseFile = await orbiter.constellation!.obtFichierSFIP({
    id: file.cid,
  });
  const filename = `${contentName}.${file.ext}`;

  if (releaseFile) {
    downloadFile(filename, releaseFile);
  }
}

async function blockRelease() {
  await orbiter.blockRelease(props.info.élément.données.file.cid);
}

let forgetAccountId: (() => Promise<void>) | undefined = undefined;

onMounted(async () => {
  forgetAccountId = await orbiter.onAccountChange({f: a => (myAccountId.value = a)});
});

onUnmounted(async () => {
  if (forgetAccountId) await forgetAccountId();
});
</script>
