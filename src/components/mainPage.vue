<template>
    <h1 class="my-3">Browse releases</h1>
    <v-list v-if="accountInitialised" class="mb-4 text-start">
        <v-list-item @click="addRelease">
            <template v-slot:prepend>
                <v-icon>mdi-plus</v-icon>
            </template>
            <v-list-item-title>Add new release</v-list-item-title>
        </v-list-item>
    </v-list>
    <v-list v-if="!!releasesToShow && releasesToShow.length" class="text-start">
        <release v-for="r in releasesToShow" :key="r.élément.données.CID" :info="r"/>
    </v-list>
    <h3 class="text-center mt-4" v-if="!!releasesToShow && releasesToShow.length===0">
        No releases found
    </h3>
    
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from "uuid";
import Riff, { Release as ReleaseInfo } from "@/plugins/riff/riff"

import Release from "@/components/release.vue"

import { ref, inject, onMounted, onUnmounted, computed } from 'vue'
import { élémentDeMembre } from "@constl/ipa/dist/reseau";
const riff = inject('riff') as Riff

const accountInitialised = ref<boolean|undefined>(undefined);
const account = ref<string>();
const allReleases = ref<élémentDeMembre<ReleaseInfo>[]>();
const blockedCIDs = ref<string[]>();

const releasesToShow = computed(() => allReleases.value?.filter(r=>blockedCIDs.value && !blockedCIDs.value.includes(r.élément.données.CID)))

async function addRelease() {
    if (!account.value) throw new Error("Account not ready.");
    riff.addRelease({
        CID: uuidv4(),
        thumbnail: uuidv4(),
        metadata: uuidv4(),
        author: account.value,
    });
}

let forgetAccountExists: (() => void) | undefined = undefined
let forgetAccount: (() => void) | undefined = undefined
let forgetReleases: (() => void) | undefined = undefined
let forgetBlockedCIDs: (() => void) | undefined = undefined

onMounted(async () => {
  forgetAccountExists = await riff.onAccountExists(a=>accountInitialised.value = a)
  forgetAccount = await riff.onAccountChange(a=>account.value = a)
  forgetReleases = await riff.onReleasesChange(rs=>allReleases.value = rs)
  forgetBlockedCIDs = await riff.onBlockedReleasesChange(x=>blockedCIDs.value = x)
})

onUnmounted(async () => {
  if (forgetAccountExists) await forgetAccountExists()
  if (forgetAccount) await forgetAccount()
  if (forgetReleases) await forgetReleases()
  if (forgetBlockedCIDs) await forgetBlockedCIDs()
})

</script>
