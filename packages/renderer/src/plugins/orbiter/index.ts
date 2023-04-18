import type {App} from 'vue';
import OrbiterApp from './orbiter';
import type {possiblyIncompleteVariableIds} from './types';
import {loadStubData} from './dev/index.js';

export default {
  install: (app: App) => {
    const variableIds = getVariableIds();
    const constellation = app.config.globalProperties.$constl;

    const orbiterApp = new OrbiterApp({
      constellation,
      modDbAddress: variableIds ? import.meta.env.VITE_MOD_BD_ADDRESS : undefined,
      orbiterSwarmId: variableIds ? import.meta.env.VITE_ORBITER_SWARM_ID : undefined,
      variableIds,
    });
    app.config.globalProperties.$orbiter = orbiterApp;

    if (import.meta.env.VITE_STUB_DATA) {
      loadStubData(orbiterApp);
    }

    app.provide('orbiter', orbiterApp);
  },
};

const getVariableIds = (): possiblyIncompleteVariableIds => {
  const {
    VITE_TRUSTED_SITES_MOD_DB_VAR_ID,
    VITE_TRUSTED_SITES_SWARM_VAR_ID,
    VITE_TRUSTED_SITES_NAME_VAR_ID,
    VITE_BLOCKED_CIDS_VAR_ID,
    VITE_RELEASES_FILE_VAR_ID,
    VITE_RELEASES_TYPE_VAR_ID,
    VITE_RELEASES_AUTHOR_VAR_ID,
    VITE_RELEASES_CONTENT_NAME_VAR_ID,
    VITE_RELEASES_METADATA_VAR_ID,
    VITE_RELEASES_THUMBNAIL_VAR_ID,
  } = import.meta.env;

  const variableIds: possiblyIncompleteVariableIds = {
    trustedSitesModDbVariableId: VITE_TRUSTED_SITES_MOD_DB_VAR_ID,
    trustedSitesSwarmVariableId: VITE_TRUSTED_SITES_SWARM_VAR_ID,
    trustedSitesNameVariableId: VITE_TRUSTED_SITES_NAME_VAR_ID,
    blockedCidsVariableId: VITE_BLOCKED_CIDS_VAR_ID,

    releasesFileVar: VITE_RELEASES_FILE_VAR_ID,
    releasesTypeVar: VITE_RELEASES_TYPE_VAR_ID,
    releasesAuthorVar: VITE_RELEASES_AUTHOR_VAR_ID,
    releasesContentNameVar: VITE_RELEASES_CONTENT_NAME_VAR_ID,
    releasesMetadataVar: VITE_RELEASES_METADATA_VAR_ID,
    releasesThumbnailVar: VITE_RELEASES_THUMBNAIL_VAR_ID,
  };

  return variableIds;
};
