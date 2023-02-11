<template>
    <v-list-item>
        <v-list-item-title>
            {{ site.données.siteName }}
        </v-list-item-title>
        <template v-slot:append>
            <TrustSiteDialog :site="site">
                <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" icon @click.stop>
                        <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                </template>
            </TrustSiteDialog>
            
            <v-btn icon @click.stop @click="untrustSite">
                <v-icon>mdi-delete</v-icon>
            </v-btn>
        </template>
    </v-list-item>
</template>

<script setup lang="ts">
import { inject } from 'vue';

import TrustSiteDialog from './trustSiteDialog.vue';

import Orbiter from '@/plugins/orbiter/orbiter';
import { TrustedSite } from '@/plugins/orbiter/types';
import { élémentDonnées } from '@constl/ipa/dist/valid';


const props = defineProps<{site: élémentDonnées<TrustedSite>}>();

const orbiter = inject<Orbiter>("orbiter")!;

const untrustSite = async () => {
    await orbiter.untrustSite(props.site.empreinte);
}

</script>