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
