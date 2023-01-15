<template>
    <v-app-bar>
        <template v-slot:prepend>
            <v-app-bar-nav-icon v-show="false"></v-app-bar-nav-icon>
        </template>

        <v-app-bar-title>Riff.CC</v-app-bar-title>

        <template v-slot:append>
            <SettingsDialog/>
        </template>
    </v-app-bar>
</template>

<script setup lang="ts">
import SettingsDialog from '@/components/settings/settingsDialog.vue';

</script>
