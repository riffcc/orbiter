import {GestionnaireFenêtres} from '@constl/mandataire-electron-principal';

const enDéveloppement = import.meta.env.DEV;

const importationIPA = import('@constl/ipa');
const importationServeur = import('@constl/serveur');

// Avec ça, on peut spécifier le dossier Constellation dans les tests
const opts = process.env.DOSSIER_CONSTL ? {dossier: process.env.DOSSIER_CONSTL} : undefined;

export const gestionnaireFenêtres = new GestionnaireFenêtres({
  enDéveloppement,
  importationIPA,
  importationServeur,
  journal: enDéveloppement ? console.log : undefined,
  opts,
});
