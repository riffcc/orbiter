import type {
  BLOCKED_RELEASE_CID_COL,
  COLLECTIONS_AUTHOR_COLUMN,
  COLLECTIONS_METADATA_COLUMN,
  COLLECTIONS_NAME_COLUMN,
  COLLECTIONS_RELEASES_COLUMN,
  COLLECTIONS_THUMBNAIL_COLUMN,
  COLLECTIONS_TYPE_COLUMN,
  RELEASES_AUTHOR_COLUMN,
  RELEASES_FILE_COLUMN,
  RELEASES_METADATA_COLUMN,
  RELEASES_NAME_COLUMN,
  RELEASES_THUMBNAIL_COLUMN,
  RELEASES_TYPE_COLUMN,
  TRUSTED_SITES_NAME_COL,
  TRUSTED_SITES_SITE_ID_COL,
} from './consts';

export const variableIdKeys = [
  'trustedSitesSiteIdVariableId',
  'trustedSitesNameVariableId',
  'blockedCidsVariableId',
  'releasesContentNameVar',
  'releasesFileVar',
  'releasesThumbnailVar',
  'releasesAuthorVar',
  'releasesMetadataVar',
  'releasesTypeVar',
  'collectionsNameVar',
  'collectionsAuthorVar',
  'collectionsThumbnailVar',
  'collectionsMetadataVar',
  'collectionsTypeVar',
  'collectionsReleasesVar',
] as const;

export type VariableIds = Record<(typeof variableIdKeys)[number], string>;

export type possiblyIncompleteVariableIds = Partial<VariableIds>;

export type Release = {
  [RELEASES_NAME_COLUMN]: string;
  [RELEASES_FILE_COLUMN]: string;
  [RELEASES_AUTHOR_COLUMN]: string;
  [RELEASES_THUMBNAIL_COLUMN]?: string;
  [RELEASES_METADATA_COLUMN]?: string;
  [RELEASES_TYPE_COLUMN]: string;
};

export type ReleaseWithId = {
  release: Release;
  id: string;
};

export type Collection = {
  [COLLECTIONS_NAME_COLUMN]: string;
  [COLLECTIONS_AUTHOR_COLUMN]?: string;
  [COLLECTIONS_THUMBNAIL_COLUMN]?: string;
  [COLLECTIONS_METADATA_COLUMN]?: string;
  [COLLECTIONS_TYPE_COLUMN]: string;
  [COLLECTIONS_RELEASES_COLUMN]: string;
};

export type CollectionWithId = {
  collection: Collection;
  id: string;
};

export type TrustedSite = {
  [TRUSTED_SITES_SITE_ID_COL]: string;
  [TRUSTED_SITES_NAME_COL]: string;
};

export type BlockedCid = {
  [BLOCKED_RELEASE_CID_COL]: string;
};
