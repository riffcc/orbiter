import { EventEmitter, once } from "events";
import ClientConstellation, { bds, réseau, valid } from "@constl/ipa";
import type { élémentsBd } from "@constl/ipa/dist/utils";
import { élémentDeMembre } from "@constl/ipa/dist/reseau";

import { 
    BLOCKED_RELEASES_TABLE_KEY, 
    BLOCKED_RELEASE_CID_COL, 
    RELEASES_AUTHOR_COLUMN, 
    RELEASES_CID_COLUMN, 
    RELEASES_DB_TABLE_KEY, 
    TRUSTED_SITES_TABLE_KEY, 
    TRUSTED_SITES_MOD_DB_COL, 
    MEMBER_ID_COL,
    MEMBER_STATUS_COL,
    TRUSTED_SITES_NAME_COL,
    RELEASES_NAME_COLUMN,
    RELEASES_METADATA_COLUMN,
    RELEASES_THUMBNAIL_COLUMN
} from "./consts";
import { Release, VariableIds } from "./types";

type offFunction = () => Promise<void>

export default class Riff {
    modDbAddress?: string;
    variableIds?: VariableIds;

    constellation?: ClientConstellation;
    events: EventEmitter;

    constructor ({
        modDbAddress,
        variableIds,
    }: {
        modDbAddress?: string;
        variableIds?: VariableIds
    }) {
        this.events = new EventEmitter();
        
        this.modDbAddress = modDbAddress;
        this.variableIds = variableIds;
        
        // Constellation is a big module to load, so load it asynchronously to ensure fast page load
        const ConstellationModule = import("@constl/ipa")
        ConstellationModule.then(API => {
            this.constellation = API.mandataire.ipa.générerMandataireProc();
            this.events.emit("ready")
        })
    }

    async ready() {
        if (!this.constellation) {
            await once(this.events, "ready")

            // Fake longer load for dev for now, as is likely in production
            const host = window?.location?.host
            if (host && host.startsWith("127.0.0.1")) {
                await new Promise(resolve => setTimeout(resolve, 3000))
            }
        }
    }

