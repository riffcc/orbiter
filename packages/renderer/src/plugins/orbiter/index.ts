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
      siteId: variableIds ? import.meta.env.VITE_SITE_ID : undefined,
      swarmId: variableIds ? import.meta.env.VITE_SWARM_ID : undefined,
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
    VITE_TRUSTED_SITES_SITE_ID_VAR_ID,
    VITE_TRUSTED_SITES_NAME_VAR_ID,
    VITE_BLOCKED_CIDS_VAR_ID,
    VITE_RELEASES_FILE_VAR_ID,
    VITE_RELEASES_TYPE_VAR_ID,
    VITE_RELEASES_AUTHOR_VAR_ID,
    VITE_RELEASES_CONTENT_NAME_VAR_ID,
    VITE_RELEASES_METADATA_VAR_ID,
    VITE_RELEASES_THUMBNAIL_VAR_ID,
    VITE_COLLECTIONS_AUTHOR_VAR_ID,
    VITE_COLLECTIONS_METADATA_VAR_ID,
    VITE_COLLECTIONS_NAME_VAR_ID,
    VITE_COLLECTIONS_RELEASES_VAR_ID,
    VITE_COLLECTIONS_THUMBNAIL_VAR_ID,
    VITE_COLLECTIONS_TYPE_VAR_ID,
  } = import.meta.env;

  const variableIds: possiblyIncompleteVariableIds = {
    trustedSitesSiteIdVariableId: VITE_TRUSTED_SITES_SITE_ID_VAR_ID,
    trustedSitesNameVariableId: VITE_TRUSTED_SITES_NAME_VAR_ID,
    blockedCidsVariableId: VITE_BLOCKED_CIDS_VAR_ID,

    releasesFileVar: VITE_RELEASES_FILE_VAR_ID,
    releasesTypeVar: VITE_RELEASES_TYPE_VAR_ID,
    releasesAuthorVar: VITE_RELEASES_AUTHOR_VAR_ID,
    releasesContentNameVar: VITE_RELEASES_CONTENT_NAME_VAR_ID,
    releasesMetadataVar: VITE_RELEASES_METADATA_VAR_ID,
    releasesThumbnailVar: VITE_RELEASES_THUMBNAIL_VAR_ID,
    collectionsAuthorVar: VITE_COLLECTIONS_AUTHOR_VAR_ID,
    collectionsMetadataVar: VITE_COLLECTIONS_METADATA_VAR_ID,
    collectionsNameVar: VITE_COLLECTIONS_NAME_VAR_ID,
    collectionsReleasesVar: VITE_COLLECTIONS_RELEASES_VAR_ID,
    collectionsThumbnailVar: VITE_COLLECTIONS_THUMBNAIL_VAR_ID,
    collectionsTypeVar: VITE_COLLECTIONS_TYPE_VAR_ID,
  };

  return variableIds;
};
