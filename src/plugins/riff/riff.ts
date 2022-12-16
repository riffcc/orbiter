import { EventEmitter, once } from "events";
import ClientConstellation from "@constl/ipa/dist/client";
import { tableaux } from "@constl/ipa";

type offFunction = () => Promise<void>
export type Release = {
    CID: string;
    thumbnail: string;
    metadata: string;
    author: string;
}

export default class Riff {
    modDbAddress?: string

    constellation?: ClientConstellation
    events: EventEmitter

    constructor ({
        modDbAddress,
    }: {
        modDbAddress?: string;
    }) {
        this.events = new EventEmitter();
        
        this.modDbAddress = modDbAddress;
        
        // Constellation is a big module to load, so load it asynchronously to ensure fast page load
        const ConstellationModule = import("@constl/ipa")
        ConstellationModule.then(API => {
            this.constellation = API.proxy.ipa.générerProxyProc();
            this.events.emit("ready")
        })
    }

    async ready() {
        // Fake longer load for dev for now, as is likely in production
        const host = window?.location?.host
        if (host && host.startsWith("127.0.0.1")) {
            await new Promise(resolve => setTimeout(resolve, 3000))
        }

        if (!this.constellation) {
            await once(this.events, "ready")
        }
    }

    async generateModDb(): Promise<string> {
        await this.ready();

        return await this.constellation!.bds!.créerBdDeSchéma({
            schéma: {
                licence: "ODbl-1_0",
                tableaux: [
                    {
                        cols: [
                            {
                                idVariable: "",
                                idColonne: "site mod db address"
                            }
                        ],
                        clef: "trusted sites"
                    },
                    {
                        cols: [
                            {
                                idVariable: "",
                                idColonne: "cid"
                            }
                        ],
                        clef: "blocked cids"
                    },
                    {
                        cols: [
                            {
                                idVariable: "",
                                idColonne: "member account id"
                            },
                            {
                                idVariable: "",
                                idColonne: "status"
                            }
                        ],
                        clef: "member moderation"
                    }
                ]
            }
        });
    }

    setModDb(id: string) {
        if (this.modDbAddress) throw new Error(
            "Cannot change moderation DB address after Riff initialisation. Sorry."
            );

        this.modDbAddress = id;
        this.events.emit("mod db changed")
    }

    async onModDbChange(f: (id?: string) => void): Promise<offFunction> {
        const fFollow = () => f(this.modDbAddress);

        this.events.on("mod db changed", fFollow);
        return async () => {
            this.events.off("mod db changed", fFollow)
        };
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

    async onReleasesChange(f: (releases?: Release[]) => void): Promise<offFunction> {
        await this.ready()
        const { fOublier } = await this.constellation!.réseau!.suivreÉlémentsDeTableauxUniques({
            motClefUnique,
            clef,
            f,
            nBds: 100
        })
        
        return fOublier;
    }

    async onBlockedReleasesChange(f: (releases?: string[]) => void): Promise<offFunction> {
        this.events.on("blockedReleasesChanged", f)
        f(this.state.blockedCIDs)

        return async () => {
            this.events.off("blockedReleasesChanged", f)
        }
    }

    async onTrustedSitesChange(f: (releases?: string[]) => void): Promise<offFunction> {
        this.events.on("trustedSitesChanged", f)
        f(this.state.trustedSites)

        return async () => {
            this.events.off("trustedSitesChanged", f)
        }
    }

    async addRelease(r: Release) {
        await this.constellation.bds!.ajouterÉlémentÀTableauUnique({
            schémaBd,
            clefTableau,
            motClefUnique,
            vals: r
        });
    }

    async removeRelease(cid: string) {
        this.state.releases = this.state.releases.filter(r=>r.CID !== cid)
        this.events.emit("releasesChanged", this.state.releases);
    }

    async blockRelease(cid: string) {
        this.state.blockedCIDs = [...new Set([...this.state.blockedCIDs, cid])]
        this.events.emit("blockedReleasesChanged", this.state.blockedCIDs);
    }

    async unblockRelease(cid: string) {
        this.state.blockedCIDs = this.state.blockedCIDs.filter(x=>x!==cid)
        this.events.emit("blockedReleasesChanged", this.state.blockedCIDs);
    }

    
    async trustSite(siteId: string) {
        this.state.trustedSites = [...new Set([...this.state.trustedSites, siteId])]
        this.events.emit("trustedSitesChanged", this.state.trustedSites);
    }

    async untrustSite(site: string) {
        this.state.trustedSites = this.state.trustedSites.filter(x=>x!==site)
        this.events.emit("trustedSitesChanged", this.state.trustedSites);
    }

    async changeName({ name, language }: {name?: string, language: string}): Promise<void> {
        if (name)
            await this.constellation.profil!.sauvegarderNom({ langue: language, nom: name})
        else
            await this.constellation.profil!.effacerNom({ langue: language })
    }

    async deleteAccount(): Promise<void> {
        console.error("Not implemented")
        // await this.constellation.effacerCompte()
    }
}