<template>
    <h1 class="my-3">Browse releases</h1>
    <v-list v-if="accountInitialised" class="mb-4 text-start">
        <ReleaseDialog>
            <template v-slot:activator="{ props }">
                <v-list-item v-bind="props">
                    <template v-slot:prepend>
                        <v-icon>mdi-plus</v-icon>
                    </template>
                    <v-list-item-title>Add new release</v-list-item-title>
                </v-list-item>
            </template>
        </ReleaseDialog>
    </v-list>
    <v-list v-if="!!releases && releases.length" class="text-start">
        <release v-for="r in releases" :key="r.élément.données.file.cid" :info="r"/>
    </v-list>
    <h3 class="text-center mt-4" v-if="!!releases && releases.length===0">
        No releases found
    </h3>
    
</template>

<script setup lang="ts">
import Riff from "@/plugins/riff/riff"
import { Release as ReleaseInfo } from "@/plugins/riff/types"

import Release from "@/components/release.vue";
import ReleaseDialog from "@/components/releaseDialog.vue";

import { ref, inject, onMounted, onUnmounted, computed } from 'vue'
import { élémentDeMembre } from "@constl/ipa/dist/reseau";

const riff = inject('riff') as Riff;

const accountInitialised = ref<boolean|undefined>(undefined);
const account = ref<string>();
const releases = ref<élémentDeMembre<ReleaseInfo>[]>();

let forgetAccountExists: (() => void) | undefined = undefined
let forgetAccount: (() => void) | undefined = undefined
let forgetReleases: (() => void) | undefined = undefined

onMounted(async () => {
  forgetAccountExists = await riff.onAccountExists({f: a=>accountInitialised.value = a})
  forgetAccount = await riff.onAccountChange({f: a=>account.value = a})
  forgetReleases = await riff.onReleasesChange({f: rs=>releases.value = rs})
})

onUnmounted(async () => {
  if (forgetAccountExists) await forgetAccountExists()
  if (forgetAccount) await forgetAccount()
  if (forgetReleases) await forgetReleases()
})

</script>
