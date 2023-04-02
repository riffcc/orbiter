import {EventEmitter, once} from 'events';

import {Lock} from 'semaphore-async-await';

import type ClientConstellation from '@constl/ipa';
import type {bds, réseau, valid} from '@constl/ipa';
import type {élémentsBd} from '@constl/ipa/dist/src/utils';
import type {élémentDeMembre} from '@constl/ipa/dist/src/reseau';

import {
  BLOCKED_RELEASES_TABLE_KEY,
  BLOCKED_RELEASE_CID_COL,
  RELEASES_AUTHOR_COLUMN,
  RELEASES_FILE_COLUMN,
  RELEASES_DB_TABLE_KEY,
  TRUSTED_SITES_TABLE_KEY,
  TRUSTED_SITES_MOD_DB_COL,
  TRUSTED_SITES_NAME_COL,
  RELEASES_NAME_COLUMN,
  RELEASES_METADATA_COLUMN,
  RELEASES_THUMBNAIL_COLUMN,
  RELEASES_TYPE_COLUMN,
  TRUSTED_SITES_SWARM_COL,
} from './consts';
import type {
  BlockedCid,
  Release,
  TrustedSite,
  VariableIds,
  possiblyIncompleteVariableIds,
} from './types';
import {variableIdKeys} from './types';
import type {élémentDonnées} from '@constl/ipa/dist/src/valid';

type offFunction = () => Promise<void>;

export default class Orbiter {
  modDbAddress?: string;
  orbiterSwarmId?: string;

  initialVariableIds: possiblyIncompleteVariableIds;
  variableIds?: VariableIds;

  constellation: ClientConstellation;
  events: EventEmitter;

  contentTypes = ['tvShow', 'movie', 'audiobook', 'game', 'book', 'music', 'video', 'other'];

  constructor({
    modDbAddress,
    orbiterSwarmId,
    variableIds,
    constellation,
  }: {
    modDbAddress?: string;
    orbiterSwarmId?: string;
    variableIds: possiblyIncompleteVariableIds;
    constellation: ClientConstellation;
  }) {
    this.events = new EventEmitter();

    this.modDbAddress = modDbAddress;
    this.orbiterSwarmId = orbiterSwarmId;
    this.initialVariableIds = variableIds;

    if (this.checkVariableIdsComplete(variableIds)) {
      this.variableIds = variableIds;
    }

    this.constellation = constellation;
  }

  checkVariableIdsComplete(ids: possiblyIncompleteVariableIds) {
    return variableIdKeys.every(k => Object.keys(ids).includes(k) && ids[k]);
  }

