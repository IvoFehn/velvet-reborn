// src/types.ts

export interface SingleRule {
  title: string;
  description: string;
  additionalNote?: string;
}

export interface DringlichkeitObjekt {
  title: string;
  description: string;
  additionalNote?: string;
}

export interface OrgasmusWithNote {
  option: string;
  additionalNote: string;
}

export interface LochObjekt {
  additionalNote: string;
  mouth: "Volle Bereitschaft";
  pussy: {
    title: string;
    tags: string[];
  };
  ass: {
    title: string;
    tags: string[];
  };
}

export interface SingleCondomObject {
  title: string;
  amount: number;
}

export interface OrtItem {
  title: string;
  additionalNote: string;
}

export interface SinglePose {
  id: string;
  title: string;
  description: string;
  img: string;
  additionalNote: string;
}

export interface PoseObject {
  chosenPose: SinglePose;
  additionalNote: string;
}

export interface SingleToy {
  title: string;
  amount: number;
}

export interface ToyObject {
  additionalNote: string;
  mouth: SingleToy[];
  pussy: SingleToy[];
  ass: SingleToy[];
}

export interface VorSexObjekt {
  title: string;
  description: string;
  additionalNote: string;
}

export interface OutfitWithNote {
  outfit: string;
  additionalNote: string;
}

export interface GeneratorData {
  _id?: string;
  status: "NEW" | "ACCEPTED" | "PENDING" | "DECLINED" | "DONE" | "FAILED";
  pose: PoseObject;
  outfit: string | OutfitWithNote; // Unterstützt beide Formate für Kompatibilität
  orgasmus: string | OrgasmusWithNote; // Unterstützt beide Formate für Kompatibilität
  kondome: SingleCondomObject[];
  toys: ToyObject;
  regeln: SingleRule[];
  loch: LochObjekt;
  vorSex: VorSexObjekt[];
  dringlichkeit: DringlichkeitObjekt;
  ort: OrtItem | null;
  iteratoren: VorSexObjekt[];
  interval: Dayjs[];
  gold: number;
  exp: number;
  blueBalls: boolean;
  alreadyChangeRequested: boolean;
  alreadyDeclineRequested: boolean;
  createdAt?: string;
}
export interface GoldWeights {
  obedience: number;
  vibeDuringSex: number;
  vibeAfterSex: number;
  orgasmIntensity: number;
  painlessness: number;
  ballsWorshipping: number;
  cumWorshipping: number;
  didEverythingForHisPleasure: number;
}
