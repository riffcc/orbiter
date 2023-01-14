<template>
    <ReleaseDialog :release="info" :active="myRelease">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props">
            <template v-slot:prepend>
                <img v-if="thumbnailURL" :src="thumbnailURL" width="30"/>
                <v-icon v-else>mdi-file</v-icon>
            </template>
            <v-list-item-title>
              {{ info.élément.données.contentName }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ info.élément.données.metadata }}
            </v-list-item-subtitle>
            <v-list-item-content>
              <div class="my-2">
                <UserChip :accountId="info.idBdCompte" />
                <v-chip class="mx-2" label @click.stop>CID: {{info.élément.données.cid}}</v-chip>
                <v-chip class="mx-2" label @click.stop>Author: {{info.élément.données.author || "Anonymous"}}</v-chip>
              </div>
            </v-list-item-content>
            
            <template v-slot:append>
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
import { computed, inject, onMounted, onUnmounted, ref, watchEffect } from 'vue'
import Riff from "@/plugins/riff/riff";
import { Release } from "@/plugins/riff/types"

import { élémentDeMembre } from '@constl/ipa/dist/reseau';
import UserChip from '@/components/userChip.vue';
import ReleaseDialog from '@/components/releaseDialog.vue';
import { downloadFile } from '@/utils';

const riff: Riff = inject('riff')!;

interface Props {
  info: élémentDeMembre<Release>
}
const props = defineProps<Props>()

const myAccountId = ref<string>();

const myRelease = computed(()=>{
  return props.info.idBdCompte === myAccountId.value
});

const thumbnailURL = ref<string>();
watchEffect(async () => {
  const { thumbnail } = props.info.élément.données;

  if (thumbnail) {
    const image = await riff.constellation!.obtFichierSFIP({
      id: thumbnail.cid,
      max: 1500 * 1000 // 1.5 MB,
    });
    if (image) {
      thumbnailURL.value = URL.createObjectURL(
        new Blob([image.buffer], { type: `image/${thumbnail.ext}` })
      );
    } else {
      thumbnailURL.value = undefined;
    };
  } else {
      thumbnailURL.value = undefined;
  };
})

async function removeRelease() {
  await riff.removeRelease(props.info.élément.empreinte)
}

async function downloadRelease() {
  const { file, contentName } = props.info.élément.données

  const releaseFile = await riff.constellation!.obtFichierSFIP({
    id: file.cid
  });
  const filename = `${contentName}.${file.ext}`

  if (releaseFile) {
    downloadFile(filename, releaseFile)
  }
}

async function blockRelease() {
  await riff.blockRelease(props.info.élément.données.file.cid)
}

let forgetAccountId: (()=>Promise<void>)|undefined = undefined;

onMounted(async () => {
  forgetAccountId = await riff.onAccountChange({ f: a => myAccountId.value = a});
});

onUnmounted(async () => {
  if (forgetAccountId) await forgetAccountId();
});

</script>
