<template>
  <v-dialog
    v-model="dialog"
    max-width="800"
  >
    <template #activator="{props}">
      <slot
        name="activator"
        v-bind="{props}"
      ></slot>
    </template>
    <v-card>
      <v-card-title>{{ newSite ? 'New release' : 'Edit release' }}</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="siteInfo"
          variant="outlined"
          label="Site name"
        ></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="primary"
          :loading="saving"
          :disabled="!readyToSave"
          @click="save"
        >
          {{ newSite ? 'Trust site' : 'Save changes' }}
        </v-btn>
        <v-btn @click="clearDialog">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import {computed, inject, ref} from 'vue';

import type {TrustedSite} from '/@/plugins/orbiter/types';
import type Orbiter from '/@/plugins/orbiter/orbiter';
import type {élémentDonnées} from '@constl/ipa/dist/src/valid';

const orbiter = inject<Orbiter>('orbiter')!;

const props = defineProps<{site?: élémentDonnées<TrustedSite>}>();

const dialog = ref(false);
const saving = ref(false);

// Allow same component to be used for both creating and editing trusted sites
const newSite = computed(() => !props.site);

const readyToSave = computed(() => {
  return !!siteInfo.value;
});

const siteInfo = ref<string>();

const save = async () => {
  if (!readyToSave.value) return;

  saving.value = true;

  if (newSite.value) {
    await orbiter.trustSite(siteInfo.value!);
  } else {
    await orbiter.editTrustedSite({
      siteHash: props.site!.empreinte,
      site: siteInfo.value!,
    });
  }

  saving.value = false;
  clearDialog();
};

const clearDialog = () => {
  dialog.value = false;

  siteInfo.value = undefined;

  saving.value = false;
};
</script>
