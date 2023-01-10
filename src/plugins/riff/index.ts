import { importateur } from "@constl/ipa";
import { App } from "vue"
import RiffApp from "./riff"
import { VariableIds } from "./types";

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

const getVariableIds = (): VariableIds | undefined  => {
  const {
    VITE_TRUSTED_SITES_VAR_ID,
    VITE_TRUSTED_SITES_NAME_VAR_ID,
    VITE_BLOCKED_CIDS_VAR_ID,
    VITE_MEMBER_ID_VAR_ID,
    VITE_MEMBER_STATUS_VAR_ID,
    VITE_RIFF_SWARM_ID,
    VITE_RELEASES_CID_VAR_ID,
    VITE_RELEASES_AUTHOR_VAR_ID,
    VITE_RELEASES_CONTENT_NAME_VAR_ID,
    VITE_RELEASES_METADATA_VAR_ID,
    VITE_RELEASES_THUMBNAIL_VAR_ID,
  } = import.meta.env;
  
  if (
    VITE_TRUSTED_SITES_VAR_ID &&
    VITE_TRUSTED_SITES_NAME_VAR_ID &&
    VITE_BLOCKED_CIDS_VAR_ID &&
    VITE_MEMBER_ID_VAR_ID &&
    VITE_MEMBER_STATUS_VAR_ID && 
    VITE_RIFF_SWARM_ID &&
    VITE_RELEASES_CID_VAR_ID &&
    VITE_RELEASES_AUTHOR_VAR_ID &&
    VITE_RELEASES_CONTENT_NAME_VAR_ID &&
    VITE_RELEASES_METADATA_VAR_ID &&
    VITE_RELEASES_THUMBNAIL_VAR_ID
  ) {
    const variableIds: VariableIds = {
      trustedSitesVariableId: VITE_TRUSTED_SITES_VAR_ID,
      trustedSitesNameVariableId: VITE_TRUSTED_SITES_NAME_VAR_ID,
      blockedCidsVariableId: VITE_BLOCKED_CIDS_VAR_ID,
      memberIdVariableId: VITE_MEMBER_ID_VAR_ID,
      memberStatusVariableId: VITE_MEMBER_STATUS_VAR_ID,
      
      riffSwarmId: VITE_RIFF_SWARM_ID,

      releasesCidVar: VITE_RELEASES_CID_VAR_ID,
      releasesAuthorVar: VITE_RELEASES_AUTHOR_VAR_ID,
      releasesContentNameVar: VITE_RELEASES_CONTENT_NAME_VAR_ID,
      releasesMetadataVar: VITE_RELEASES_METADATA_VAR_ID,
      releasesThumbnailVar: VITE_RELEASES_THUMBNAIL_VAR_ID,
    }
    return variableIds
  }

}
