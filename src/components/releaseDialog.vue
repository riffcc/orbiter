<template>
    <v-dialog
        v-model="dialog"
        max-width="800"
    >
        <template v-slot:activator="{props}">
            <slot name="activator" v-bind="{ props }"></slot>
        </template>
        <v-card>
            <v-card-title>{{ newRelease ? "New release" : "Edit release" }}</v-card-title>
            <br/>
            <v-card-text>
                <v-file-input v-model="file" variant="outlined" label="Content file"></v-file-input>
                <v-text-field variant="outlined" label="Release name" hint="The name of the content"></v-text-field>
                <v-text-field variant="outlined" label="Description" hint=""></v-text-field>
                <v-text-field variant="outlined" label="Author" hint="The person who created this content"></v-text-field>
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

const props = defineProps<{releaseHash?: élémentDeMembre<Release>}>()

// Allow same component to be used for both creating and editing releases
const newRelease = computed(()=>!props.releaseHash);

const readyToSave = computed(()=>{
    return !!author.value
})

const dialog = ref(false);
const saving = ref(false);

const file = ref<File[]>();
const author = ref<string>();

const save = async () => {
    if (!readyToSave.value) return;

    saving.value = true;

    const CID = await riff.constellation!.ajouterÀSFIP({
        fichier: file.value![0]
    });

    await riff.addRelease({
        CID,
        thumbnail,
        metadata,
        author: author.value!
    })
    saving.value = false;
    clearDialog();
}

const clearDialog = () => {
    dialog.value = false;
}

</script>