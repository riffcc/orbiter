import { EventEmitter, once } from "events";
import ClientConstellation, { bds, réseau, valid } from "@constl/ipa";
import type { élémentsBd } from "@constl/ipa/dist/utils";
import { élémentDeMembre } from "@constl/ipa/dist/reseau";

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
TRUSTED_SITES_SWARM_COL
} from "./consts";
import { possiblyIncompleteVariableIds, Release, variableIdKeys, VariableIds } from "./types";

type offFunction = () => Promise<void>

export default class Riff {
    modDbAddress?: string;
    riffSwarmId?: string;
    releasesDbFormat?: bds.schémaSpécificationBd;

    initialVariableIds: possiblyIncompleteVariableIds;
    variableIds?: VariableIds;

    constellation?: ClientConstellation;
    events: EventEmitter;

    contentTypes = [
        "tvShow",
        "movie",
        "audiobook",
        "game",
        "book",
        "music",
        "video",
        "other"
    ];

    constructor ({
        modDbAddress,
        riffSwarmId,
        variableIds,
    }: {
        modDbAddress?: string;
        riffSwarmId?: string;
        variableIds: possiblyIncompleteVariableIds
    }) {
        this.events = new EventEmitter();
        
        this.modDbAddress = modDbAddress;
        this.riffSwarmId = riffSwarmId;
        this.initialVariableIds = variableIds;

        if (this.checkVariableIdsComplete(variableIds)) {
            this.variableIds = variableIds
        };
        
        // Constellation is a big module to load, so load it asynchronously to ensure fast page load
        const ConstellationModule = import("@constl/ipa")
        ConstellationModule.then(API => {
            this.constellation = API.mandataire.ipa.générerMandataireProc();
            this.events.emit("ready")
        })
    }

    checkVariableIdsComplete(ids: possiblyIncompleteVariableIds) {
        return variableIdKeys.every(k=>Object.keys(ids).includes(k))
    }

    async constellationReady() {
        if (!this.constellation) {
            await once(this.events, "ready")

            // Fake longer load for dev for now, as is likely in production
            const host = window?.location?.host
            if (host && host.startsWith("127.0.0.1")) {
                await new Promise(resolve => setTimeout(resolve, 3000))
            }
        }
    }

