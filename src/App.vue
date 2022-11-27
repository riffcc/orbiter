<template>
  <v-app>
    <app-bar />
    <v-main>
      <HelloWorld />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
  import HelloWorld from '@/components/HelloWorld.vue'
  import appBar from '@/components/appBar.vue'
</script>
