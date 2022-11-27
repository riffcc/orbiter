import { EventEmitter } from "events";
import { v4 as uuidv4 } from "uuid";

type offFunction = () => Promise<void>
interface Release {
    CID: string;
    thumbnail: string;
    metadata: string;
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

    async addRelease(r: Release) {
        this.state.releases.push(r)
        console.log(this.state.releases)
        this.events.emit("releasesChanged", this.state.releases);
    }

    async removeRelease(cid: string) {
        this.state.releases = this.state.releases.filter(r=>r.CID !== cid)
        this.events.emit("releasesChanged", this.state.releases);
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