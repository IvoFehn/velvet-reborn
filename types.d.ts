export type SinglePose = {
  id: string;
  title: string;
  description: string;
  img: string;
  additionalNote: string;
};

export type PoseObject = {
  chosenPose: SinglePose;
  additionalNote: string;
};

export type SingleCondomObject = {
  title: string;
  amount: number;
};

export type SingleToy = {
  title: string;
  amount: number;
};

export type ToyObject = {
  additionalNote: string;
  mouth: SingleToy[];
  pussy: SingleToy[];
  ass: SingleToy[];
};

export type SingleRule = {
  title: string;
  description: string;
};

export type LochDetail = {
  title: string;
  tags: string[];
};

export type LochObjekt = {
  mouth: "Volle Bereitschaft";
  ass: LochDetail;
  pussy: LochDetail;
  additionalNote: string;
};

export type DringlichkeitObjekt = {
  title: string;
  description: string;
};

export type VorSexObjekt = {
  title: string;
  description: string;
  additionalNote: string;
};

export type OrtItem = {
  title: string;
  additionalNote: string;
};

export interface GeneratorData {
  _id?: string;
  status: "NEW" | "ACCEPTED" | "PENDING" | "DECLINED" | "DONE" | "FAILED";
  pose: PoseObject;
  outfit: string;
  orgasmus: string;
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

// types.ts
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
