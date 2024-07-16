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
      <v-card-item>
        <v-card-title class="d-flex">
          {{ cardTitle }}<v-spacer /><v-btn
            icon="mdi-close"
            @click="clearDialog"
          ></v-btn>
        </v-card-title>
        <v-card-subtitle>{{ cardSubtitle }}</v-card-subtitle>
      </v-card-item>
      <v-card-text style="overflow-y: auto">
        <v-window v-model="step">
          <v-window-item :key="0">
            <v-file-input
              v-model="file"
              variant="outlined"
              label="Content file"
            ></v-file-input>
            <v-select
              v-model="releaseType"
              :items="orbiter.contentTypes"
              variant="outlined"
              label="Content type"
            ></v-select>
          </v-window-item>
          <v-window-item :key="1">
            <v-text-field
              v-model="author"
              variant="outlined"
              label="Author"
              hint="The person who created this content"
            ></v-text-field>
            <v-combobox
              v-model="licence"
              :items="possibleLicences"
              label="Licence"
              variant="outlined"
            ></v-combobox>
          </v-window-item>
          <v-window-item :key="2">
            <v-text-field
              v-model="releaseName"
              variant="outlined"
              label="Release name"
              hint="The name of the content"
            ></v-text-field>
            <v-text-field
              v-model="metadata"
              variant="outlined"
              label="Description"
              hint=""
            ></v-text-field>
          </v-window-item>
          <v-window-item :key="3">
            <v-radio-group
              v-model="optimisationType"
              :disabled="optimising"
            >
              <v-radio
                label="Convert to m3u8 for P2P streaming (recommended; may take a while)"
                value="streaming"
              />
              <v-radio
                label="Optimise mp4 file for streaming"
                value="pseudoStreaming"
              />
              <v-radio
                label="Don't optimise"
                value="none"
              />
            </v-radio-group>
            <v-btn
              :disabled="optimisationType === 'none'"
              :loading="optimising"
              @click="optimise()"
            >
              {{ optimising ? 'Optimising...' : 'Optimise' }}
            </v-btn>
          </v-window-item>
          <v-window-item :key="4">
            <v-file-input
              v-model="thumbnail"
              accept="image/*"
              variant="outlined"
              label="File icon (optional)"
            ></v-file-input>
          </v-window-item>
          <v-window-item :key="5">
            <v-btn
              color="primary"
              :loading="saving"
              :disabled="!readyToSave"
              @click="save"
            >
              Add release
            </v-btn>
          </v-window-item>
        </v-window>
      </v-card-text>

      <v-divider />
      <v-card-actions>
        <v-btn
          v-show="backButton.visible"
          :disabled="!backButton.active"
          @click="back"
        >
          Back
        </v-btn>
        <v-spacer />
        <v-btn
          v-show="nextButton.visible"
          :disabled="!nextButton.active"
          :loading="nextButton.loading"
          variant="outlined"
          @click="next"
        >
          Next
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue';

import type {FFmpeg, fetchFile as FetchFile} from '@ffmpeg/ffmpeg';
import {
  RELEASES_AUTHOR_COLUMN,
  RELEASES_FILE_COLUMN,
  RELEASES_METADATA_COLUMN,
  RELEASES_NAME_COLUMN,
  RELEASES_THUMBNAIL_COLUMN,
  RELEASES_TYPE_COLUMN,
} from '/@/plugins/orbiter/consts';
import {useOrbiter} from '/@/plugins/orbiter/utils';

const {orbiter} = useOrbiter();

// Navigation
const dialog = ref(false);
const step = ref(0);
const stepList = [
  'File',
  'Authorship',
  'Metadata',
  'Convert',
  'Thumbnail',
  'Confirmation',
] as const;
const stepName = computed(() => stepList[step.value]);

const cardTitle = computed(() => {
  switch (stepName.value) {
    case 'File':
      return 'File upload';
    case 'Authorship':
      return 'Authorship';
    case 'Metadata':
      return 'Metadata';
    case 'Convert':
      return 'File optimisation';
    case 'Thumbnail':
      return 'Thumbnail';
    case 'Confirmation':
      return 'Upload';
    default:
      return '';
  }
});

const cardSubtitle = computed(() => {
  switch (stepName.value) {
    case 'File':
      return 'Choose a file to upload';
    case 'Authorship':
      return 'Specify content author and licence';
    case 'Metadata':
      return 'Add metadata';
    case 'Convert':
      return 'Optimise you file for sharing on a P2P network';
    case 'Thumbnail':
      return 'Add a thumbnail to accompany your file';
    case 'Confirmation':
      return 'Release to the network';
    default:
      return '';
  }
});

const nextButton = computed<{active: boolean; visible: boolean; loading?: boolean}>(() => {
  switch (stepName.value) {
    case 'File':
      return {visible: true, active: !!(file.value && releaseType.value)};
    case 'Authorship':
      return {visible: true, active: !!(author.value && licence.value)};
    case 'Metadata':
      return {visible: true, active: !!releaseName.value};
    case 'Convert':
      return {visible: true, active: optimisationType.value === 'none' || !!optimisedContent.value};
    case 'Confirmation':
      return {active: false, visible: false};
    default:
      return {active: true, visible: true};
  }
});

const backButton = computed<{active: boolean; visible: boolean}>(() => {
  switch (stepName.value) {
    case 'File':
      return {active: false, visible: false};
    case 'Confirmation':
      return {active: !saving.value, visible: true};
    default:
      return {active: true, visible: true};
  }
});

const next = async () => {
  switch (stepName.value) {
    case 'Metadata': {
      step.value = isOptimisable.value
        ? stepList.indexOf('Convert')
        : stepList.indexOf('Thumbnail');
      break;
    }
    case 'Convert': {
      step.value++;
      break;
    }
    default:
      step.value++;
      break;
  }
};

