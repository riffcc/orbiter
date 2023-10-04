<template>
  <v-card>
    <v-card-text>
      <audio
        id="player"
        controls
        autoplay
      >
        <source
          :src="audioSource"
          type="audio/mp3"
        />
      </audio>
      {{ audioSource }}
    </v-card-text>
  </v-card>
</template>
<script setup lang="ts">
import {inject, ref, onMounted} from 'vue';
import type Orbiter from '/@/plugins/orbiter/orbiter';
// import Plyr from 'plyr';

const props = defineProps<{file: {cid: string; ext: string}}>();

const orbiter: Orbiter = inject('orbiter')!;

const audioSource = ref<string>();

onMounted(async () => {
  const audioData = await orbiter.constellation.obtFichierSFIP({
    id: props.file.cid,
  });
  console.log(audioData);
  if (audioData) audioSource.value = URL.createObjectURL(new Blob([audioData.buffer]));
});
</script>
