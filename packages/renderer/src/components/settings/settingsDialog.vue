<template>
  <v-dialog
    v-model="dialog"
    max-width="600"
  >
    <template #activator="{on, attrs}">
      <v-btn
        icon="mdi-cog"
        v-bind="{on, attrs}"
        @click="dialog = true"
      ></v-btn>
    </template>
    <v-card>
      <v-card-title>
        Settings
        <v-btn icon>
          <v-icon @click="dialog = false">mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider />
      <v-card-text>
        <div v-if="accountExists">
          <v-tabs v-model="tab">
            <v-tab value="account">My account</v-tab>
            <v-tab
              v-show="moderator"
              value="moderation"
            >
              Moderation
            </v-tab>
            <v-tab value="connectivity">Connectivity</v-tab>
          </v-tabs>
          <v-card-text>
            <v-window v-model="tab">
              <v-window-item value="account">
                <AccountPane />
              </v-window-item>

              <v-window-item
                v-show="moderator"
                value="moderation"
              >
                <ModPane />
              </v-window-item>

              <v-window-item value="connectivity">
                <ConnectivityPane />
              </v-window-item>
            </v-window>
          </v-card-text>
        </div>
        <v-row
          v-else
          class="d-flex align-center justify-center my-6"
        >
          <initiate-account>
            <template #activator="{props}">
              <v-list-item v-bind="props">
                <v-btn
                  class="mx-auto"
                  color="primary"
                  min-width="228"
                  size="x-large"
                  target="_blank"
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
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import {ref, inject, onMounted, onUnmounted} from 'vue';

import initiateAccount from '/@/components/initiateAccount.vue';

import type Orbiter from '/@/plugins/orbiter/orbiter';
import AccountPane from './accountPane.vue';
import ModPane from './modPane.vue';
import ConnectivityPane from './connectivityPane.vue';

const orbiter: Orbiter = inject('orbiter')!;

const dialog = ref(false);
const tab = ref('account');

const account = ref<string>();
const accountExists = ref<boolean>();
const moderator = ref<boolean>();

let forgetAccount: (() => void) | undefined = undefined;
let forgetAccountExists: (() => void) | undefined = undefined;
let forgetModerator: (() => void) | undefined = undefined;

onMounted(async () => {
  forgetAccount = await orbiter.onAccountChange({f: a => (account.value = a)});
  forgetAccountExists = await orbiter.onAccountExists({f: a => (accountExists.value = a)});
  forgetModerator = await orbiter.onIsModChange({f: isMod => (moderator.value = isMod)});
});

onUnmounted(async () => {
  if (forgetAccount) await forgetAccount();
  if (forgetAccountExists) await forgetAccountExists();
  if (forgetModerator) await forgetModerator();
});
</script>
