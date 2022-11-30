<template>
    <v-list-item>
        <template v-slot:prepend>
            <v-icon>mdi-file</v-icon>
        </template>
        <template v-slot:subtitle>
            Uploaded by: {{ info.author }}
        </template>
        <template v-slot:title>
            CID: {{info.CID}}
        </template>
        <template v-slot:append>
          <v-btn
            icon="mdi-download"
          ></v-btn>
          <v-btn
            icon
            @click="removeRelease"
          >
            <v-icon color="error">mdi-delete</v-icon>
          </v-btn>
          <v-btn
            icon
            @click="blockRelease"
          >
            <v-icon color="error">mdi-flag</v-icon>
          </v-btn>
        </template>
    </v-list-item>
</template>

<script setup lang="ts">
import { Release } from "@/plugins/riff/riff";

interface Props {
  info: Release
}
const props = defineProps<Props>()

import { ref, reactive, inject, onMounted, onUnmounted } from 'vue'
const riff = inject('riff')

  async function removeRelease() {
    riff.removeRelease(props.info.CID)
  }

  async function blockRelease() {
    riff.blockRelease(props.info.CID)
  }
</script>
