import { 
    RELEASES_AUTHOR_COLUMN, 
    RELEASES_CID_COLUMN, 
    RELEASES_METADATA_COLUMN, 
    RELEASES_NAME_COLUMN, 
    RELEASES_THUMBNAIL_COLUMN 
} from "./consts";

export interface VariableIds {
    trustedSitesVariableId: string;
    trustedSitesNameVariableId: string;
    blockedCidsVariableId: string;
    memberIdVariableId: string;
    memberStatusVariableId: string;
    
    riffSwarmId: string;  // Not *technically* a variable, but will do here for now.

    releasesCidVar: string;
    releasesThumbnailVar: string;
    releasesAuthorVar: string;
    releasesContentNameVar: string;
    releasesMetadataVar: string;
}

export type Release = {
    [RELEASES_NAME_COLUMN]: string;
    [RELEASES_CID_COLUMN]: string;
    [RELEASES_AUTHOR_COLUMN]: string;
    [RELEASES_THUMBNAIL_COLUMN]?: string;
    [RELEASES_METADATA_COLUMN]?: string;
}