<template>
    <h1 class="my-3">Browse releases</h1>
    <v-list v-if="account" class="mb-4 text-start">
        <v-list-item @click="addRelease">
            <template v-slot:prepend>
                <v-icon>mdi-plus</v-icon>
            </template>
            <v-list-item-title>Add new release</v-list-item-title>
        </v-list-item>
    </v-list>
    <v-list v-if="!!releasesToShow && releasesToShow.length" class="text-start">
        <release v-for="r in releasesToShow" :key="r.cid" :info="r"/>
    </v-list>
    <h3 class="text-center mt-4" v-if="!!releasesToShow && releasesToShow.length===0">
        No releases found
    </h3>
    
</template>

<script setup lang="ts">
 import { v4 as uuidv4 } from "uuid";

 import Release from "@/components/release.vue"
 import setupRiff from '@/plugins/riff.ts'


  import { ref, reactive, inject, onMounted, onUnmounted, computed } from 'vue'
  const riff = inject('riff')

  const account = ref(undefined);
  const allReleases = ref([]);
  const blockedCIDs = ref(undefined);
  const enterAnonymously = ref(false);

  const releasesToShow = computed(() => allReleases.value.filter(r=>!blockedCIDs.value.includes(r.CID)))


  async function addRelease() {
    riff.addRelease({
        CID: uuidv4(),
        thumbnail: uuidv4(),
        metadata: uuidv4(),
        author: account.value,
    })
  }

  let forgetAccount = undefined
  let forgetReleases = undefined
  let forgetBlockedCIDs = undefined

  onMounted(async () => {
    forgetAccount = await riff.onAccountChange(a=>account.value = a)
    forgetReleases = await riff.onReleasesChange(rs=>allReleases.value = rs)
    forgetBlockedCIDs = await riff.onBlockedReleasesChange(x=>blockedCIDs.value = x)
  })

  onUnmounted(async () => {
    if (forgetAccount) await forgetAccount()
    if (forgetReleases) await forgetReleases()
    if (forgetBlockedCIDs) await forgetBlockedCIDs()
  })

</script>