const back = () => {
  switch (stepName.value) {
    case 'Thumbnail':
      step.value = isOptimisable.value ? stepList.indexOf('Convert') : stepList.indexOf('Metadata');
      break;

    default:
      step.value--;
      break;
  }
};

// Licence
const possibleLicences = ref<string[]>(['CC BY', 'CC BY-NC', 'CC BY-NC-ND']);

// Optimisations
const extOriginale = computed(() => {
  return file.value?.[0].name.split('.').pop()?.toLowerCase();
});
const isOptimisable = computed(() => {
  return extOriginale.value === 'mp4' || extOriginale.value === 'mov';
});
const optimisationType = ref<'pseudoStreaming' | 'streaming' | 'none'>('streaming');

const optimising = ref(false);

const optimisedContent = ref<{ext: string; content: ArrayBuffer | Uint8Array}>();

const optimise = async () => {
  if (!file.value) return;
  optimisedContent.value = undefined;
  optimising.value = true;

  const content = await file.value[0].arrayBuffer();
  switch (optimisationType.value) {
    case 'pseudoStreaming':
      optimisedContent.value = await optimiseMP4(new Blob([content]));
      break;
    case 'streaming':
      optimisedContent.value = await toM3u8(new Blob([content]));
      break;
    case 'none':
      optimisedContent.value = {
        content,
        ext: file.value?.[0].name.split('.').pop() as string,
      };
      break;
    default:
      break;
  }

  optimising.value = false;
};
let _ffmpeg: {ffmpeg: FFmpeg; fetchFile: typeof FetchFile};
const getFFmpeg = async () => {
  if (!_ffmpeg) {
    const {createFFmpeg, fetchFile} = await import('@ffmpeg/ffmpeg');
    const ffmpeg = createFFmpeg({log: true}); // todo: only for dev
    await ffmpeg.load();
    _ffmpeg = {
      ffmpeg,
      fetchFile,
    };
  }
  return _ffmpeg;
};

const optimiseMP4 = async (
  data: Parameters<typeof FetchFile>[0],
): Promise<{ext: string; content: Uint8Array}> => {
  const {ffmpeg, fetchFile} = await getFFmpeg();

  ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(data));
  // https://en.wikipedia.org/wiki/Progressive_download
  await ffmpeg.run('-movflags', 'faststart', '-acodec', 'copy', '-vcodec', 'copy', 'output.mp4');

  return {
    ext: 'mp4',
    content: ffmpeg.FS('readFile', 'output.mp4'),
  };
};

const toM3u8 = async (
  data: Parameters<typeof FetchFile>[0],
): Promise<{ext: string; content: Uint8Array}> => {
  const {ffmpeg, fetchFile} = await getFFmpeg();
  ffmpeg.FS('writeFile', `input.${extOriginale.value}`, await fetchFile(data));

  await ffmpeg.run(
    '-i',
    `input.${extOriginale.value}`,
    '-profile:v',
    'baseline',
    '-level',
    '3.0',
    '-start_number',
    '0',
    '-hls_time',
    '5',
    '-hls_list_size',
    '0',
    '-f',
    'hls',
    'converted.m3u8',
  );
  return {
    ext: 'm3u8',
    content: ffmpeg.FS('readFile', 'converted.m3u8'),
  };
};

// Controls

const readyToSave = computed(() => {
  if (file.value && author.value && releaseName.value && releaseType.value) {
    const contentValue = optimisedContent.value || {
      content: file.value[0],
      fileName: file.value[0].name,
    };
    return {
      contentValue: contentValue as {content: File; fileName: string},
      authorValue: author.value,
      releaseNameValue: releaseName.value,
      releaseTypeValue: releaseType.value,
    };
  } else return undefined;
});

const saving = ref(false);

const file = ref<File[]>();
const licence = ref<string>();
const releaseType = ref<string>();
const thumbnail = ref<File[]>();
const author = ref<string>();
const releaseName = ref<string>();
const metadata = ref<string>();

const save = async () => {
  if (!readyToSave.value) return;

  const {contentValue, authorValue, releaseNameValue, releaseTypeValue} = readyToSave.value;

  saving.value = true;

  const fileContentBytes = new Uint8Array(await contentValue.content.arrayBuffer());
  const fileEntry = await orbiter.constellation.ajouterÀSFIP({
    contenu: fileContentBytes,
    nomFichier: contentValue.fileName,
  });

  const thumbnailEntry = thumbnail.value?.length
    ? await orbiter.constellation.ajouterÀSFIP({
        contenu: new Uint8Array(await thumbnail.value[0].arrayBuffer()),
        nomFichier: thumbnail.value[0].name,
      })
    : undefined;

  await orbiter.addRelease({
    [RELEASES_FILE_COLUMN]: fileEntry,
    [RELEASES_TYPE_COLUMN]: releaseTypeValue,
    [RELEASES_THUMBNAIL_COLUMN]: thumbnailEntry,
    [RELEASES_NAME_COLUMN]: releaseNameValue,
    [RELEASES_METADATA_COLUMN]: metadata.value,
    [RELEASES_AUTHOR_COLUMN]: authorValue,
  });

  saving.value = false;
  clearDialog();
};

const clearDialog = () => {
  dialog.value = false;

  file.value = undefined;
  licence.value = undefined;
  releaseType.value = undefined;
  thumbnail.value = undefined;
  author.value = undefined;
  releaseName.value = undefined;
  metadata.value = undefined;

  optimising.value = false;
  optimisationType.value = 'none';
  optimisedContent.value = undefined;

  saving.value = false;
};
</script>
