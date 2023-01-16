[![Contributors](https://img.shields.io/opencollective/all/riffcc?style=flat-square)](https://opencollective.com/riffcc)

# Riff.CC "Orbiter"
A proof-of-concept version of Riff.CC, implemented using OrbitDB, Constellation, IPFS and other tools. Funding provided via [OpenCollective](https://opencollective.com/riffcc).

## Getting started
* Install dependencies:

```
yarn
```

* Run the application in development mode (with hot reloading)

```
yarn dev
```

* Visit the application in your browser, generate a moderation database, copy the parameters the application gives you, and copy them to `./.env.local`

* Stop and re-run the application to apply the new moderation database.

## Deploying to production

Compile and minify the application:

```
yarn build
```

Then deploy the bundle of HTML/CSS/JS that is produced.

## Customize configuration

See [Configuration Reference](https://vitejs.dev/config/).

## Credits
Authored by [@julienmalard](https://github.com/julienmalard), [@Zorlin](https://github.com/Zorlin), and the Riff.CC Project.