    async generateModDb(): Promise<{ modDbId: string, variableIds: VariableIds}> {
        await this.ready();

        const trustedSitesVariableId = this.variableIds?.trustedSitesVariableId || await this.constellation!.variables!.créerVariable(
            { catégorie: "chaîne"}
        )
        const trustedSitesNameVariableId = this.variableIds?.trustedSitesNameVariableId || await this.constellation!.variables!.créerVariable(
            { catégorie : "chaîne" }
        )

        const blockedCidsVariableId = this.variableIds?.blockedCidsVariableId || await this.constellation!.variables!.créerVariable({
            catégorie: "chaîne"
        })
        
        const memberIdVariableId = this.variableIds?.memberIdVariableId || await this.constellation!.variables!.créerVariable({
            catégorie: "chaîne"
        })
        
        const generateMemberStatusVar = async (): Promise<string> => {
            const varId = await this.constellation!.variables!.créerVariable(
                { catégorie: "catégorique"}
            )
            const règle: valid.règleValeurCatégorique = {
                typeRègle: "valeurCatégorique",
                détails: {
                    type: "fixe",
                    options: ["authorised", "blocked"]
                }
            }; 
            await this.constellation!.variables!.ajouterRègleVariable({
                idVariable: varId,
                règle
            })
            
            return varId
        }

        const memberStatusVariableId = this.variableIds?.memberStatusVariableId || await generateMemberStatusVar();

        const riffSwarmId = this.variableIds?.riffSwarmId || await this.constellation!.nuées!.créerNuée({});

        const releasesCidVar = this.variableIds?.releasesCidVar || await this.constellation!.variables!.créerVariable({
            catégorie: "chaîne"
        })
        const releasesThumbnailVar = this.variableIds?.releasesThumbnailVar || await this.constellation!.variables!.créerVariable({
            catégorie: "chaîne"
        })
        const releasesAuthorVar = this.variableIds?.releasesAuthorVar || await this.constellation!.variables!.créerVariable({
            catégorie: "chaîne"
        })
        const releasesMetadataVar = this.variableIds?.releasesMetadataVar || await this.constellation!.variables!.créerVariable({
            catégorie: "chaîne"
        })
        const releasesContentNameVar = this.variableIds?.releasesContentNameVar || await this.constellation!.variables!.créerVariable({
            catégorie: "chaîne"
        })

        const modDbId = await this.constellation!.bds!.créerBdDeSchéma({
            schéma: {
                licence: "ODbl-1_0",
                tableaux: [
                    {
                        cols: [
                            {
                                idVariable: trustedSitesVariableId,
                                idColonne: TRUSTED_SITES_MOD_DB_COL
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
                    },
                    {
                        cols: [
                            {
                                idVariable: memberIdVariableId,
                                idColonne: MEMBER_ID_COL
                            },
                            {
                                idVariable: memberStatusVariableId,
                                idColonne: MEMBER_STATUS_COL
                            }
                        ],
                        clef: "member moderation"
                    }
                ]
            }
        });
        
        const variableIds: VariableIds = {
            trustedSitesVariableId,
            trustedSitesNameVariableId,
            blockedCidsVariableId,
            memberIdVariableId,
            memberStatusVariableId,
            riffSwarmId,
            releasesCidVar,
            releasesAuthorVar,
            releasesContentNameVar,
            releasesThumbnailVar,
            releasesMetadataVar
        }

        return {
            modDbId,
            variableIds
        }
    }

    setModDb({ modDbId, variableIds }: {modDbId: string, variableIds: VariableIds}) {
        if (this.modDbAddress) throw new Error(
            "Cannot change moderation DB address after Riff initialisation. Sorry."
            );

        this.modDbAddress = modDbId;
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

    async modDbReady(): Promise<void> {
        await this.ready();
        if (this.modDbAddress) return;
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
        await this.ready()
        return await this.constellation!.suivreIdBdCompte({ f })
    }

    async getAccountId(): Promise<string> {
        await this.ready();
        return await this.constellation!.obtIdCompte();
    }

    async onNameChange ({
        f,
        accountId,
    }: {
        f: (name: { [language: string]: string }) => void;
        accountId?: string
    }): Promise<offFunction> {
        await this.ready();

        return await this.constellation!.réseau!.suivreNomsMembre({ 
            f, 
            idCompte: accountId || await this.getAccountId()
        });
    }

    async onIsModChange({ f }: {f: (isMod: boolean) => void}): Promise<offFunction> {
        await this.modDbReady();

        return await this.constellation!.suivrePermissionÉcrire({
            id: this.modDbAddress!,
            f
        })
    }

    async onReleasesChange({ f }: {f: (releases?: réseau.élémentDeMembre<Release>[]) => void}): Promise<offFunction> {
        await this.modDbReady();

        const info: {
            blockedCids?: string[];
            entries?: élémentDeMembre<Release>[]
        } = {};

        const fFinal = async () => {
            if (info.blockedCids && info.entries) {
                // Filter out blocked cids
                const finalEntries = info.entries.filter(e=>!info.blockedCids!.includes(e.élément.données.cid));
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
            idNuéeUnique: this.variableIds!.riffSwarmId,
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
        await this.modDbReady();

        return await this.constellation!.bds!.suivreDonnéesDeTableauParClef({
            idBd: this.modDbAddress!,
            clefTableau: BLOCKED_RELEASES_TABLE_KEY,
            f
        });
    }

    async onTrustedSitesChange({ f }: {f: (sites?: string[]) => void}): Promise<offFunction> {
        await this.modDbReady();
        
        return await this.constellation!.bds!.suivreDonnéesDeTableauParClef<Release>({
            idBd: this.modDbAddress!,
            clefTableau: TRUSTED_SITES_TABLE_KEY,
            f: (data)=>f(data.map(d=>d.données[TRUSTED_SITES_MOD_DB_COL]))
        })
    }

    async getReleasesDBFormat(): Promise<bds.schémaSpécificationBd> {
        await this.modDbReady();

        const releasesDbFormat: bds.schémaSpécificationBd = {
            licence: "ODbl-1_0",
            tableaux: [
                {
                    cols: [
                        {
                            idVariable: this.variableIds!.releasesCidVar,
                            idColonne: RELEASES_CID_COLUMN,
                        },
                        {
                            idVariable: this.variableIds!.releasesThumbnailVar,
                            idColonne: RELEASES_THUMBNAIL_COLUMN,
                        },
                        {
                            idVariable: this.variableIds!.releasesAuthorVar,
                            idColonne: RELEASES_AUTHOR_COLUMN,
                        },
                        {
                            idVariable: this.variableIds!.releasesContentNameVar,
                            idColonne: RELEASES_NAME_COLUMN,
                        },
                        {
                            idVariable: this.variableIds!.releasesMetadataVar,
                            idColonne: RELEASES_METADATA_COLUMN
                        }
                        
                    ],
                    clef: RELEASES_DB_TABLE_KEY
                }
            ]
        };

        return releasesDbFormat
    }

    async addRelease(r: Release) {
        await this.modDbReady();

        const vals: {[key: string]: élémentsBd} = {
            [RELEASES_CID_COLUMN]: r.cid,
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
            schémaBd: await this.getReleasesDBFormat(),
            idNuéeUnique: this.variableIds!.riffSwarmId,
            clefTableau: RELEASES_DB_TABLE_KEY,
            vals
        });
    }

    async removeRelease(releaseHash: string) {
        await this.ready();

        await this.constellation!.bds!.effacerÉlémentDeTableauUnique({
            schémaBd: await this.getReleasesDBFormat(),
            idNuéeUnique: this.variableIds!.riffSwarmId,
            clefTableau: RELEASES_DB_TABLE_KEY,
            empreinte: releaseHash
        });
    }

    async editRelease({ release, releaseHash }: { release: Release; releaseHash: string }): Promise<string> {
        await this.ready();

        return await this.constellation!.bds!.modifierÉlémentDeTableauUnique({
            vals: release,
            schémaBd: await this.getReleasesDBFormat(),
            idNuéeUnique: this.variableIds!.riffSwarmId,
            clefTableau: RELEASES_DB_TABLE_KEY,
            empreintePrécédente: releaseHash,
        })
    }

    async blockRelease(cid: string) {
        await this.modDbReady();

        await this.constellation!.bds!.ajouterÉlémentÀTableauParClef({
            idBd: this.modDbAddress!,
            clefTableau: BLOCKED_RELEASES_TABLE_KEY,
            vals: {[BLOCKED_RELEASE_CID_COL]: cid}
        });
    }

    async unblockRelease(releaseHash: string) {
        await this.modDbReady();

        await this.constellation!.bds!.effacerÉlémentDeTableauParClef({
            idBd: this.modDbAddress!,
            clefTableau: BLOCKED_RELEASES_TABLE_KEY,
            empreinteÉlément: releaseHash
        });
    }
    
    async trustSite(siteModDb: string) {
        await this.modDbReady();

        await this.constellation!.bds!.ajouterÉlémentÀTableauParClef({
            idBd: this.modDbAddress!,
            clefTableau: TRUSTED_SITES_TABLE_KEY,
            vals: {[TRUSTED_SITES_MOD_DB_COL]: siteModDb}
        })
    }

    async untrustSite(siteHash: string) {
        await this.modDbReady();
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