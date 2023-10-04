import {
  RELEASES_AUTHOR_COLUMN,
  RELEASES_FILE_COLUMN,
  RELEASES_METADATA_COLUMN,
  RELEASES_NAME_COLUMN,
  RELEASES_THUMBNAIL_COLUMN,
  RELEASES_TYPE_COLUMN,
} from '../consts';
import type Orbiter from '../orbiter';

const clearData = async () => {
  localStorage.clear();
  if (indexedDB.databases) {
    const indexedDbDatabases = await indexedDB.databases();
    await Promise.all(
      indexedDbDatabases.map(db => {
        if (db.name) indexedDB.deleteDatabase(db.name);
      }),
    );
  }
};

export const loadStubData = async (app: Orbiter) => {
  await clearData();

  await app.changeName({name: 'Me !', language: 'en'});

  const audioFile = (await import('../../../../../../tests/devData/06-yy_ch01_l01_d01.mp3'))
    .default;
  console.log({audioFile});

  const audioCid = await app.constellation.ajouterÀSFIP({
    fichier: audioFile,
  });

  const thumbnailFile = new Uint8Array(URL.createObjectURL(new Blob('src/assets/logo.svg')));
  console.log({thumbnailFile});
  const thumbnailCid = await app.constellation.ajouterÀSFIP({
    fichier: thumbnailFile,
  });
  await app.addRelease({
    [RELEASES_NAME_COLUMN]: 'Famous song',
    [RELEASES_AUTHOR_COLUMN]: 'I. B. Astar',
    [RELEASES_THUMBNAIL_COLUMN]: {cid: thumbnailCid, ext: 'svg'},
    [RELEASES_FILE_COLUMN]: {cid: audioCid, ext: 'mp3'},
    [RELEASES_METADATA_COLUMN]: 'With an open-access licence, of course.',
    [RELEASES_TYPE_COLUMN]: 'audio',
  });
};
