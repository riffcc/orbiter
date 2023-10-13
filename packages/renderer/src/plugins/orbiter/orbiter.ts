import {EventEmitter, once} from 'events';

import {Lock} from 'semaphore-async-await';

import type {ClientConstellation, bds, réseau, types} from '@constl/ipa';
import {uneFois, suivreBdDeFonction} from '@constl/utils-ipa';
import type {élémentDeMembre} from '@constl/ipa/dist/src/reseau';

import {
  BLOCKED_RELEASES_TABLE_KEY,
  BLOCKED_RELEASE_CID_COL,
  RELEASES_AUTHOR_COLUMN,
  RELEASES_FILE_COLUMN,
  RELEASES_DB_TABLE_KEY as RELEASES_TABLE_KEY,
  TRUSTED_SITES_TABLE_KEY,
  TRUSTED_SITES_MOD_DB_COL,
  TRUSTED_SITES_NAME_COL,
  RELEASES_NAME_COLUMN,
  RELEASES_METADATA_COLUMN,
  RELEASES_THUMBNAIL_COLUMN,
  RELEASES_TYPE_COLUMN,
  TRUSTED_SITES_SWARM_COL,
} from './consts.js';
import type {
  BlockedCid,
  Collection,
  Release,
  TrustedSite,
  VariableIds,
  possiblyIncompleteVariableIds,
} from './types.js';
import {variableIdKeys} from './types.js';
import type {tableaux} from '@constl/ipa';
import { schémaSpécificationBd } from '@constl/ipa/dist/src/bds';

type forgetFunction = () => Promise<void>;

export default class Orbiter {
  siteId?: string;

  initialVariableIds: possiblyIncompleteVariableIds;
  variableIds?: VariableIds;

  constellation: ClientConstellation;
  events: EventEmitter;

  contentTypes = ['tvShow', 'movie', 'audiobook', 'game', 'book', 'music', 'video', 'other'];

  constructor({
    siteId,
    variableIds,
    constellation,
  }: {
    siteId?: string;
    variableIds: possiblyIncompleteVariableIds;
    constellation: ClientConstellation;
  }) {
    this.events = new EventEmitter();

    this.siteId = siteId;
    this.initialVariableIds = variableIds;

    if (this.checkVariableIdsComplete(variableIds)) {
      this.variableIds = variableIds;
    }

    this.constellation = constellation;
  }