  async generateModDb(): Promise<{
    modDbId: string;
    orbiterSwarmId: string;
    variableIds: VariableIds;
  }> {
    // Variables for moderation database
    const trustedSitesModDbVariableId =
      this.initialVariableIds.trustedSitesModDbVariableId ||
      (await this.constellation.variables!.créerVariable({catégorie: 'chaîne'}));
    const trustedSitesSwarmVariableId =
      this.initialVariableIds.trustedSitesSwarmVariableId ||
      (await this.constellation.variables!.créerVariable({catégorie: 'chaîne'}));
    const trustedSitesNameVariableId =
      this.initialVariableIds.trustedSitesNameVariableId ||
      (await this.constellation.variables!.créerVariable({catégorie: 'chaîne'}));
    const blockedCidsVariableId =
      this.initialVariableIds.blockedCidsVariableId ||
      (await this.constellation.variables!.créerVariable({
        catégorie: 'chaîne',
      }));

    // Variables for individual releases databases
    const releasesFileVar =
      this.initialVariableIds.releasesFileVar ||
      (await this.constellation.variables!.créerVariable({
        catégorie: 'fichier',
      }));
    const releasesThumbnailVar =
      this.initialVariableIds.releasesThumbnailVar ||
      (await this.constellation.variables!.créerVariable({
        catégorie: 'fichier',
      }));
    const releasesAuthorVar =
      this.initialVariableIds.releasesAuthorVar ||
      (await this.constellation.variables!.créerVariable({
        catégorie: 'chaîne',
      }));
    const releasesMetadataVar =
      this.initialVariableIds.releasesMetadataVar ||
      (await this.constellation.variables!.créerVariable({
        catégorie: 'chaîne',
      }));

    // The release type variable is a bit more complicated, because we need to specify
    // allowed categories to enforce.
    let releasesTypeVar: string;
    if (this.initialVariableIds.releasesTypeVar) {
      releasesTypeVar = this.initialVariableIds.releasesTypeVar;
    } else {
      releasesTypeVar = await this.constellation.variables!.créerVariable({
        catégorie: 'catégorique',
      });
      // Specify allowed categories
      await this.constellation.variables!.ajouterRègleVariable({
        idVariable: releasesTypeVar,
        règle: {
          typeRègle: 'valeurCatégorique',
          détails: {
            type: 'fixe',
            options: this.contentTypes,
          },
        },
      });
    }
    const releasesContentNameVar =
      this.initialVariableIds.releasesContentNameVar ||
      (await this.constellation.variables!.créerVariable({
        catégorie: 'chaîne',
      }));

    // Now we can specify the format for individual release dbs
    // Todo: for consistency, should this be set here or in setModDb()?
    const releasesDbFormat = this.getReleasesDbFormat({
      releasesFileVar,
      releasesTypeVar,
      releasesThumbnailVar,
      releasesAuthorVar,
      releasesContentNameVar,
      releasesMetadataVar,
    });

    // Swarm ID for site
    let orbiterSwarmId: string;
    if (this.orbiterSwarmId) {
      orbiterSwarmId = this.orbiterSwarmId;
    } else {
      orbiterSwarmId = await this.constellation.nuées!.créerNuée({});
      for (const table of releasesDbFormat.tableaux) {
        const tableKey = table.clef;
        const idTableau = await this.constellation.nuées!.ajouterTableauNuée({
          idNuée: orbiterSwarmId,
          clefTableau: tableKey,
        });
        for (const col of table.cols) {
          await this.constellation.nuées!.ajouterColonneTableauNuée({
            idTableau,
            idVariable: col.idVariable,
            idColonne: col.idColonne,
          });
        }
      }
    }

    const modDbId = await this.constellation.bds!.créerBdDeSchéma({
      schéma: {
        licence: 'ODbl-1_0',
        tableaux: [
          {
            cols: [
              {
                idVariable: trustedSitesModDbVariableId,
                idColonne: TRUSTED_SITES_MOD_DB_COL,
              },
              {
                idVariable: trustedSitesSwarmVariableId,
                idColonne: TRUSTED_SITES_SWARM_COL,
              },
              {
                idVariable: trustedSitesNameVariableId,
                idColonne: TRUSTED_SITES_NAME_COL,
              },
            ],
            clef: TRUSTED_SITES_TABLE_KEY,
          },
          {
            cols: [
              {
                idVariable: blockedCidsVariableId,
                idColonne: BLOCKED_RELEASE_CID_COL,
              },
            ],
            clef: BLOCKED_RELEASES_TABLE_KEY,
          },
        ],
      },
    });

    const variableIds: VariableIds = {
      trustedSitesModDbVariableId,
      trustedSitesSwarmVariableId,
      trustedSitesNameVariableId,
      blockedCidsVariableId,
      releasesFileVar,
      releasesAuthorVar,
      releasesContentNameVar,
      releasesThumbnailVar,
      releasesMetadataVar,
      releasesTypeVar,
    };

    return {
      modDbId,
      orbiterSwarmId,
      variableIds,
    };
  }

