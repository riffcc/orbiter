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

import Riff from '@/plugins/riff/riff';
import { TrustedSite } from '@/plugins/riff/types';
import { élémentDonnées } from '@constl/ipa/dist/valid';


const props = defineProps<{site: élémentDonnées<TrustedSite>}>();

const riff = inject<Riff>("riff")!;

const untrustSite = async () => {
    await riff.untrustSite(props.site.empreinte);
}

</script>