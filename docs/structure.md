# Summary of Orbiter
Status legend:
🍓 Not implemented 
🍊 Implemented in Constellation
🍋 Implemented in Orbiter API
🍏 Implemented in Orbiter GUI

## Overall structure
* 🍏 Site owners create site-specific access databases (swarms; one for releases and one for collections)
* 🍊 Site users create releases and collections of releases
* 🍏 Releases have a name, a file cid, an author, a licence, and a thumbnail.
* 🍋 Collections have a name, an author, and a list of releases

### Site owners can 
* 🍊 invite other site owners
* 🍊 make the site open (exclude people you don't like) or private (invite people you do like)
* 🍏 block content by cid (irrespective of whether the contributor is invited or not)
* 🍏 choose other sites to trust (whose content will also automatically be included on the site)

### Users can
* 🍏 upload releases and collections
* 🍊 add devices to their account
* 🍋 change their own name, profile picture, and contact info
* 🍊 block or trust other users


### Underlying technology stack
All data is shared through IPFS and libp2p. libp2p is responsible for peer-to-peer networking.
Data is structured through [Constellation's](https://docu.réseau-constellation.ca) databases functionalities, which uses orbit-db to bring mutable databases to immutable IPFS.
