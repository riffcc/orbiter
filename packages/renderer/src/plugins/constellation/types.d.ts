declare module '@vue/runtime-core' {
  import type {MandataireClientConstellation} from '@constl/mandataire';
  interface ComponentCustomProperties {
    $constl: MandataireClientConstellation;
  }
}

export {};
