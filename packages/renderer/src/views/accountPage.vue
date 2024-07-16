<template>
  <v-img :src="userAvatar" />
  {{ displayName }}
</template>
<script setup lang="ts">
import {computed} from 'vue';
import {selectTranslation} from '/@/utils';

import {suivre as follow} from '@constl/vue';
import {useUserProfilePhoto} from '/@/components/users/utils';
import {useOrbiter} from '/@/plugins/orbiter/utils';

const {orbiter} = useOrbiter();

const props = defineProps<{accountId?: string}>();

// User name
const names = follow(orbiter.listenForNameChange, {accountId: computed(() => props.accountId)});

const displayName = computed(() => {
  return selectTranslation(names.value) || 'Anonymous';
});

// User avatar
const userAvatar = useUserProfilePhoto(props.accountId);
</script>
