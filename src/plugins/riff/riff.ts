import { EventEmitter, once } from "events";
import ClientConstellation, { bds, réseau, tableaux, valid } from "@constl/ipa";
import { 
    BLOCKED_RELEASES_TABLE_KEY, 
    BLOCKED_RELEASE_CID_COL, 
    RELEASES_AUTHOR_COLUMN, 
    RELEASES_CID_COLUMN, 
    RELEASES_DB_TABLE_KEY, 
    TRUSTED_SITES_TABLE_KEY, 
    TRUSTED_SITES_MOD_DB_COL, 
    MEMBER_ID_COL,
    MEMBER_STATUS_COL
} from "./consts";
import { VariableIds } from "./types";

type offFunction = () => Promise<void>
export type Release = {
    CID: string;
    thumbnail: string;
    metadata: string;
    author: string;
}

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
            this.constellation = API.proxy.ipa.générerProxyProc();
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

        const modDbId = await this.constellation!.bds!.créerBdDeSchéma({
            schéma: {
                licence: "ODbl-1_0",
                tableaux: [
                    {
                        cols: [
                            {
                                idVariable: trustedSitesVariableId,
                                idColonne: TRUSTED_SITES_MOD_DB_COL
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
            blockedCidsVariableId,
            memberIdVariableId,
            memberStatusVariableId,
            riffSwarmId,
            releasesCidVar,
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

    async onModDbSet(f: (id?: string) => void): Promise<offFunction> {
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

    async onAccountExists(f: (exists: boolean) => void): Promise<offFunction> {
        // We'll consider that an account "exists" if there is a human-readable name associated with it.
        return await this.onNameChange(
            (names) => f(Object.keys(names).length > 0)
        )
    }

    async onAccountChange (f: (account?: string) => void): Promise<offFunction> {
        await this.ready()
        return await this.constellation!.suivreIdBdCompte({ f })
    }

    async onNameChange (f: (name: { [language: string]: string }) => void): Promise<offFunction> {
        await this.ready()
        return await this.constellation!.profil!.suivreNoms({ f })
    }

    async onIsModChange(f: (isMod: boolean) => void): Promise<offFunction> {
        await this.modDbReady();

        return await this.constellation!.suivrePermissionÉcrire({
            id: this.modDbAddress!,
            f
        })
    }

    async onReleasesChange(f: (releases?: réseau.élémentDeMembre<Release>[]) => void): Promise<offFunction> {
        await this.ready();
        await this.modDbReady();

        const { fOublier } = await this.constellation!.réseau!.suivreÉlémentsDeTableauxUniques({
            idNuéeUnique: this.variableIds!.riffSwarmId,
            clef: RELEASES_DB_TABLE_KEY,
            f,
            nBds: 100
        })
        
        return fOublier;
    }

    async onBlockedReleasesChange(f: (releases?: string[]) => void): Promise<offFunction> {
        await this.modDbReady();

        return await this.constellation!.bds!.suivreDonnéesDeTableauDeClef({
            idBd: this.modDbAddress,
            clefTableau: BLOCKED_RELEASES_TABLE_KEY,
            f
        });
    }

    async onTrustedSitesChange(f: (sites?: string[]) => void): Promise<offFunction> {
        await this.modDbReady();
        
        return await this.constellation!.bds!.suivreDonnéesDeTableauParClef<Release>({
            idBd: this.modDbAddress,
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
                            idColonne: RELEASES_CID_COLUMN
                        },
                        
                    ],
                    clef: RELEASES_DB_TABLE_KEY
                }
            ]
        };

        return releasesDbFormat
    }

    async addRelease(r: Release) {
        await this.modDbReady();

        await this.constellation!.bds!.ajouterÉlémentÀTableauUnique({
            schémaBd: await this.getReleasesDBFormat(),
            idNuéeUnique: this.variableIds!.riffSwarmId,
            clefTableau: RELEASES_DB_TABLE_KEY,
            vals: {
                [RELEASES_CID_COLUMN]: r.CID,
                [RELEASES_AUTHOR_COLUMN]: r.author,
            }
        });
    }

    async removeRelease(releaseHash: string) {
        await this.modDbReady();

        await this.constellation!.bds!.effacerÉlémentDeTableauParClef({
            schémaBd: await this.getReleasesDBFormat(),
            idNuéeUnique: this.variableIds!.riffSwarmId,
            clefTableau: RELEASES_DB_TABLE_KEY,
            empreinte: releaseHash
        });
    }

    async blockRelease(cid: string) {
        await this.modDbReady();

        await this.constellation!.bds!.ajouterÉlémentÀTableauParClef({
            idBd: this.modDbAddress,
            clefTableau: BLOCKED_RELEASES_TABLE_KEY,
            vals: {[BLOCKED_RELEASE_CID_COL]: cid}
        });
    }

    async unblockRelease(releaseHash: string) {
        await this.modDbReady();

        await this.constellation!.bds!.effacerÉlémentDeTableauParClef({
            idBd: this.modDbAddress,
            clefTableau: BLOCKED_RELEASES_TABLE_KEY,
            empreinte: releaseHash
        });
    }
    
    async trustSite(siteModDb: string) {
        await this.modDbReady();

        await this.constellation!.bds!.ajouterÉlémentÀTableauParClef({
            idBd: this.modDbAddress,
            clefTableau: TRUSTED_SITES_TABLE_KEY,
            vals: {[TRUSTED_SITES_MOD_DB_COL]: siteModDb}
        })
    }

    async untrustSite(siteHash: string) {
        await this.modDbReady();
        await this.constellation!.bds!.effacerÉlémentDeTableauParClef({
            idBd: this.modDbAddress,
            clefTableau: TRUSTED_SITES_TABLE_KEY,
            empreinte: siteHash
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