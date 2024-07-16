<template>
  <v-img
    contain
    height="300"
    src="src/assets/logo.svg"
  />

  <div class="text-body-2 font-weight-light mb-n1">Welcome to</div>

  <h1 class="text-h2 font-weight-bold">Orbiter.CC</h1>

  <div class="text-body-2 italic">E cinere surgemus</div>

  <div class="py-14" />

  <initiateModDBs />

  <v-row
    v-if="orbiterReady"
    class="d-flex align-center justify-center"
  >
    <v-col cols="auto">
      <v-btn
        min-width="164"
        rel="noopener noreferrer"
        target="_blank"
        variant="text"
        @click="emit('enter')"
      >
        <v-icon
          icon="mdi-view-dashboard"
          size="large"
          start
        />

        Just browse
      </v-btn>
    </v-col>

    <v-col cols="auto">
      <initiate-account>
        <template #activator="{props}">
          <v-list-item v-bind="props">
            <v-btn
              color="primary"
              min-width="228"
              rel="noopener noreferrer"
              size="x-large"
              variant="flat"
            >
              <v-icon
                icon="mdi-speedometer"
                size="large"
                start
              />
              Create account
            </v-btn>
          </v-list-item>
        </template>
      </initiate-account>
    </v-col>

    <v-col cols="auto">
      <v-btn
        href="https://community.vuetifyjs.com/"
        min-width="164"
        rel="noopener noreferrer"
        target="_blank"
        variant="text"
      >
        <v-icon
          icon="mdi-account-group"
          size="large"
          start
        />

        View docs
      </v-btn>
    </v-col>
  </v-row>
  <v-row
    v-else-if="siteConfigured"
    class="d-flex align-center justify-center"
  >
    <v-col cols="auto">
      <v-progress-circular
        indeterminate
        :size="100"
        :width="15"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import {suivre as follow} from '@constl/vue';
import {onMounted, ref} from 'vue';

import {useOrbiter} from '/@/plugins/orbiter/utils';

import initiateAccount from '/@/components/initiateAccount.vue';
import initiateModDBs from '/@/components/initiateModDBs.vue';

const {orbiter} = useOrbiter();

const orbiterReady = ref<boolean>(false);
onMounted(async () => {
  await orbiter.siteConfigured();
  orbiterReady.value = true;
});

// const accountExists = follow(orbiter.listenForAccountExists);

const siteConfigured = follow(({f}) => orbiter.listenForSiteConfigured({f}));

const emit = defineEmits<{
  (e: 'enter'): void;
}>();
</script>
