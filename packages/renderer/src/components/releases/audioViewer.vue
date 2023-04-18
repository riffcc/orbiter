<template>
  <v-card>
    <v-card-text>
      <video
        ref="video"
        controls
        autoplay
      ></video>
      <div ref="status"></div>
    </v-card-text>
  </v-card>
</template>
<script setup lang="ts">
import {inject, ref, onMounted} from 'vue';
import type Orbiter from '/@/plugins/orbiter/orbiter';
import Hls from 'hls.js';
import HlsjsIpfsLoader from 'hlsjs-ipfs-loader';

const props = defineProps<{file: { cid: string; ext: string; }}>();

const orbiter: Orbiter = inject('orbiter')!;

const video = ref<HTMLMediaElement|null>(null);
const status = ref<Element|null>(null);

// Inspired by: https://discuss.ipfs.tech/t/using-ipfs-to-stream-audio-video-in-the-browser/4908
// ...and especially https://github.com/ipfs-examples/js-ipfs-examples/blob/master/examples/browser-video-streaming/src/index.js

onMounted(()=>{
    Hls.DefaultConfig.loader = HlsjsIpfsLoader;
    Hls.DefaultConfig.debug = false;
    if (Hls.isSupported()) {
        const hls = new Hls();
        // @ts-expect-error ipfs extention config for hls is not included in hls types
        hls.config.ipfs = orbiter.constellation.sfip;
        // @ts-expect-error ipfs extention config for hls is not included in hls types
        hls.config.ipfsHash = props.file.cid;
        
        hls.loadSource('master.m3u8');
        
        if (!video.value) throw new Error("Video element not found. You really shouldn't ever be encountering this error message. If somehow you do, please complain.");

        hls.attachMedia(video.value);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            const node = document.createTextNode('Video ready...');
            status.value?.appendChild(node);

            video.value?.play();
        });
    }
});

</script>