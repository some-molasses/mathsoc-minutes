import { generateTags as generateFeatures } from "./motion-features";

// Source - https://stackoverflow.com/a/51399781
// Posted by Will Madden, modified by community. See post 'Timeline' for change history
// Retrieved 2026-03-31, License - CC BY-SA 4.0

type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type FeatureType = keyof Motion["features"];
export type FeatureValue = ArrayElement<MotionFeatures[keyof MotionFeatures]>;

export interface MotionFeature {
  type: FeatureType;
  values: string[];
}

export const ORGANIZATIONS = [
  "PMC",
  "CSC",
  "DDC",
  "DSC",
  "FARMSA",
  "Stats Club",
  "ActSci Club",
  "mathNEWS",
  "MathSoc Cartoons",
];
export type Organization = ArrayElement<typeof ORGANIZATIONS>;

export const MEETING_BODIES = ["Council", "Board", "General meeting"];
export type MeetingBody = ArrayElement<typeof MEETING_BODIES>;

export const MONETARY_RELATIONS = ["Monetary", "Non-monetary"];
export type MonetaryRelation = ArrayElement<typeof MONETARY_RELATIONS>;

export type MotionFeatures = {
  organizations: Organization[];
  body: MeetingBody[];
  monetaryRelation: MonetaryRelation[];
};

export class Motion {
  readonly id!: string;
  readonly meetingId!: string;
  readonly motionNumber!: string;
  readonly date!: string;
  readonly title!: string;
  readonly body!: string;

  readonly features: MotionFeatures;

  constructor(params: {
    id: string;
    meetingId: string;
    motionNumber: string;
    date: string;
    title: string;
    body: string;
  }) {
    Object.assign(this, params);
    this.features = generateFeatures(this);
  }

  get textContents(): string {
    return this.title + "\n" + this.body;
  }

  get isPreamble(): boolean {
    return this.motionNumber.startsWith("1");
  }

  toJSON() {
    return {
      ...this,
      date: new Date(this.date).toISOString(),
      isPreamble: this.isPreamble,
    };
  }
}
