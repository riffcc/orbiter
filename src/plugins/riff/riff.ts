import { EventEmitter } from "events";
import { v4 as uuidv4 } from "uuid";

type offFunction = () => Promise<void>
export interface Release {
    CID: string;
    thumbnail: string;
    metadata: string;
    author: string;
}

export default class Riff {
    state: {
        account?: string;
        name?: string;
        releases: Release[];
        trustedSites: string[];
        blockedCIDs: string[];
        blockedUsers: [];
    };
    events: EventEmitter

    constructor () {
        this.events = new EventEmitter();
        this.state = {
            releases: [],
            trustedSites: [],
            blockedCIDs: [],
            blockedUsers: []
        }

        this.state.account = localStorage.getItem("accountID") || undefined
        this.events.emit("accountChanged", this.state.account)
    }

    async onAccountChange (f: (account?: string) => void): Promise<offFunction> {
        this.events.on("accountChanged", f)
        f(this.state.account)

        return async () => {
            this.events.off("accountChanged", f)
        }
    }

    async onNameChange (f: (name?: string) => void): Promise<offFunction> {
        this.events.on("nameChanged", f)
        f(this.state.name)

        return async () => {
            this.events.off("nameChanged", f)
        }
    }

    async onReleasesChange(f: (releases?: Release[]) => void): Promise<offFunction> {
        this.events.on("releasesChanged", f)
        f(this.state.releases)

        return async () => {
            this.events.off("releasesChanged", f)
        }
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
        this.state.releases = [...this.state.releases, r]
        this.events.emit("releasesChanged", this.state.releases);
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

    async changeName(name?: string): Promise<void> {
        this.state.name = name
        this.events.emit("nameChanged", this.state.name)
    }

    async setupAccount(): Promise<void> {
        const account = uuidv4()
        this.state.account = account
        localStorage.setItem("accountID", account)
        this.events.emit("accountChanged", this.state.account)
    }

    async deleteAccount(): Promise<void> {
        this.state.account = undefined
        localStorage.removeItem("accountID")
        this.events.emit("accountChanged", this.state.account)
    }
}