<template>
    <v-chip label>
        {{ displayName }}
    </v-chip>
</template>

<script setup lang="ts">
import Riff from '@/plugins/riff/riff';
import { computed, inject, onMounted, onUnmounted, ref } from 'vue';

const riff: Riff = inject("riff")!;

const props = defineProps<{accountId: string}>();

const names = ref<{[language: string]: string}>();

const displayName = computed(()=>{
    // Constellation has a multilingual-centric structure, but for now the Riff.CC site is monolingual,
    // so we'll just use any name. Once Riff.CC has an internationalised interface, we can match displayed
    // usernames with the viewer's chosen site language here.s
    return names.value && Object.keys(names.value).length ? Object.values(names.value)[0] : "Anonymous"
});

let forgetNames: (() => Promise<void>)|undefined = undefined;

onMounted(async () => {
    forgetNames = await riff.onNameChange({
        f: x => names.value = x,
        accountId: props.accountId
    })
})

onUnmounted(async () => {
    if (forgetNames) await forgetNames();
})

</script>