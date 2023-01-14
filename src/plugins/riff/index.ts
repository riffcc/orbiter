import { App } from "vue"
import RiffApp from "./riff"
import { possiblyIncompleteVariableIds, VariableIds } from "./types";

export default {
  install: (app: App) => {
    const variableIds = getVariableIds();

    const riffApp = new RiffApp({
      modDbAddress: variableIds ? import.meta.env.VITE_MOD_BD_ADDRESS : undefined,
      riffSwarmId: variableIds ? import.meta.env.VITE_RIFF_SWARM_ID : undefined,
      variableIds,
    });
    app.config.globalProperties.$riff = riffApp;

    app.provide('riff', riffApp);
  }
}

const getVariableIds = (): VariableIds  => {
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


  return variableIds

}
