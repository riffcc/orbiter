<template>
    <v-list-item>
        <v-list-item-title>
            {{ site.siteName }}
        </v-list-item-title>
        <v-list-item-actions>
            <v-btn icon @click.stop @click="untrustSite">
                <v-icon>mdi-delete</v-icon>
            </v-btn>
        </v-list-item-actions>
    </v-list-item>
</template>

<script setup lang="ts">
import { inject } from 'vue';

import Riff from '@/plugins/riff/riff';
import { TrustedSite } from '@/plugins/riff/types';


const props = defineProps<{site: TrustedSite, hash: string}>();

const riff = inject<Riff>("riff")!;

const untrustSite = async () => {
    await riff.untrustSite(props.hash);
}

</script>