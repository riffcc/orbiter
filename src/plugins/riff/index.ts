import { App } from "vue"
import RiffApp from "./riff"
import { VariableIds } from "./types";

export default {
  install: (app: App) => {

    const riffApp = new RiffApp({
      modDbAddress: import.meta.env.VITE_MOD_BD_ADDRESS,
      variableIds: getVariableIds(),
    });
    app.config.globalProperties.$riff = riffApp;

    app.provide('riff', riffApp);
  }
}

const getVariableIds = (): VariableIds | undefined  => {
  const {
    VITE_TRUSTED_SITES_VAR_ID,
    VITE_BLOCKED_CIDS_VAR_ID,
    VITE_MEMBER_ID_VAR_ID,
    VITE_MEMBER_STATUS_VAR_ID,
    VITE_RIFF_SWARM_ID
  } = import.meta.env;
  
  if (
    VITE_TRUSTED_SITES_VAR_ID &&
    VITE_BLOCKED_CIDS_VAR_ID &&
    VITE_MEMBER_ID_VAR_ID &&
    VITE_MEMBER_STATUS_VAR_ID && 
    VITE_RIFF_SWARM_ID
  ) {
    const variableIds: VariableIds = {
      trustedSitesVariableId: VITE_TRUSTED_SITES_VAR_ID,
      blockedCidsVariableId: VITE_BLOCKED_CIDS_VAR_ID,
      memberIdVariableId: VITE_MEMBER_ID_VAR_ID,
      memberStatusVariableId: VITE_MEMBER_STATUS_VAR_ID,
      
      riffSwarmId: VITE_RIFF_SWARM_ID
    }
    return variableIds
  }

}
