import {GestionnaireFenêtres} from '@constl/mandataire-electron-principal';

const enDéveloppement = process.env.NODE_ENV !== 'production';

const importationIPA = import('@constl/ipa');
const importationServeur = import('@constl/serveur');

export const gestionnaireFenêtres = new GestionnaireFenêtres({
  enDéveloppement,
  importationIPA,
  importationServeur,
});
