<template>
  <v-chip :prepend-avatar="userAvatar">
    {{ displayName }}
  </v-chip>
</template>
<script setup lang="ts">
import type Orbiter from '/@/plugins/orbiter/orbiter';

import {computed, inject, ref} from 'vue';
import {registerListener, selectTranslation} from '/@/utils';

import {useUserProfilePhoto} from './utils';

const orbiter: Orbiter = inject('orbiter')!;

const props = defineProps<{accountId?: string}>();

// User name
const names = ref<{[language: string]: string}>();
registerListener(
  orbiter.onNameChange({
    f: x => (names.value = x),
    accountId: props.accountId,
  }),
);

const displayName = computed(() => {
  return selectTranslation(names.value) || 'Anonymous';
});

// User avatar
const userAvatar = useUserProfilePhoto(props.accountId);
</script>
