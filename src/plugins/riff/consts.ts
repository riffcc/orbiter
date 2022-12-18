import { bds } from "@constl/ipa";

export const BLOCKED_RELEASES_TABLE_KEY = "blocked cids";
export const BLOCKED_RELEASE_CID_COL="cid";

export const TRUSTED_SITES_TABLE_KEY = "trusted sites";
export const TRUSTED_SITES_MOD_DB_COL="site mod db address";

export const RELEASES_CID_COLUMN="cid";
export const RELEASES_AUTHOR_COLUMN="contributor"

export const MEMBER_ID_COL="member account id";
export const MEMBER_STATUS_COL="status";


export const RELEASES_DB_TABLE_KEY="releases";

export const RELEASES_DB_FORMAT: bds.schémaSpécificationBd = {
    licence: "ODbl-1_0",
    tableaux: [
        {
            cols: [
                {
                    idVariable: "",
                    idColonne: RELEASES_CID_COLUMN
                },
                
            ],
            clef: RELEASES_DB_TABLE_KEY
        }
    ]
};