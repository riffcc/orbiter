import { App } from "vue"
import RiffApp from "./riff"

export default {
  install: (app: App) => {
    const riffApp = new RiffApp({
      modDbAddress: import.meta.env.VITE_MOD_BD_ADDRESS,
    });
    app.config.globalProperties.$riff = riffApp

    app.provide('riff', riffApp)
  }
}
