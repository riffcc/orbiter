<template>
  <v-app-bar>
    <template #prepend>
      <v-app-bar-nav-icon v-show="false"></v-app-bar-nav-icon>
    </template>

    <v-app-bar-title>Orbiter.CC</v-app-bar-title>

    <template #append>
      <AccountMenu />
      <SettingsDialog />
    </template>
  </v-app-bar>
</template>

<script setup lang="ts">
import SettingsDialog from '/@/components/settings/settingsDialog.vue';
import AccountMenu from '/@/components/account/accountMenu.vue';
</script>
