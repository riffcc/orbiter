[![Contributors](https://img.shields.io/opencollective/all/riffcc?style=flat-square)](https://opencollective.com/riffcc)

# Riff.CC "Orbiter"
A proof-of-concept version of Riff.CC, implemented using OrbitDB, Constellation, IPFS and other tools. Funding provided via [OpenCollective](https://opencollective.com/riffcc).

## Getting started
Orbiter will work on any standard Linux distribution where standard utilities like a webserver and Node.JS are available, but our instructions specifically cover the latest LTS releases of Ubuntu and Debian only. Ask us (or submit a PR) if you want any others to be added.

### Installation - Debian and Ubuntu
* Install the necessary dependencies by running the following command as root:
```
# apt install libgtk-3-0 libgbm1 libasound2 libatk1.0-0 git
```

* Install Node.JS - we suggest using the NodeSource installation guide (https://github.com/nodesource/distributions#installation-instructions), with $NODE_MAJOR set to 20.

* Install Yarn once Node.JS is installed:
```
npm install -g yarn
```

* Clone Orbiter's GitHub repository:
```
git clone https://github.com/riffcc/orbiter.git
```

* Set up yarn and its dependencies in Orbiter's directory:
```
cd orbiter
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
pnpm build
```

Then deploy the bundle of HTML/CSS/JS that is produced.

## Customize configuration

See [Configuration Reference](https://vitejs.dev/config/).

## Credits
Authored by [@julienmalard](https://github.com/julienmalard), [@Zorlin](https://github.com/Zorlin), and the Riff.CC Project.


## Sponsors
Thank you to our sponsors, who have generously provided funding for the development of the Riff.CC Project:

* [Money Every 3 Days](http://moneyevery3days.com/)
