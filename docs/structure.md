

#
Site owners create site-specific access databases (swarms; one for releases and one for collections)
Site users create releases and collections of releases
Releases have a name, a file cid, an author, a licence, and a thumbnail.
Collections have a name, an author, and a list of releases

Site owners can 
* invite other site owners
* make the site open (exclude people you don't like) or private (invite people you do like)
* block content by cid (irrespective of whether the contributor is invited or not)

Users can
* upload releases and collections
* add devices to their account
* change their own name, profile picture, and contact info




Data is structured through Constellation, which uses orbit-db to bring mutable databases to immutable IPFS.
All data is shared through IPFS and libp2p. libp2p is responsible for peer-to-peer networking.
