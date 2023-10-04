<template>
  <v-menu open-on-hover>
    <template #activator="{props: activatorProps}">
      <v-avatar
        v-bind="activatorProps"
        :image="userAvatar"
      />
    </template>
    <v-list>
      <v-list-item
        title="Manage account"
        prepend-icon="mdi-account"
        @click="$router.push('/account')"
      />
      <v-list-item
        title="Site info"
        prepend-icon="mdi-cog"
      />
      <v-list-item
        title="About Riff.CC"
        prepend-icon="mdi-information-outline"
      />
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import type Orbiter from '/@/plugins/orbiter/orbiter';

import {inject, ref} from 'vue';
import {registerListener} from '/@/utils';
import {useUserProfilePhoto} from '/@/components/users/utils';

const orbiter = inject<Orbiter>('orbiter');

// User avatar
const accountId = ref<string>();
registerListener(orbiter?.onAccountChange({f: id => (accountId.value = id)}));

const userAvatar = useUserProfilePhoto(accountId);
</script>
