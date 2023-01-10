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
import { computed, inject, PropType, ref, watchEffect } from 'vue';

import { élémentDeMembre } from '@constl/ipa/dist/reseau';

import Riff from '@/plugins/riff/riff';
import { Release } from "@/plugins/riff/types"

const riff = inject<Riff>("riff")!;

const props = defineProps({
    release: {
        type: Object as PropType<élémentDeMembre<Release>>,
    },
    active: {
        type: Boolean,
        default: true
    }
})

// Allow same component to be used for both creating and editing releases
const newRelease = computed(()=>!props.release);

const readyToSave = computed(()=>{
    return !!((file.value || existingFileCid.value) && author.value && releaseName.value)
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

    const cid: string = file.value?.length ? await riff.constellation!.ajouterÀSFIP({
        fichier: file.value![0]
    }) : existingFileCid.value as string;  // We know it exists if readyToSave was true

    // If not specified, use existing CID if available (only relevant on editing existing release).
    const thumbnailCID = thumbnail.value?.length ? await riff.constellation!.ajouterÀSFIP({
        fichier: thumbnail.value[0]
    }) : existingThumbnailCid.value

    if (newRelease.value) {
        await riff.addRelease({
            cid,
            thumbnail: thumbnailCID,
            contentName: releaseName.value!,
            metadata: metadata?.value,
            author: author.value!
        });
    } else {
        await riff.editRelease({
            releaseHash: props.release!.élément.empreinte, 
            release: {
                cid,
                thumbnail: thumbnailCID,
                contentName: releaseName.value!,
                metadata: metadata?.value,
                author: author.value!
            }
        })
    }
    
    saving.value = false;
    clearDialog();
}

const clearDialog = () => {
    dialog.value = false;
}

const existingThumbnailCid = ref<string>();
const existingFileCid = ref<string>();

watchEffect(()=>author.value = props.release?.élément.données.author);
watchEffect(()=>metadata.value = props.release?.élément.données.metadata);
watchEffect(()=>releaseName.value = props.release?.élément.données.contentName);
watchEffect(()=>existingFileCid.value = props.release?.élément.données.cid);
watchEffect(()=>existingThumbnailCid.value = props.release?.élément.données.thumbnail);

</script>