    async generateModDb(): Promise<{ modDbId: string, riffSwarmId: string, variableIds: VariableIds}> {
        
        await this.constellationReady();

        // Variables for moderation database
        const trustedSitesModDbVariableId = this.variableIds?.trustedSitesModDbVariableId || await this.constellation!.variables!.créerVariable(
            { catégorie: "chaîne"}
        )
        const trustedSitesSwarmVariableId = this.variableIds?.trustedSitesSwarmVariableId || await this.constellation!.variables!.créerVariable(
            { catégorie: "chaîne"}
        )
        const trustedSitesNameVariableId = this.variableIds?.trustedSitesNameVariableId || await this.constellation!.variables!.créerVariable(
            { catégorie : "chaîne" }
        )
        const blockedCidsVariableId = this.variableIds?.blockedCidsVariableId || await this.constellation!.variables!.créerVariable({
            catégorie: "chaîne"
        })

        // Variables for individual releases databases
        const releasesFileVar = this.variableIds?.releasesFileVar || await this.constellation!.variables!.créerVariable({
            catégorie: "fichier"
        })
        const releasesThumbnailVar = this.variableIds?.releasesThumbnailVar || await this.constellation!.variables!.créerVariable({
            catégorie: "fichier"
        })
        const releasesAuthorVar = this.variableIds?.releasesAuthorVar || await this.constellation!.variables!.créerVariable({
            catégorie: "chaîne"
        })
        const releasesMetadataVar = this.variableIds?.releasesMetadataVar || await this.constellation!.variables!.créerVariable({
            catégorie: "chaîne"
        })

        // The release type variable is a bit more complicated, because we need to specify
        // allowed categories to enforce.
        let releasesTypeVar: string
        if (this.variableIds?.releasesTypeVar) {
            releasesTypeVar = this.variableIds?.releasesTypeVar;
        } else {
            releasesTypeVar = await this.constellation!.variables!.créerVariable({
                catégorie: "catégorique"
            });
            // Specify allowed categories
            await this.constellation!.variables!.ajouterRègleVariable({
                idVariable: releasesTypeVar,
                règle: {
                    typeRègle: "valeurCatégorique",
                    détails: {
                        type: "fixe",
                        options: this.contentTypes
                    }
                }
            })
        }
        const releasesContentNameVar = this.variableIds?.releasesContentNameVar || await this.constellation!.variables!.créerVariable({
            catégorie: "chaîne"
        })

        // Now we can specify the format for individual release dbs
        // Todo: for consistency, should this be set here or in setModDb()?
        this.releasesDbFormat = {
            licence: "ODbl-1_0",
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
                            idColonne: RELEASES_METADATA_COLUMN
                        }
                        
                    ],
                    clef: RELEASES_DB_TABLE_KEY
                }
            ]
        };

        // Swarm ID for site
        let riffSwarmId: string;
        if (this.riffSwarmId) {
            riffSwarmId = this.riffSwarmId
        } else {
            riffSwarmId = await this.constellation!.nuées!.créerNuée({});
            for (const table of this.releasesDbFormat.tableaux) {
                const tableKey = table.clef;
                const idTableau = await this.constellation!.nuées!.ajouterTableauNuée({
                    idNuée: riffSwarmId,
                    clefTableau: tableKey
                });
                for (const col of table.cols) {
                    await this.constellation!.nuées!.ajouterColonneTableauNuée({
                        idTableau,
                        idVariable: col.idVariable,
                        idColonne: col.idColonne,
                    })
                }
            }
            
        }

        const modDbId = await this.constellation!.bds!.créerBdDeSchéma({
            schéma: {
                licence: "ODbl-1_0",
                tableaux: [
                    {
                        cols: [
                            {
                                idVariable: trustedSitesModDbVariableId,
                                idColonne: TRUSTED_SITES_MOD_DB_COL
                            },
                            {
                                idVariable: trustedSitesSwarmVariableId,
                                idColonne: TRUSTED_SITES_SWARM_COL
                            },
                            {
                                idVariable: trustedSitesNameVariableId,
                                idColonne: TRUSTED_SITES_NAME_COL
                            }
                        ],
                        clef: "trusted sites"
                    },
                    {
                        cols: [
                            {
                                idVariable: blockedCidsVariableId,
                                idColonne: BLOCKED_RELEASE_CID_COL
                            }
                        ],
                        clef: BLOCKED_RELEASES_TABLE_KEY
                    }
                ]
            }
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
            releasesTypeVar
        }

        return {
            modDbId,
            riffSwarmId,
            variableIds
        }
    }

    setModDb({ modDbId, riffSwarmId, variableIds }: {modDbId: string, riffSwarmId: string; variableIds: VariableIds}) {
        if (this.modDbAddress) throw new Error(
            "Cannot change moderation DB address after Riff initialisation. Sorry."
            );

        this.modDbAddress = modDbId;
        this.riffSwarmId = riffSwarmId;
        this.variableIds = variableIds;
        this.events.emit("mod db changed")
    }

    async onModDbSet({ f }: {f: (id?: string) => void}): Promise<offFunction> {
        const fFollow = () => f(this.modDbAddress);
        if (this.modDbAddress) fFollow();

        this.events.on("mod db changed", fFollow);
        return async () => {
            this.events.off("mod db changed", fFollow)
        };        
    }

    async riffReady(): Promise<void> {
        await this.constellationReady();

        if (this.modDbAddress && this.riffSwarmId) return;
        await once(this.events, "mod db changed");
    }

    async onAccountExists({
        f,
        accountId
    }: {
        f: (exists: boolean) => void;
        accountId?: string;
    }): Promise<offFunction> {
        // We'll consider that an account "exists" if there is a human-readable name associated with it.
        return await this.onNameChange({
            f: (names) => f(Object.keys(names).length > 0),
            accountId
        })
    }

    async onAccountChange ({ f }: {f: (account?: string) => void}): Promise<offFunction> {
        await this.constellationReady()
        return await this.constellation!.suivreIdBdCompte({ f })
    }

    async getAccountId(): Promise<string> {
        await this.constellationReady();
        return await this.constellation!.obtIdCompte();
    }

    async onNameChange ({
        f,
        accountId,
    }: {
        f: (name: { [language: string]: string }) => void;
        accountId?: string
    }): Promise<offFunction> {
        await this.constellationReady();

        return await this.constellation!.réseau!.suivreNomsMembre({ 
            f, 
            idCompte: accountId || await this.getAccountId()
        });
    }

    async onIsModChange({ f }: {f: (isMod: boolean) => void}): Promise<offFunction> {
        await this.riffReady();

        return await this.constellation!.suivrePermissionÉcrire({
            id: this.modDbAddress!,
            f
        })
    }

    async onReleasesChange({ f }: {f: (releases?: réseau.élémentDeMembre<Release>[]) => void}): Promise<offFunction> {
        await this.riffReady();

        const info: {
            blockedCids?: string[];
            entries?: élémentDeMembre<Release>[]
        } = {};

        const fFinal = async () => {
            if (info.blockedCids && info.entries) {
                // Filter out blocked cids
                const finalEntries = info.entries.filter(e=>!info.blockedCids!.includes(e.élément.données.file.cid));
                await f(finalEntries);
            }
        }

        const forgetBlockedCids = await this.onBlockedReleasesChange({
            f: async blockedCids => {
                info.blockedCids = blockedCids;
                await fFinal();
            }
        });

        const { 
            fOublier:  fForgetEntries 
        } = await this.constellation!.réseau!.suivreÉlémentsDeTableauxUniques<Release>({
            idNuéeUnique: this.riffSwarmId!,
            clef: RELEASES_DB_TABLE_KEY,
            f: async (entries) => {
                info.entries = entries;
                await fFinal();
            },
            nBds: 100
        });
        
        const fForget = async () => {
            await fForgetEntries();
            await forgetBlockedCids();
        };

        return fForget;
    }

    async onBlockedReleasesChange({ f }: {f: (releases?: string[]) => void}): Promise<offFunction> {
        await this.riffReady();

        return await this.constellation!.bds!.suivreDonnéesDeTableauParClef({
            idBd: this.modDbAddress!,
            clefTableau: BLOCKED_RELEASES_TABLE_KEY,
            f: async (releases) => {
                await f(releases.map(r=>r.données[BLOCKED_RELEASE_CID_COL] as string))
            }
        });
    }

    async onTrustedSitesChange({ f }: {f: (sites?: string[]) => void}): Promise<offFunction> {
        await this.riffReady();
        
        return await this.constellation!.bds!.suivreDonnéesDeTableauParClef({
            idBd: this.modDbAddress!,
            clefTableau: TRUSTED_SITES_TABLE_KEY,
            f: (data)=>f(data.map(d=>d.données[TRUSTED_SITES_MOD_DB_COL]))
        })
    }

    async addRelease(r: Release) {
        await this.riffReady();

        const vals: {[key: string]: élémentsBd} = {
            [RELEASES_FILE_COLUMN]: r.file,
            [RELEASES_AUTHOR_COLUMN]: r.author,
            [RELEASES_NAME_COLUMN]: r.contentName,
        }
        if (r.metadata) {
            vals[RELEASES_METADATA_COLUMN] = r.metadata
        }
        if (r.thumbnail) {
            vals[RELEASES_THUMBNAIL_COLUMN] = r.thumbnail
        }

        await this.constellation!.bds!.ajouterÉlémentÀTableauUnique({
            schémaBd: await this.releasesDbFormat!,
            idNuéeUnique: this.riffSwarmId!,
            clefTableau: RELEASES_DB_TABLE_KEY,
            vals
        });
    }

    async removeRelease(releaseHash: string) {
        await this.riffReady();

        await this.constellation!.bds!.effacerÉlémentDeTableauUnique({
            schémaBd: await this.releasesDbFormat!,
            idNuéeUnique: this.riffSwarmId!,
            clefTableau: RELEASES_DB_TABLE_KEY,
            empreinte: releaseHash
        });
    }

    async editRelease({ release, releaseHash }: { release: Release; releaseHash: string }): Promise<string> {
        await this.riffReady();

        return await this.constellation!.bds!.modifierÉlémentDeTableauUnique({
            vals: release,
            schémaBd: await this.releasesDbFormat!,
            idNuéeUnique: this.riffSwarmId!,
            clefTableau: RELEASES_DB_TABLE_KEY,
            empreintePrécédente: releaseHash,
        })
    }

    async blockRelease(cid: string) {
        await this.riffReady();

        await this.constellation!.bds!.ajouterÉlémentÀTableauParClef({
            idBd: this.modDbAddress!,
            clefTableau: BLOCKED_RELEASES_TABLE_KEY,
            vals: {[BLOCKED_RELEASE_CID_COL]: cid}
        });
    }

    async unblockRelease(releaseHash: string) {
        await this.riffReady();

        await this.constellation!.bds!.effacerÉlémentDeTableauParClef({
            idBd: this.modDbAddress!,
            clefTableau: BLOCKED_RELEASES_TABLE_KEY,
            empreinteÉlément: releaseHash
        });
    }
    
    async trustSite(siteModDb: string) {
        await this.riffReady();

        await this.constellation!.bds!.ajouterÉlémentÀTableauParClef({
            idBd: this.modDbAddress!,
            clefTableau: TRUSTED_SITES_TABLE_KEY,
            vals: {[TRUSTED_SITES_MOD_DB_COL]: siteModDb}
        })
    }

    async untrustSite(siteHash: string) {
        await this.riffReady();
        await this.constellation!.bds!.effacerÉlémentDeTableauParClef({
            idBd: this.modDbAddress!,
            clefTableau: TRUSTED_SITES_TABLE_KEY,
            empreinteÉlément: siteHash
        });
    }

    async changeName({ name, language }: {name?: string, language: string}): Promise<void> {
        if (name)
            await this.constellation!.profil!.sauvegarderNom({ langue: language, nom: name})
        else
            await this.constellation!.profil!.effacerNom({ langue: language })
    }

    async deleteAccount(): Promise<void> {
        throw new Error("Not implemented");
        // await this.constellation.effacerCompte()
    }
}