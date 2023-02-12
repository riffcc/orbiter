<template>
  <v-chip
    class="mx-2"
    label
  >
    Uploaded by: {{ displayName }}
  </v-chip>
</template>

<script setup lang="ts">
import type Orbiter from '/@/plugins/orbiter/orbiter';
import {computed, inject, onMounted, onUnmounted, ref} from 'vue';

import {selectTranslation} from '/@/utils';

const orbiter: Orbiter = inject('orbiter')!;

const props = defineProps<{accountId: string}>();

const names = ref<{[language: string]: string}>();

const displayName = computed(() => {
  return selectTranslation(names.value) || 'Anonymous';
});

let forgetNames: (() => Promise<void>) | undefined = undefined;

onMounted(async () => {
  forgetNames = await orbiter.onNameChange({
    f: x => (names.value = x),
    accountId: props.accountId,
  });
});

onUnmounted(async () => {
  if (forgetNames) await forgetNames();
});
</script>
