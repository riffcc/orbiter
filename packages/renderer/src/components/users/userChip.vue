<template>
  <v-chip :prepend-avatar="userAvatar">
    {{ displayName }}
  </v-chip>
</template>
<script setup lang="ts">
import {computed, ref} from 'vue';
import {registerListener, selectTranslation} from '/@/utils';

import {useUserProfilePhoto} from './utils';
import { useOrbiter } from '/@/plugins/orbiter/utils';

const { orbiter } = useOrbiter();

const props = defineProps<{accountId?: string}>();

// User name
const names = ref<{[language: string]: string}>();
registerListener(
  orbiter.listenForNameChange({
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