  getReleasesDbFormat({
    releasesFileVar,
    releasesTypeVar,
    releasesThumbnailVar,
    releasesAuthorVar,
    releasesContentNameVar,
    releasesMetadataVar,
  }: {
    releasesFileVar: string;
    releasesTypeVar: string;
    releasesThumbnailVar: string;
    releasesAuthorVar: string;
    releasesContentNameVar: string;
    releasesMetadataVar: string;
  }): bds.schémaSpécificationBd {
    return {
      licence: 'ODbl-1_0',
      tableaux: [
        {
          cols: [
            {
              idVariable: releasesFileVar,
              idColonne: RELEASES_FILE_COLUMN,
            },
            {
              idVariable: releasesTypeVar,
              idColonne: RELEASES_TYPE_COLUMN,
            },
            {
              idVariable: releasesThumbnailVar,
              idColonne: RELEASES_THUMBNAIL_COLUMN,
            },
            {
              idVariable: releasesAuthorVar,
              idColonne: RELEASES_AUTHOR_COLUMN,
            },
            {
              idVariable: releasesContentNameVar,
              idColonne: RELEASES_NAME_COLUMN,
            },
            {
              idVariable: releasesMetadataVar,
              idColonne: RELEASES_METADATA_COLUMN,
            },
          ],
          clef: RELEASES_DB_TABLE_KEY,
        },
      ],
    };
  }

  setModDb({
    modDbId,
    orbiterSwarmId,
    variableIds,
  }: {
    modDbId: string;
    orbiterSwarmId: string;
    variableIds: VariableIds;
  }) {
    if (this.modDbAddress)
      throw new Error('Cannot change moderation DB address after Orbiter initialisation. Sorry.');

    this.modDbAddress = modDbId;
    this.orbiterSwarmId = orbiterSwarmId;
    this.variableIds = variableIds;
    this.events.emit('site configured');
  }

  async siteConfigured(): Promise<void> {
    if (
      this.modDbAddress &&
      this.orbiterSwarmId &&
      this.variableIds &&
      this.checkVariableIdsComplete(this.variableIds)
    )
      return;
    await once(this.events, 'site configured');
  }

  async isSiteConfigured({f}: {f: (x: boolean) => void}): Promise<offFunction> {
    const configured = () => {
      return !!(
        this.modDbAddress &&
        this.orbiterSwarmId &&
        this.variableIds &&
        this.checkVariableIdsComplete(this.variableIds)
      );
    };
    f(configured());
    const fFinal = () => f(configured());
    this.events.on('site configured', fFinal);
    return async () => {
      this.events.off('site configured', fFinal);
    };
  }

  async orbiterReady(): Promise<void> {
    await this.siteConfigured();
  }

  async onAccountExists({
    f,
    accountId,
  }: {
    f: (exists: boolean) => void;
    accountId?: string;
  }): Promise<offFunction> {
    // We'll consider that an account "exists" if there is a human-readable name associated with it.
    return await this.onNameChange({
      f: names => f(Object.keys(names).length > 0),
      accountId,
    });
  }

  async onAccountChange({f}: {f: (account?: string) => void}): Promise<offFunction> {
    return await this.constellation.suivreIdBdCompte({f});
  }

  async getAccountId(): Promise<string> {
    return await this.constellation.obtIdCompte();
  }

  async onNameChange({
    f,
    accountId,
  }: {
    f: (name: {[language: string]: string}) => void;
    accountId?: string;
  }): Promise<offFunction> {
    return await this.constellation.profil!.suivreNoms({
      f,
      idCompte: accountId || (await this.getAccountId()),
    });
  }

  async onIsModChange({f}: {f: (isMod: boolean) => void}): Promise<offFunction> {
    await this.orbiterReady();

    return await this.constellation.suivrePermissionÉcrire({
      id: this.modDbAddress!,
      f,
    });
  }

