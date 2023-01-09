<template>
    <v-dialog
        v-model="dialog"
        max-width="800"
        :disabled="!active"
    >
        <template v-slot:activator="{props}">
            <slot name="activator" v-bind="{ props }"></slot>
        </template>
        <v-card>
            <v-card-title>{{ newRelease ? "New release" : "Edit release" }}</v-card-title>
            <v-card-text>
                <v-file-input v-model="file" variant="outlined" label="Content file"></v-file-input>
                <v-file-input v-model="thumbnail" accept="image/*" variant="outlined" label="File icon (optional)"></v-file-input>
                <v-text-field v-model="releaseName" variant="outlined" label="Release name" hint="The name of the content"></v-text-field>
                <v-text-field v-model="metadata" variant="outlined" label="Description" hint=""></v-text-field>
                <v-text-field v-model="author" variant="outlined" label="Author" hint="The person who created this content"></v-text-field>
            </v-card-text>
            <v-card-actions>
                <v-btn color="primary" :loading="saving" :disabled="!readyToSave" @click="save">
                    {{ newRelease ? "Add release" : "Save changes" }}
                </v-btn>
                <v-btn @click="clearDialog">Cancel</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue';

import { élémentDeMembre } from '@constl/ipa/dist/reseau';

import Riff, { Release } from '@/plugins/riff/riff';

const riff = inject<Riff>("riff")!;

const props = defineProps<{releaseHash?: élémentDeMembre<Release>, active: boolean}>()

// Allow same component to be used for both creating and editing releases
const newRelease = computed(()=>!props.releaseHash);

const readyToSave = computed(()=>{
    return !!(file.value && author.value && releaseName.value)
})

const dialog = ref(false);
const saving = ref(false);

const file = ref<File[]>();
const thumbnail = ref<File[]>();
const author = ref<string>();
const releaseName = ref<string>();
const metadata = ref<string>();

const save = async () => {
    if (!readyToSave.value) return;

    saving.value = true;

    const cid = await riff.constellation!.ajouterÀSFIP({
        fichier: file.value![0]
    });

    const thumbnailCID = thumbnail.value?.length ? await riff.constellation!.ajouterÀSFIP({
        fichier: thumbnail.value[0]
    }) : undefined

    if (newRelease.value) {
        await riff.addRelease({
            cid,
            thumbnail: thumbnailCID,
            name: releaseName.value!,
            metadata: metadata?.value,
            author: author.value!
        });
    };
    
    saving.value = false;
    clearDialog();
}

const clearDialog = () => {
    dialog.value = false;
}

</script>