  async setUpSite(): Promise<{
    modDbId: string;
    orbiterSwarmId: string;
    variableIds: VariableIds;
  }> {
    // Variables for moderation database
    const trustedSitesSwarmVariableId =
      this.initialVariableIds.trustedSitesSwarmVariableId ||
      (await this.constellation.variables.créerVariable({catégorie: 'chaîneNonTraductible'}));
    const trustedSitesNameVariableId =
      this.initialVariableIds.trustedSitesNameVariableId ||
      (await this.constellation.variables.créerVariable({catégorie: 'chaîneNonTraductible'}));
    const blockedCidsVariableId =
      this.initialVariableIds.blockedCidsVariableId ||
      (await this.constellation.variables.créerVariable({
        catégorie: 'chaîneNonTraductible',
      }));

    // Variables for individual releases databases
    const releasesFileVar =
      this.initialVariableIds.releasesFileVar ||
      (await this.constellation.variables.créerVariable({
        catégorie: 'fichier',
      }));
    const releasesThumbnailVar =
      this.initialVariableIds.releasesThumbnailVar ||
      (await this.constellation.variables.créerVariable({
        catégorie: 'fichier',
      }));
    const releasesAuthorVar =
      this.initialVariableIds.releasesAuthorVar ||
      (await this.constellation.variables.créerVariable({
        catégorie: 'chaîneNonTraductible',
      }));
    const releasesMetadataVar =
      this.initialVariableIds.releasesMetadataVar ||
      (await this.constellation.variables.créerVariable({
        catégorie: 'chaîneNonTraductible',
      }));

    // The release type variable is a bit more complicated, because we need to specify
    // allowed categories to enforce.
    let releasesTypeVar: string;
    if (this.initialVariableIds.releasesTypeVar) {
      releasesTypeVar = this.initialVariableIds.releasesTypeVar;
    } else {
      releasesTypeVar = await this.constellation.variables.créerVariable({
        catégorie: 'chaîneNonTraductible',
      });
      // Specify allowed categories
      await this.constellation.variables.ajouterRègleVariable({
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
      (await this.constellation.variables.créerVariable({
        catégorie: 'chaîneNonTraductible',
      }));

    // Swarm ID for site
    let orbiterSwarmId: string;
    if (this.orbiterSwarmId) {
      orbiterSwarmId = this.orbiterSwarmId;
    } else {
      orbiterSwarmId = await this.constellation.nuées.créerNuée({});
      // Now we can specify the format for individual release dbs
      // Todo: for consistency, should this be set here or in setModDb()?
      const releasesDbFormat = this.getReleasesDbFormat({
        releasesFileVar,
        releasesTypeVar,
        releasesThumbnailVar,
        releasesAuthorVar,
        releasesContentNameVar,
        releasesMetadataVar,
        orbiterSwarmId,
      });
      for (const table of releasesDbFormat.tableaux) {
        const tableKey = table.clef;
        const idTableau = await this.constellation.nuées.ajouterTableauNuée({
          idNuée: orbiterSwarmId,
          clefTableau: tableKey,
        });
        for (const col of table.cols) {
          await this.constellation.nuées.ajouterColonneTableauNuée({
            idTableau,
            idVariable: col.idVariable,
            idColonne: col.idColonne,
          });
        }
      }
    }

    const modDb = await this.constellation.bds.créerBdDeSchéma({
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

    const siteId = await this.constellation.créerBdIndépendante({
      type: "keyvalue"
    });

    await this.constellation.orbite.appliquerFonctionBdOrbite({
      idBd: siteId,
      f: "put",
      args: ['modDb', modDbId],
    });
    await this.constellation.orbite.appliquerFonctionBdOrbite({
      idBd: siteId,
      f: "put",
      args: ['releasesSwarm', releaseSwarmId],
    });
    await this.constellation.orbite.appliquerFonctionBdOrbite({
      idBd: siteId,
      f: "put",
      args: ['collectionsSwarm', collectionsSwarmId],
    });

    return {
      siteId,
      variableIds,
    };
  }

  async followSiteReleasesSwarm({
    f,
    siteId,
  }: {
    f: (x: string) => void;
    siteId?: string;
  }): Promise<forgetFunction> {
    // Use this site's id if none is given
    if (!siteId) ({siteId} = await this.siteConfigured());

    return await this.constellation.bds.suivreMétadonnéesBd({
      idBd: siteId,
      f: x => {
        const swarmId = x['releasesSwarm'];
        if (typeof swarmId === 'string') f(swarmId);
      },
    });
  }

  async followSiteCollectionsSwarm({
    f,
    siteId,
  }: {
    f: (x: string) => void;
    siteId?: string;
  }): Promise<forgetFunction> {
    // Use this site's id if none is given
    if (!siteId) ({siteId} = await this.siteConfigured());

    return await this.constellation.bds.suivreMétadonnéesBd({
      idBd: siteId,
      f: x => {
        const swarmId = x['collectionsSwarm'];
        if (typeof swarmId === 'string') f(swarmId);
      },
    });
  }

  async followTrustedSites({
    f,
  }: {
    f: (sites?: tableaux.élémentDonnées<TrustedSite>[]) => void;
  }): Promise<forgetFunction> {
    


    return await suivreBdDeFonction({
      fRacine: async ({fSuivreRacine}: {
        fSuivreRacine: (nouvelIdBdCible?: string | undefined) => Promise<void>;
      }): Promise<forgetFunction> => {
        return
      },
      f,
      fSuivre: async (modDbId: string) => {
        return this.constellation.bds.suivreDonnéesDeTableauParClef<TrustedSite>({
          idBd: modDbId,
          clefTableau: TRUSTED_SITES_TABLE_KEY,
          f,
        });
      }
    });
  }

  async followReleases({
    f,
    siteId,
  }: {
    f;
    siteId?: string;
  }):  Promise<types.schémaRetourFonctionRechercheParProfondeur> {
    return await suivreBdDeFonction({
      fRacine: async ({fSuivreRacine}: { fSuivreRacine: (nouvelIdBdCible?: string) => Promise<void>; }): Promise<forgetFunction> => {
        return await this.followSiteReleasesSwarm({
          f: fSuivreRacine,
          siteId
        });
      },
      f,
      fSuivre: async ({id, fSuivreBd}: {
        id: string;
        fSuivreBd: schémaFonctionSuivi<T | undefined>;
      }): Promise<forgetFunction> => {
        return await this.constellation.nuées.suivreDonnéesTableauNuée({
          idNuée: releasesSwarmId,
          clefTableau,
          f: fSuivreBd,
          nRésultatsDésirés,
    
        })
      }
    })
    
  }

  async orbiterReady(): Promise<{
    releasesSwarmId: string;
    releasesDbSchema: schémaSpécificationBd;
  }> {
    await this.siteConfigured();

    const releasesDbSchema = this.getReleasesDbFormat({
      ...variableIds,
      orbiterSwarmId: releasesSwarmId,
    })
    return {

    }
  }

  async addRelease(release: Release): Promise<void> {
    const { releasesSwarmId, releasesDbSchema } = await this.orbiterReady();

    const vals: Release = {
      [RELEASES_FILE_COLUMN]: release.file,
      [RELEASES_AUTHOR_COLUMN]: release.author,
      [RELEASES_NAME_COLUMN]: release.contentName,
      [RELEASES_TYPE_COLUMN]: release.type,
    };
    if (release.metadata) {
      vals[RELEASES_METADATA_COLUMN] = release.metadata;
    }
    if (release.thumbnail) {
      vals[RELEASES_THUMBNAIL_COLUMN] = release.thumbnail;
    }

    await this.constellation.bds.ajouterÉlémentÀTableauUnique({
      schémaBd: releasesDbSchema,
      idNuéeUnique: releasesSwarmId,
      clefTableau: RELEASES_TABLE_KEY,
      vals,
    });
  }

  async addCollection(collection: Collection): Promise<void> {

    await this.constellation.bds.ajouterÉlémentÀTableauUnique({
      schémaBd: collectionsDbSchema,
      idNuéeUnique: collectionsSwarmId,
      clefTableau: COLLECTIONS_TABLE_KEY,
      vals,
    });
  }


  // Todo: refactor below

  checkVariableIdsComplete(ids: possiblyIncompleteVariableIds): ids is VariableIds {
    return variableIdKeys.every(k => Object.keys(ids).includes(k) && ids[k]);
  }

  getReleasesDbFormat({
    releasesFileVar,
    releasesTypeVar,
    releasesThumbnailVar,
    releasesAuthorVar,
    releasesContentNameVar,
    releasesMetadataVar,
    orbiterSwarmId,
  }: {
    releasesFileVar: string;
    releasesTypeVar: string;
    releasesThumbnailVar: string;
    releasesAuthorVar: string;
    releasesContentNameVar: string;
    releasesMetadataVar: string;
    orbiterSwarmId: string;
  }): bds.schémaSpécificationBd {
    return {
      licence: 'ODbl-1_0',
      nuées: [orbiterSwarmId],
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
          clef: RELEASES_TABLE_KEY,
        },
      ],
    };
  }

  async siteConfigured(): Promise<{
    siteId: string;
  }> {
    if (this.siteId && this.variableIds && this.checkVariableIdsComplete(this.variableIds))
      return {siteId: this.siteId};
    return await once(this.events, 'site configured');
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

  async initAccount({names}: {names: {[lang: string]: string}}): Promise<void> {
    for (const [name, language] of Object.values(names)) {
      await this.changeName({name, language});
    }
    await this.constellation.sauvegarderAuStockageLocal({
      clef: 'accountStatus',
      val: 'initialised',
    });
    this.events.emit('accountStatus', 'initialised');
  }

  async onAccountExists({f}: {f: (exists: boolean) => void}): Promise<offFunction> {
    const finalF = (status: string) => {
      f(status === 'initialised');
    };
    this.events.on('accountStatus', finalF);
    return async () => {
      this.events.off('accountStatus', finalF);
    };
  }

  async onAccountChange({f}: {f: (account?: string) => void}): Promise<offFunction> {
    return await this.constellation.suivreIdCompte({f});
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
    return await this.constellation.profil.suivreNoms({
      f,
      idCompte: accountId || (await this.getAccountId()),
    });
  }

  async onContactInfoChange({
    f,
    accountId,
  }: {
    f: types.schémaFonctionSuivi<{type: string; contact: string}[]>;
    accountId?: string;
  }): Promise<types.schémaFonctionOublier> {
    return await this.constellation.profil.suivreContacts({
      f,
      idCompte: accountId,
    });
  }

  async onProfilePhotoChange({
    f,
    accountId,
  }: {
    f: types.schémaFonctionSuivi<Uint8Array | null>;
    accountId?: string;
  }): Promise<types.schémaFonctionOublier> {
    return await this.constellation.profil.suivreImage({f, idCompte: accountId});
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
      const blockedCids = Object.values(siteInfos)
        .map(s => s.blockedCids || [])
        .flat();
      const releases = Object.values(siteInfos)
        .map(s => s.entries || [])
        .flat()
        .filter(r => !blockedCids.includes(r.élément.données.file.cid));
      await f(releases);
    };

    const fFollowTrustedSites = async (sites?: tableaux.élémentDonnées<TrustedSite>[]) => {
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
        const fsForgetSite: types.schémaFonctionOublier[] = [];

        const {siteName} = site;
        siteInfos[siteName] = {};
        this.onBlockedReleasesChange({
          f: async cids => {
            siteInfos[siteName].blockedCids = cids?.map(c => c.cid);
            await fFinal();
          },
          modDbAddress: site.siteModDbAddress,
        }).then(fForget => fsForgetSite.push(fForget));
        this.onSiteReleasesChange({
          f: async entries => {
            siteInfos[siteName].entries = entries;
            await fFinal();
          },
          swarmId: site.siteSwarmId,
        }).then(fForget => fsForgetSite.push(fForget));
        siteInfos[siteName].fForget = async () => {
          await Promise.all(fsForgetSite.map(f => f()));
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

    // Need to call once manually to get the user's own entries to show even if user is offline or
    // the site's master databases are unreachable.
    await fFollowTrustedSites();

    let forgetTrustedSites: types.schémaFonctionOublier;
    this.onTrustedSitesChange({f: fFollowTrustedSites}).then(
      fForget => (forgetTrustedSites = fForget),
    );

    const fForget = async () => {
      cancelled = true;
      if (forgetTrustedSites) await forgetTrustedSites();
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
      if (info.entries) {
        const myAccountId = await this.getAccountId();

        // Filter out blocked cids
        const finalEntries = info.entries.filter(
          e =>
            !(info.blockedCids || []).includes(e.élément.données.file.cid) ||
            e.idCompte === myAccountId,
        );
        await f(finalEntries);
      }
    };

    let forgetBlockedCids: types.schémaFonctionOublier;
    this.onBlockedReleasesChange({
      f: async blockedCids => {
        if (blockedCids) info.blockedCids = blockedCids.map(x => x.cid);
        await fFinal();
      },
    }).then(fForget => (forgetBlockedCids = fForget));

    const {fOublier: fForgetEntries} =
      await this.constellation.nuées.suivreDonnéesTableauNuée<Release>({
        idNuée: swarmId || this.orbiterSwarmId!,
        clefTableau: RELEASES_TABLE_KEY,
        f: async entries => {
          info.entries = entries;
          await fFinal();
        },
        nRésultatsDésirés: 1000,
        clefsSelonVariables: false,
      });

    const fForget = async () => {
      await fForgetEntries();
      if (forgetBlockedCids) await forgetBlockedCids();
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

    return await this.constellation.bds.suivreDonnéesDeTableauParClef<BlockedCid>({
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



  async removeRelease(releaseHash: string) {
    await this.orbiterReady();

    await this.constellation.bds.effacerÉlémentDeTableauUnique({
      schémaBd: this.getReleasesDbFormat({
        ...this.variableIds!,
        orbiterSwarmId: this.orbiterSwarmId!,
      }),
      idNuéeUnique: this.orbiterSwarmId!,
      clefTableau: RELEASES_TABLE_KEY,
      empreinte: releaseHash,
    });
  }

  async editRelease({
    release,
    releaseHash,
  }: {
    release: Partial<Release>;
    releaseHash: string;
  }): Promise<string> {
    await this.orbiterReady();

    return await this.constellation.bds.modifierÉlémentDeTableauUnique({
      vals: release,
      schémaBd: this.getReleasesDbFormat({
        ...this.variableIds!,
        orbiterSwarmId: this.orbiterSwarmId!,
      }),
      idNuéeUnique: this.orbiterSwarmId!,
      clefTableau: RELEASES_TABLE_KEY,
      empreintePrécédente: releaseHash,
    });
  }

  async blockRelease(cid: string) {
    await this.orbiterReady();

    await this.constellation.bds.ajouterÉlémentÀTableauParClef({
      idBd: this.modDbAddress!,
      clefTableau: BLOCKED_RELEASES_TABLE_KEY,
      vals: {[BLOCKED_RELEASE_CID_COL]: cid},
    });
  }

  async unblockRelease(releaseHash: string) {
    await this.orbiterReady();

    await this.constellation.bds.effacerÉlémentDeTableauParClef({
      idBd: this.modDbAddress!,
      clefTableau: BLOCKED_RELEASES_TABLE_KEY,
      empreinteÉlément: releaseHash,
    });
  }

  async addCollection({collection}: {collection: Collection}): Promise<string> {
    return await this.constellation.bds.ajouterÉlémentÀTableauUnique({
      schémaBd,
      idNuéeUnique,
      clefTableau,
      vals: collection,
    });
  }

  async removeCollection({collectionHash}: {collectionHash: string}): Promise<void> {
    await this.constellation.bds.effacerÉlémentDeTableauUnique({
      schémaBd,
      idNuéeUnique,
      clefTableau,
      empreinte: collectionHash,
    });
  }

  async editCollection({
    collection,
    collectionHash,
  }: {
    collection: Partial<Collection>;
    collectionHash: string;
  }): Promise<void> {
    await this.constellation.bds.modifierÉlémentDeTableauUnique({
      schémaBd,
      idNuéeUnique,
      clefTableau,
      empreintePrécédente: collectionHash,
      vals: collection,
    });
  }

  async addReleaseToCollection({
    releaseId,
    collectionHash,
  }: {
    releaseId: string;
    collectionHash: string;
  }): Promise<string> {
    const releases = await uneFois(
      async (fSuivi: types.schémaFonctionSuivi<string[]>): Promise<types.schémaFonctionOublier> => {
        return await this.onCollectionsChange({
          f: (collections: Collection[]) => fSuivi(collections.find(c => c)),
        });
      },
    );
    return await this.constellation.bds.modifierÉlémentDeTableauUnique({
      vals: {[COLLECTIONS_RELEASES_COLUMN]: [...releases, releaseId]},
      schémaBd,
      idNuéeUnique,
      clefTableau,
      empreintePrécédente: collectionHash,
    });
  }

  async removeReleaseFromCollection(): Promise<void> {}

  async trustSite(site: string) {
    const decodedSite = JSON.parse(btoa(site));
    await this.orbiterReady();

    await this.constellation.bds.ajouterÉlémentÀTableauParClef<TrustedSite>({
      idBd: this.modDbAddress!,
      clefTableau: TRUSTED_SITES_TABLE_KEY,
      vals: decodedSite,
    });
  }

  async editTrustedSite({siteHash, site}: {siteHash: string; site: string}) {
    await this.orbiterReady();

    await this.constellation.bds.modifierÉlémentDeTableauParClef({
      idBd: this.modDbAddress!,
      clefTableau: TRUSTED_SITES_TABLE_KEY,
      empreinteÉlément: siteHash,
      vals: JSON.parse(btoa(site)),
    });
  }

  async untrustSite(siteHash: string) {
    await this.orbiterReady();
    await this.constellation.bds.effacerÉlémentDeTableauParClef({
      idBd: this.modDbAddress!,
      clefTableau: TRUSTED_SITES_TABLE_KEY,
      empreinteÉlément: siteHash,
    });
  }

  async changeName({name, language}: {name?: string; language: string}): Promise<void> {
    if (name) await this.constellation.profil.sauvegarderNom({langue: language, nom: name});
    else await this.constellation.profil.effacerNom({langue: language});
  }

  async changeProfilePhoto({image}: {image?: Uint8Array}): Promise<void> {
    if (image) return await this.constellation.profil?.sauvegarderImage({image});
    else return await this.constellation.profil?.effacerImage();
  }

  async addContactInfo(): Promise<void> {}

  async removeContactInfo(): Promise<void> {}

  async deleteAccount(): Promise<void> {
    throw new Error('Not implemented');
    // await this.constellation.effacerCompte()
  }
}