  async onReleasesChange({
    f,
  }: {
    f: (releases?: réseau.élémentDeMembre<Release>[]) => void;
  }): Promise<offFunction> {
    await this.orbiterReady();

    type SiteInfo = {
      blockedCids?: string[];
      entries?: élémentDeMembre<Release>[];
      fForget?: offFunction;
    };
    const siteInfos: {[site: string]: SiteInfo} = {};

    let cancelled = false;
    const lock = new Lock();

    const fFinal = async () => {
      console.log({siteInfos});
      const blockedCids = Object.values(siteInfos)
        .map(s => s.blockedCids || [])
        .flat();
      const releases = Object.values(siteInfos)
        .map(s => s.entries || [])
        .flat()
        .filter(r => !blockedCids.includes(r.élément.données.file.cid));
      await f(releases);
    };

    const fFollowTrustedSites = async (sites?: valid.élémentDonnées<TrustedSite>[]) => {
      const sitesList = (sites || []).map(s => s.données);
      sitesList.push({
        [TRUSTED_SITES_MOD_DB_COL]: this.modDbAddress!,
        [TRUSTED_SITES_SWARM_COL]: this.orbiterSwarmId!,
        [TRUSTED_SITES_NAME_COL]: 'Me !',
      });

      await lock.acquire();
      if (cancelled) return;

      const newSites = sitesList.filter(s => !Object.keys(siteInfos).includes(s.siteName));
      const obsoleteSites = Object.keys(siteInfos).filter(
        s => !sitesList.some(x => x.siteName === s),
      );

      for (const site of newSites) {
        const {siteName} = site;
        siteInfos[siteName] = {};
        const forgetSiteBlockedCids = await this.onBlockedReleasesChange({
          f: async cids => {
            siteInfos[siteName].blockedCids = cids?.map(c => c.cid);
            await fFinal();
          },
          modDbAddress: site.siteModDbAddress,
        });
        const forgetSiteReleases = await this.onSiteReleasesChange({
          f: async entries => {
            siteInfos[siteName].entries = entries;
            await fFinal();
          },
          swarmId: site.siteSwarmId,
        });
        siteInfos[siteName].fForget = async () => {
          await Promise.all([forgetSiteBlockedCids(), forgetSiteReleases()]);
        };
        await fFinal();
      }
      for (const site of obsoleteSites) {
        const {fForget} = siteInfos[site];
        if (fForget) await fForget();
        delete siteInfos[site];
      }

      await fFinal();
      lock.release();
    };

    const forgetTrustedSites = await this.onTrustedSitesChange({f: fFollowTrustedSites});
    const fForget = async () => {
      cancelled = true;
      await forgetTrustedSites();
      await Promise.all(
        Object.values(siteInfos).map(s => (s.fForget ? s.fForget() : Promise.resolve())),
      );
    };
    return fForget;
  }

  async onSiteReleasesChange({
    f,
    swarmId,
  }: {
    f: (releases?: réseau.élémentDeMembre<Release>[]) => void;
    swarmId?: string;
  }): Promise<offFunction> {
    await this.orbiterReady();

    const info: {
      blockedCids?: string[];
      entries?: élémentDeMembre<Release>[];
    } = {};

    const fFinal = async () => {
      if (info.blockedCids && info.entries) {
        // Filter out blocked cids
        const finalEntries = info.entries.filter(
          e => !info.blockedCids!.includes(e.élément.données.file.cid),
        );
        await f(finalEntries);
      }
    };

    const forgetBlockedCids = await this.onBlockedReleasesChange({
      f: async blockedCids => {
        if (blockedCids) info.blockedCids = blockedCids.map(x => x.cid);
        await fFinal();
      },
    });

    const {fOublier: fForgetEntries} =
      await this.constellation.réseau!.suivreÉlémentsDeTableauxUniques<Release>({
        idNuéeUnique: swarmId || this.orbiterSwarmId!,
        clef: RELEASES_DB_TABLE_KEY,
        f: async entries => {
          info.entries = entries;
          await fFinal();
        },
        nBds: 100,
      });

    const fForget = async () => {
      await fForgetEntries();
      await forgetBlockedCids();
    };

    return fForget;
  }

  async onBlockedReleasesChange({
    f,
    modDbAddress,
  }: {
    f: (releases?: {cid: string; hash: string}[]) => void;
    modDbAddress?: string;
  }): Promise<offFunction> {
    await this.orbiterReady();

    return await this.constellation.bds!.suivreDonnéesDeTableauParClef<BlockedCid>({
      idBd: modDbAddress || this.modDbAddress!,
      clefTableau: BLOCKED_RELEASES_TABLE_KEY,
      f: async releases => {
        await f(
          releases.map(r => {
            return {
              cid: r.données[BLOCKED_RELEASE_CID_COL],
              hash: r.empreinte,
            };
          }),
        );
      },
    });
  }

