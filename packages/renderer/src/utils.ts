import type {types} from '@constl/ipa';
import EventEmitter, {once} from 'events';
import {onMounted, onUnmounted} from 'vue';

export function downloadFile(filename: string, content: string | Uint8Array) {
  const element = document.createElement('a');

  let url: string;
  if (content instanceof Uint8Array) {
    url = URL.createObjectURL(new Blob([content.buffer]));
  } else {
    url = content;
  }
  element.setAttribute('href', url);
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

export function selectTranslation(options?: {[language: string]: string}): string | undefined {
  // Constellation has a multilingual-centric structure, but for now the Riff.CC site is monolingual,
  // so we'll just use any name. Once Riff.CC has an internationalised interface, we can match displayed
  // usernames with the viewer's chosen site language here, and do fancy stuff looking up fallback languages.

  // Another idea: we could also set up community translations of the Riff.CC site interface itself with
  // Kilimukku, which is a Constellation-based community translation software.
  return options && Object.keys(options).length ? Object.values(options)[0] : undefined;
}

export async function copyText(text: string | undefined) {
  if (!text) return;
  await navigator.clipboard.writeText(text);
}

/**
 * A helper function to register an async Orbiter listener and to deregister it automatically when the component is unmounted.
 * @param listenerPromise The Orbiter listener promise
 */
export const registerListener = <
  T extends
    | types.schémaFonctionOublier
    | types.schémaRetourFonctionRechercheParProfondeur
    | types.schémaRetourFonctionRechercheParN,
>(
  listenerPromise?: Promise<T>,
): Promise<T | undefined> => {
  let fForget: types.schémaFonctionOublier | undefined = undefined;

  const events = new EventEmitter();
  let result: T | undefined;
  const returnPromise = new Promise<T | undefined>(resolve => {
    once(events, 'ready').then(() => {
      resolve(result);
    });
  });

  onMounted(async () => {
    result = await listenerPromise;
    if (result instanceof Function) {
      fForget = result;
    } else {
      fForget = result?.fOublier;
    }
    events.emit('ready');
  });
  onUnmounted(async () => {
    if (fForget) await fForget();
  });

  return returnPromise;
};

export const RIFFCC_PROTOCOL = 'Riff.CC';
