import {type ComputedRef, ref, computed, type Ref} from 'vue';

import type {types} from '@constl/ipa';

import {registerListener} from '/@/utils';
import {onMounted} from 'vue';
import {watchEffect} from 'vue';
import { useOrbiter } from '/@/plugins/orbiter/utils';

export const useUserProfilePhoto = (
  accountId?: string | Ref<string | undefined>,
): ComputedRef<string | undefined> => {
  const {orbiter} = useOrbiter();

  const profilePic = ref<Uint8Array | null>();
  const defaultAvatar = ref<string>();
  onMounted(async () => {
    const svg = await [
      import('/@/assets/undraw/undraw_pic_profile_re_7g2h.svg'),
      import('/@/assets/undraw/undraw_profile_pic_re_iwgo.svg'),
    ][Math.floor(Math.random() * 2)]; // Let's keep it fair and random :)
    defaultAvatar.value = svg.default;
  });

  let forgetPhoto: types.schémaFonctionOublier | undefined = undefined;
  watchEffect(async () => {
    if (forgetPhoto) await forgetPhoto();
    forgetPhoto = await registerListener(
      orbiter.listenForProfilePhotoChange({
        f: x => (profilePic.value = x),
        accountId: accountId
          ? typeof accountId === 'string'
            ? accountId
            : accountId?.value
          : undefined,
      }),
    );
  });

  const profilePicSrc = computed(() => {
    if (profilePic.value) {
      return URL.createObjectURL(new Blob([profilePic.value], {type: 'image'}));
    } else {
      return defaultAvatar.value;
    }
  });
  return profilePicSrc;
};