  async onTrustedSitesChange({
    f,
  }: {
    f: (sites?: élémentDonnées<TrustedSite>[]) => void;
  }): Promise<offFunction> {
    await this.orbiterReady();

    return await this.constellation.bds!.suivreDonnéesDeTableauParClef<TrustedSite>({
      idBd: this.modDbAddress!,
      clefTableau: TRUSTED_SITES_TABLE_KEY,
      f,
    });
  }

  async addRelease(r: Release) {
    await this.orbiterReady();

    const vals: {[key: string]: élémentsBd} = {
      [RELEASES_FILE_COLUMN]: r.file,
      [RELEASES_AUTHOR_COLUMN]: r.author,
      [RELEASES_NAME_COLUMN]: r.contentName,
    };
    if (r.metadata) {
      vals[RELEASES_METADATA_COLUMN] = r.metadata;
    }
    if (r.thumbnail) {
      vals[RELEASES_THUMBNAIL_COLUMN] = r.thumbnail;
    }

    await this.constellation.bds!.ajouterÉlémentÀTableauUnique({
      schémaBd: this.getReleasesDbFormat(this.variableIds!),
      idNuéeUnique: this.orbiterSwarmId!,
      clefTableau: RELEASES_DB_TABLE_KEY,
      vals,
    });
  }

  async removeRelease(releaseHash: string) {
    await this.orbiterReady();

    await this.constellation.bds!.effacerÉlémentDeTableauUnique({
      schémaBd: this.getReleasesDbFormat(this.variableIds!),
      idNuéeUnique: this.orbiterSwarmId!,
      clefTableau: RELEASES_DB_TABLE_KEY,
      empreinte: releaseHash,
    });
  }

  async editRelease({
    release,
    releaseHash,
  }: {
    release: Release;
    releaseHash: string;
  }): Promise<string> {
    await this.orbiterReady();

    return await this.constellation.bds!.modifierÉlémentDeTableauUnique({
      vals: release,
      schémaBd: this.getReleasesDbFormat(this.variableIds!),
      idNuéeUnique: this.orbiterSwarmId!,
      clefTableau: RELEASES_DB_TABLE_KEY,
      empreintePrécédente: releaseHash,
    });
  }

  async blockRelease(cid: string) {
    await this.orbiterReady();

    await this.constellation.bds!.ajouterÉlémentÀTableauParClef({
      idBd: this.modDbAddress!,
      clefTableau: BLOCKED_RELEASES_TABLE_KEY,
      vals: {[BLOCKED_RELEASE_CID_COL]: cid},
    });
  }

  async unblockRelease(releaseHash: string) {
    await this.orbiterReady();

    await this.constellation.bds!.effacerÉlémentDeTableauParClef({
      idBd: this.modDbAddress!,
      clefTableau: BLOCKED_RELEASES_TABLE_KEY,
      empreinteÉlément: releaseHash,
    });
  }

  async trustSite(site: string) {
    const decodedSite = JSON.parse(btoa(site));
    await this.orbiterReady();

    await this.constellation.bds!.ajouterÉlémentÀTableauParClef<TrustedSite>({
      idBd: this.modDbAddress!,
      clefTableau: TRUSTED_SITES_TABLE_KEY,
      vals: decodedSite,
    });
  }

  async editTrustedSite({siteHash, site}: {siteHash: string; site: string}) {
    await this.orbiterReady();

    await this.constellation.bds!.modifierÉlémentDeTableauParClef({
      idBd: this.modDbAddress!,
      clefTableau: TRUSTED_SITES_TABLE_KEY,
      empreinteÉlément: siteHash,
      vals: JSON.parse(btoa(site)),
    });
  }

  async untrustSite(siteHash: string) {
    await this.orbiterReady();
    await this.constellation.bds!.effacerÉlémentDeTableauParClef({
      idBd: this.modDbAddress!,
      clefTableau: TRUSTED_SITES_TABLE_KEY,
      empreinteÉlément: siteHash,
    });
  }

  async changeName({name, language}: {name?: string; language: string}): Promise<void> {
    if (name) await this.constellation.profil!.sauvegarderNom({langue: language, nom: name});
    else await this.constellation.profil!.effacerNom({langue: language});
  }

  async deleteAccount(): Promise<void> {
    throw new Error('Not implemented');
    // await this.constellation.effacerCompte()
  }
}
