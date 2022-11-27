<template>
    <h1 class="my-3">Browse releases</h1>
    <v-list v-if="account" class="text-start">
        <v-list-item @click="addRelease">
            <template v-slot:prepend>
                <v-icon>mdi-plus</v-icon>
            </template>
            <v-list-item-title>Add new release</v-list-item-title>
        </v-list-item>

        <release v-for="r in allReleases" :key="r.cid" :release="r"/>

    </v-list>
    <h3 class="text-center mt-4" v-if="allReleases !== undefined && allReleases.length===0">
        No releases found
    </h3>
    
</template>

<script setup lang="ts">
 import { v4 as uuidv4 } from "uuid";

 import Release from "@/components/release.vue"
 import setupRiff from '@/plugins/riff.ts'


  import { ref, reactive, inject, onMounted, onUnmounted } from 'vue'
  const riff = inject('riff')

  const account = ref(undefined);
  const allReleases = ref([]);
  const enterAnonymously = ref(false);

  async function addRelease() {
    riff.addRelease({
        CID: uuidv4(),
        thumbnail: uuidv4(),
        metadata: uuidv4(),
    })
  }

  let forgetAccount = undefined
  let forgetReleases = undefined
  onMounted(async () => {
    forgetAccount = await riff.onAccountChange(a=>account.value = a)
    forgetReleases = await riff.onReleasesChange(rs=>{
        // Ugly hack...will have to figure out how this is really done in Vue 3
        while (allReleases.value.length) { allReleases.value.pop(); }; 
        allReleases.value.push(...rs)
    })
  })

  onUnmounted(async () => {
    if (forgetAccount) await forgetAccount()
    if (forgetReleases) await forgetReleases()
  })

</script>