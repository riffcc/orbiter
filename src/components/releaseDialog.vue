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
                <v-select v-model="releaseType" :items="riff.contentTypes" variant="outlined" label="Content type"></v-select>
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
import { RELEASES_AUTHOR_COLUMN, RELEASES_FILE_COLUMN, RELEASES_METADATA_COLUMN, RELEASES_NAME_COLUMN, RELEASES_THUMBNAIL_COLUMN, RELEASES_TYPE_COLUMN } from '@/plugins/riff/consts';

const riff = inject<Riff>("riff")!;

const props = defineProps({
    release: {
        type: Object as PropType<élémentDeMembre<Release>>,
    },
    active: {
        type: Boolean,
        default: true
    }
});

// Allow same component to be used for both creating and editing releases
const newRelease = computed(()=>!props.release);

const readyToSave = computed(()=>{
    return !!((file.value || existingContentFile.value) && author.value && releaseName.value && releaseType.value)
})

const dialog = ref(false);
const saving = ref(false);

const file = ref<File[]>();
const releaseType = ref<string>();
const thumbnail = ref<File[]>();
const author = ref<string>();
const releaseName = ref<string>();
const metadata = ref<string>();

const save = async () => {
    if (!readyToSave.value) return;

    saving.value = true;

    const fileEntry = file.value?.length ? {
        cid: await riff.constellation!.ajouterÀSFIP({
            fichier: file.value![0]
        }),
        ext: file.value![0].name.split(".").pop()!,
    } : existingContentFile.value as { cid: string, ext: string };  // We know it exists if readyToSave was true

    // If not specified, use existing CID if available (only relevant on editing existing release).
    const thumbnailEntry = thumbnail.value?.length ? { 
        cid: await riff.constellation!.ajouterÀSFIP({
            fichier: thumbnail.value[0]
        }), 
        ext: thumbnail.value[0].name.split(".").pop()!
    } : existingThumbnailFile.value

    if (newRelease.value) {
        await riff.addRelease({
            [RELEASES_FILE_COLUMN]: fileEntry,
            [RELEASES_TYPE_COLUMN]: releaseType.value!,
            [RELEASES_THUMBNAIL_COLUMN]: thumbnailEntry,
            [RELEASES_NAME_COLUMN]: releaseName.value!,
            [RELEASES_METADATA_COLUMN]: metadata?.value,
            [RELEASES_AUTHOR_COLUMN]: author.value!
        });
    } else {
        await riff.editRelease({
            releaseHash: props.release!.élément.empreinte, 
            release: {
                [RELEASES_FILE_COLUMN]: fileEntry,
                [RELEASES_TYPE_COLUMN]: releaseType.value!,
                [RELEASES_THUMBNAIL_COLUMN]: thumbnailEntry,
                [RELEASES_NAME_COLUMN]: releaseName.value!,
                [RELEASES_METADATA_COLUMN]: metadata?.value,
                [RELEASES_AUTHOR_COLUMN]: author.value!
            }
        })
    }
    
    saving.value = false;
    clearDialog();
};

const clearDialog = () => {
    dialog.value = false;

    file.value = undefined;
    releaseType.value = undefined;
    thumbnail.value = undefined;
    author.value = undefined;
    releaseName.value = undefined;
    metadata.value = undefined;

    saving.value = false;
}

const existingThumbnailFile = ref<{cid: string, ext: string}>();
const existingContentFile = ref<{cid: string, ext: string}>();

watchEffect(()=>author.value = props.release?.élément.données.author);
watchEffect(()=>metadata.value = props.release?.élément.données.metadata);
watchEffect(()=>releaseName.value = props.release?.élément.données.contentName);
watchEffect(()=>existingContentFile.value = props.release?.élément.données.file);
watchEffect(()=>existingThumbnailFile.value = props.release?.élément.données.thumbnail);

</script>