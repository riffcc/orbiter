import { EventEmitter } from "events";
import { v4 as uuidv4 } from "uuid";

type offFunction = () => Promise<void>

export default class Riff {
    account: string | null;
    events: EventEmitter

    constructor () {
        this.events = new EventEmitter();

        this.account = localStorage.getItem("accountID")
        this.events.emit("accountChanged", this.account)
    }

    async onAccountChange (f: (account: string | null) => void): Promise<offFunction> {
        this.events.on("accountChanged", f)
        f(this.account)

        return async () => {
            this.events.off("accountChanged", f)
        }
    }

    async setupAccount(): Promise<void> {
        const account = uuidv4()
        this.account = account
        localStorage.setItem("accountID", account)
        this.events.emit("accountChanged", this.account)
    }

    async deleteAccount(): Promise<void> {
        this.account = null
        localStorage.deleteItem("accountID")
        this.events.emit("accountChanged", this.account)
    }
}