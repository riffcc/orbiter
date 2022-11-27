import { App } from "vue"
import RiffApp from "./riff"

export default {
  install: (app: App) => {
    const riffApp = new RiffApp()
    app.config.globalProperties.$riff = riffApp

    app.provide('riff', riffApp)
  }
}
