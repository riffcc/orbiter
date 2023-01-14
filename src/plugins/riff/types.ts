import { 
    RELEASES_AUTHOR_COLUMN, 
    RELEASES_FILE_COLUMN, 
    RELEASES_METADATA_COLUMN, 
    RELEASES_NAME_COLUMN, 
    RELEASES_THUMBNAIL_COLUMN,
    RELEASES_TYPE_COLUMN
} from "./consts";

export const variableIdKeys = [
    "trustedSitesModDbVariableId",
    "trustedSitesSwarmVariableId",
    "trustedSitesNameVariableId",
    "blockedCidsVariableId",
    "releasesFileVar",
    "releasesThumbnailVar",
    "releasesAuthorVar",
    "releasesContentNameVar",
    "releasesMetadataVar",
    "releasesTypeVar",
] as const;

export type VariableIds = Record<typeof variableIdKeys[number], string>

export type possiblyIncompleteVariableIds = {
    [key in keyof VariableIds]: VariableIds[key]
}

export type Release = {
    [RELEASES_NAME_COLUMN]: string;
    [RELEASES_FILE_COLUMN]: { cid: string, ext: string };
    [RELEASES_AUTHOR_COLUMN]: string;
    [RELEASES_THUMBNAIL_COLUMN]?: { cid: string, ext: string };
    [RELEASES_METADATA_COLUMN]?: string;
    [RELEASES_TYPE_COLUMN]: string;
}